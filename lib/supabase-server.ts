import { createServerClient } from '@supabase/ssr';
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

export const createServerSupabaseClient = () => {
  return createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        get(name: string) {
          return undefined; // Let Supabase handle cookie management
        },
        set(name: string, value: string, options: any) {
          // No-op
        },
        remove(name: string, options: any) {
          // No-op
        },
      },
    }
  );
};

export { STORAGE_BUCKETS, getStorageUrl }; 