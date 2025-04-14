import { cookies } from 'next/headers';
import { supabaseAdmin } from './supabase';

export async function getServerSession() {
  try {
    // Using the admin client for server operations
    const { data: { session } } = await supabaseAdmin.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
} 