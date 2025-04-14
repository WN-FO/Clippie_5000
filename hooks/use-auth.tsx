'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-browser';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Initialize Supabase client
  const [client] = useState(() => {
    try {
      return createClient();
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      return null;
    }
  });

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !client) {
      console.log('Not mounted or no client yet');
      return;
    }

    let ignore = false;

    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await client.auth.getSession();
        if (error) throw error;
        if (!ignore) {
          console.log('Setting initial session:', session);
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (!ignore) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Get initial session
    getInitialSession();

    // Cleanup
    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, [client, mounted]);

  const value = {
    session,
    user,
    loading: loading || !mounted,
    error,
    signIn: async (email: string, password: string) => {
      if (!client) return;
      try {
        setLoading(true);
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      } catch (error) {
        console.error('Sign in error:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },
    signUp: async (email: string, password: string) => {
      if (!client) return;
      try {
        setLoading(true);
        const { error } = await client.auth.signUp({ email, password });
        if (error) throw error;
        router.push('/auth/verify');
      } catch (error) {
        console.error('Sign up error:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },
    signOut: async () => {
      if (!client) return;
      try {
        setLoading(true);
        const { error } = await client.auth.signOut();
        if (error) throw error;
        router.push('/');
      } catch (error) {
        console.error('Sign out error:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },
    resetPassword: async (email: string) => {
      if (!client) return;
      try {
        setLoading(true);
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/update-password`,
        });
        if (error) throw error;
      } catch (error) {
        console.error('Reset password error:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },
    updatePassword: async (password: string) => {
      if (!client) return;
      try {
        setLoading(true);
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        router.push('/dashboard');
      } catch (error) {
        console.error('Update password error:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },
  };

  if (!mounted) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 