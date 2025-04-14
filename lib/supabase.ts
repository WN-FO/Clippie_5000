import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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

const getSupabaseServiceRoleKey = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return key;
};

// Client for browser usage (auth)
export const createBrowserSupabaseClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('createBrowserSupabaseClient must be called on client side');
  }
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
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

// Helper function to initialize storage buckets
export async function initializeStorageBuckets() {
  try {
    // Create videos bucket if it doesn't exist
    const { data: videosBucket, error: videosBucketError } = await createServerSupabaseClient()
      .storage
      .getBucket(STORAGE_BUCKETS.VIDEOS);
    
    if (!videosBucket) {
      await createServerSupabaseClient().storage.createBucket(STORAGE_BUCKETS.VIDEOS, {
        public: false,
      });
    }

    // Create clips bucket if it doesn't exist
    const { data: clipsBucket, error: clipsBucketError } = await createServerSupabaseClient()
      .storage
      .getBucket(STORAGE_BUCKETS.CLIPS);
    
    if (!clipsBucket) {
      await createServerSupabaseClient().storage.createBucket(STORAGE_BUCKETS.CLIPS, {
        public: true, // Clips can be public for easy sharing
      });
    }

    // Create subtitles bucket if it doesn't exist
    const { data: subtitlesBucket, error: subtitlesBucketError } = await createServerSupabaseClient()
      .storage
      .getBucket(STORAGE_BUCKETS.SUBTITLES);
    
    if (!subtitlesBucket) {
      await createServerSupabaseClient().storage.createBucket(STORAGE_BUCKETS.SUBTITLES, {
        public: true, // Subtitles need to be accessible for players
      });
    }

    console.log('Storage buckets initialized successfully');
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
  }
}

// Helper to get storage URL for a file
export function getStorageUrl(bucket: string, path: string): string {
  return `${getSupabaseUrl()}/storage/v1/object/public/${bucket}/${path}`;
} 