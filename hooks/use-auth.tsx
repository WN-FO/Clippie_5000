'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabase';
import { createBrowserClient } from '@supabase/ssr';

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
    if (typeof window !== 'undefined') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      return createBrowserClient(supabaseUrl, supabaseAnonKey);
    }
    return null;
  });

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !client) return;

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await client.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    getInitialSession();

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [client, mounted]);

  const value = {
    session,
    user,
    loading: loading || !mounted, // Consider not mounted as loading
    error,
    signIn: async (email: string, password: string) => {
      if (!client) return;
      try {
        setLoading(true);
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      } catch (error) {
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
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },
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