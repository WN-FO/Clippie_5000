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
  const [client, setClient] = useState(supabaseClient);
  const router = useRouter();

  // Initialize client on the browser side
  useEffect(() => {
    if (typeof window !== 'undefined' && !client) {
      // If client is null (server side), create it on client side
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
      const browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
      setClient(browserClient);
    }
  }, [client]);

  useEffect(() => {
    // Only run this on the client side with a valid client
    if (typeof window !== 'undefined' && client) {
      const { data: authListener } = client.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      // Get initial session
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

      getInitialSession();

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      // If not on client, just set loading to false
      setLoading(false);
    }
  }, [client]);

  const signIn = async (email: string, password: string) => {
    if (!client) {
      setError(new Error('Authentication client not available'));
      return;
    }
    
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
  };

  const signUp = async (email: string, password: string) => {
    if (!client) {
      setError(new Error('Authentication client not available'));
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await client.auth.signUp({ email, password });
      if (error) throw error;
      // Redirect to email confirmation page or dashboard
      router.push('/auth/verify');
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!client) {
      setError(new Error('Authentication client not available'));
      return;
    }
    
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
  };

  const resetPassword = async (email: string) => {
    if (!client) {
      setError(new Error('Authentication client not available'));
      return;
    }
    
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
  };

  const updatePassword = async (password: string) => {
    if (!client) {
      setError(new Error('Authentication client not available'));
      return;
    }
    
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
  };

  const value = {
    session,
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
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