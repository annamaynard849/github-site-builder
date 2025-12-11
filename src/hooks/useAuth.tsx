import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthSecurity } from '@/lib/security';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session first
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        
        // Validate session security
        if (session && !(await AuthSecurity.validateSession(session))) {
          // Session is invalid/expired, sign out
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Update state synchronously first
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Defer async session validation to avoid Supabase client deadlock
        if (session) {
          setTimeout(async () => {
            const isValid = await AuthSecurity.validateSession(session);
            if (!isValid) {
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
            }
          }, 0);
        }
      }
    );

    // Get initial session
    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Clear local state immediately
      setSession(null);
      setUser(null);
      
      // Attempt to sign out from server (may fail if session already invalid)
      const { error } = await supabase.auth.signOut();
      
      // Clear localStorage as fallback
      localStorage.removeItem('supabase.auth.token');
      
      if (error && error.message !== 'Session not found') {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Ensure local state is cleared even on error
      setSession(null);
      setUser(null);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}