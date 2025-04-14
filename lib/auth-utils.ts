import { cookies } from 'next/headers';
import { createServerSupabaseClient } from './supabase';

export async function getServerSession() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting server session:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
} 