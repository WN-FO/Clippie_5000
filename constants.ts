export const MAX_FREE_COUNTS = 5;
export const APP_VERSION = "1.0.0";

// Debug helper
console.log('Environment check:', {
  hasDatabase: !!process.env.DATABASE_URL,
  hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasStripe: !!process.env.STRIPE_SECRET_KEY
});
