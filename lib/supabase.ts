'use client';

import { createBrowserClient } from '@supabase/ssr';
import { STORAGE_BUCKETS, getStorageUrl } from './supabase-middleware';

const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return url;
};

const getSupabaseAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return key;
};

// Client for browser usage (auth)
export const createBrowserSupabaseClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('createBrowserSupabaseClient must be called on client side');
  }
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
};

export { STORAGE_BUCKETS, getStorageUrl };

// Re-export storage bucket names and utils from server file
export * from './supabase-server'; 