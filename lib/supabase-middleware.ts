import { createClient } from '@supabase/supabase-js';

const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return url;
};

const getSupabaseServiceRoleKey = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return key;
};

// Storage bucket names
export const STORAGE_BUCKETS = {
  VIDEOS: 'videos',
  CLIPS: 'clips',
  SUBTITLES: 'subtitles',
};

// Helper to get storage URL for a file
export function getStorageUrl(bucket: string, path: string): string {
  return `${getSupabaseUrl()}/storage/v1/object/public/${bucket}/${path}`;
}

// Create a Supabase client for middleware and edge functions
export const createMiddlewareSupabaseClient = () => {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-vercel-deployment': '1',
      },
    },
  });
}; 