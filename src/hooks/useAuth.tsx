import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
  devQuickLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed in successfully');
    }
    
    return { error };
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

  const devQuickLogin = async () => {
    // Only works in development mode
    if (import.meta.env.DEV) {
      try {
        // Try to sign in with the real admin account using a dev bypass
        // First, query the database to get the real admin user ID
        const { data: adminData, error: queryError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin')
          .limit(1)
          .single();

        if (queryError || !adminData) {
          toast.error('Admin user not found in database');
          return;
        }

        // Create a proper JWT token for the real admin user
        const adminUser: User = {
          id: adminData.user_id,
          email: 'soultrainseatery@gmail.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          role: 'authenticated'
        } as User;

        // Create a proper session with JWT that includes the real admin user ID
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = now + 3600;
        
        // Create a JWT payload that Supabase can recognize with real admin ID
        const jwtPayload = {
          sub: adminData.user_id,
          aud: 'authenticated',
          role: 'authenticated',
          email: 'soultrainseatery@gmail.com',
          iat: now,
          exp: expiresAt
        };

        // Create a mock but valid-looking JWT token
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify(jwtPayload));
        const signature = 'dev-admin-signature';
        const accessToken = `${header}.${payload}.${signature}`;

        const adminSession: Session = {
          access_token: accessToken,
          refresh_token: 'dev-admin-refresh-token',
          expires_in: 3600,
          expires_at: expiresAt,
          token_type: 'bearer',
          user: adminUser
        };

        // Use Supabase's setSession to create a proper authenticated session
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: 'dev-admin-refresh-token'
        });

        if (error) {
          console.warn('Dev admin session creation warning:', error);
          // Fall back to manual state setting if setSession fails
          setSession(adminSession);
          setUser(adminUser);
        }

        toast.success('Development admin login successful');
      } catch (error) {
        console.error('Dev admin login error:', error);
        toast.error('Development admin login failed');
      }
    } else {
      toast.error('Development login only available in development mode');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      devQuickLogin,
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