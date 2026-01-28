import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isVerifyingAccess: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
  signInWithGoogle: () => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if user has admin or owner role
const checkAdminAccess = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .limit(1);
    
    if (error) {
      console.error('Error checking admin access:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (err) {
    console.error('Error checking admin access:', err);
    return false;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifyingAccess, setIsVerifyingAccess] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Handle OAuth sign-in (Google) - verify admin access
        if (event === 'SIGNED_IN' && session?.user) {
          setIsVerifyingAccess(true);
          
          // Use setTimeout to avoid Supabase listener deadlock
          setTimeout(async () => {
            const hasAccess = await checkAdminAccess(session.user.id);
            
            if (!hasAccess) {
              await supabase.auth.signOut();
              toast.error('Access denied. Administrator privileges required.');
              setUser(null);
              setSession(null);
              setIsVerifyingAccess(false);
              setLoading(false);
              return;
            }
            
            setSession(session);
            setUser(session.user);
            setIsVerifyingAccess(false);
            setLoading(false);
          }, 0);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setIsVerifyingAccess(true);
        const hasAccess = await checkAdminAccess(session.user.id);
        
        if (!hasAccess) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setIsVerifyingAccess(false);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session.user);
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
    
    // Check if user has admin access
    const hasAccess = await checkAdminAccess(data.user.id);
    
    if (!hasAccess) {
      // Immediately sign them out
      await supabase.auth.signOut();
      toast.error('Access denied. Administrator privileges required.');
      setIsVerifyingAccess(false);
      return { error: { message: 'No admin access' } };
    }
    
    toast.success('Signed in successfully');
    setIsVerifyingAccess(false);
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/admin`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Check your email for the confirmation link');
    }
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed out successfully');
    }
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/admin/auth?mode=reset`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
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
        redirectTo: `${window.location.origin}/admin`
      }
    });
    
    if (error) {
      toast.error(error.message);
    }
    
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isVerifyingAccess,
      signIn,
      signUp,
      signOut,
      resetPassword,
      signInWithGoogle,
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
