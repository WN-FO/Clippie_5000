import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with the database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Client for browser usage (auth)
export const supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Admin client for server usage (when higher privileges are needed)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

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
    const { data: videosBucket, error: videosBucketError } = await supabaseAdmin
      .storage
      .getBucket(STORAGE_BUCKETS.VIDEOS);
    
    if (!videosBucket) {
      await supabaseAdmin.storage.createBucket(STORAGE_BUCKETS.VIDEOS, {
        public: false,
      });
    }

    // Create clips bucket if it doesn't exist
    const { data: clipsBucket, error: clipsBucketError } = await supabaseAdmin
      .storage
      .getBucket(STORAGE_BUCKETS.CLIPS);
    
    if (!clipsBucket) {
      await supabaseAdmin.storage.createBucket(STORAGE_BUCKETS.CLIPS, {
        public: true, // Clips can be public for easy sharing
      });
    }

    // Create subtitles bucket if it doesn't exist
    const { data: subtitlesBucket, error: subtitlesBucketError } = await supabaseAdmin
      .storage
      .getBucket(STORAGE_BUCKETS.SUBTITLES);
    
    if (!subtitlesBucket) {
      await supabaseAdmin.storage.createBucket(STORAGE_BUCKETS.SUBTITLES, {
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
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
} 