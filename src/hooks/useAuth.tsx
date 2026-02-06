import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'staff' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isVerifyingAccess: boolean;
  userRole: UserRole;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
  signInWithGoogle: () => Promise<{ error?: any }>;
  updatePassword: (newPassword: string) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Production domain for all auth redirects
const PRODUCTION_URL = 'https://www.soultrainseatery.com';

// Check if user has any authorized role (admin or staff)
// Returns the role name or null
const checkAccess = async (userId: string, retries = 2): Promise<UserRole> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase
        .rpc('has_any_role', { _user_id: userId });
      
      if (error) {
        console.error(`Access check attempt ${attempt + 1} failed:`, error);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
          continue;
        }
        return null;
      }
      
      if (data === 'admin' || data === 'staff') return data;
      return null;
    } catch (err) {
      console.error(`Access check attempt ${attempt + 1} error:`, err);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
        continue;
      }
      return null;
    }
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifyingAccess, setIsVerifyingAccess] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Handle password recovery - user clicked reset link in email
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          return;
        }

        // Don't run access check during password recovery flow
        if (isPasswordRecovery) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          setIsVerifyingAccess(true);
          
          setTimeout(async () => {
            const role = await checkAccess(session.user.id);
            
            if (!role) {
              await supabase.auth.signOut();
              toast.error('Access denied. Authorized personnel only.');
              setUser(null);
              setSession(null);
              setUserRole(null);
              setIsVerifyingAccess(false);
              setLoading(false);
              return;
            }
            
            setSession(session);
            setUser(session.user);
            setUserRole(role);
            setIsVerifyingAccess(false);
            setLoading(false);
          }, 0);
          return;
        }
        
        if (event === 'SIGNED_OUT') {
          setUserRole(null);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setIsVerifyingAccess(true);
        const role = await checkAccess(session.user.id);
        
        if (!role) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setUserRole(null);
          setIsVerifyingAccess(false);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session.user);
        setUserRole(role);
        setIsVerifyingAccess(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsVerifyingAccess(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast.error(error.message);
      setIsVerifyingAccess(false);
      return { error };
    }
    
    const role = await checkAccess(data.user.id);
    
    if (!role) {
      await supabase.auth.signOut();
      toast.error('Access denied. Authorized personnel only.');
      setIsVerifyingAccess(false);
      return { error: { message: 'No access' } };
    }
    
    setUserRole(role);
    toast.success('Signed in successfully');
    setIsVerifyingAccess(false);
    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      setUserRole(null);
      toast.success('Signed out successfully');
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${PRODUCTION_URL}/admin/auth?mode=recovery`
    });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset email sent! Check your inbox.');
    }
    
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${PRODUCTION_URL}/admin`
      }
    });
    
    if (error) {
      toast.error(error.message);
    }
    
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      setIsPasswordRecovery(false);
    }
    return { error };
  };

  const clearPasswordRecovery = () => {
    setIsPasswordRecovery(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isVerifyingAccess,
      userRole,
      isPasswordRecovery,
      clearPasswordRecovery,
      signIn,
      signOut,
      resetPassword,
      signInWithGoogle,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
