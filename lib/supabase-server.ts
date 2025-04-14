import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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

// Admin client for server usage (when higher privileges are needed)
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        'x-vercel-deployment': '1',
      },
    },
  });
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