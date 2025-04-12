import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import prismadb from "@/lib/prismadb";
import { SubscriptionPlan, PLANS } from "@/constants/subscription-plans";

const DAY_IN_MS = 86_400_000;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function getUserId() {
  try {
    const cookieStore = cookies();
    const supabaseToken = cookieStore.get('sb-access-token')?.value;
    
    if (!supabaseToken) return null;
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(supabaseToken);
    
    if (error || !user) return null;
    
    return user.id;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}

// Check user's subscription status
export async function checkSubscription() {
  const userId = await getUserId();

  if (!userId) {
    return false;
  }

  const userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripePriceId: true,
    },
  });

  if (!userSubscription) {
    return false;
  }

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return !!isValid;
}

// Get user's subscription data
export async function getUserSubscription(userId?: string | null) {
  if (!userId) {
    const id = await getUserId();
    userId = id;
  }

  if (!userId) {
    return null;
  }

  // Find or create the user subscription record
  let userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId: userId,
    },
  });

  // If no subscription record exists, create a new one with default FREE plan
  if (!userSubscription) {
    userSubscription = await prismadb.userSubscription.create({
      data: {
        userId: userId,
        minutesLimit: PLANS.FREE.minutesLimit,
      },
    });
  }

  return userSubscription;
}

// Get user's subscription tier
export async function getUserPlan(userId?: string): Promise<SubscriptionPlan> {
  if (!userId) {
    const id = await getUserId();
    userId = id || undefined;
  }

  if (!userId) {
    return "FREE";
  }

  const userSubscription = await getUserSubscription(userId);

  if (!userSubscription || !userSubscription.stripePriceId) {
    return "FREE";
  }

  // Check if the subscription is still valid
  const isValid = userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  if (!isValid) {
    return "FREE";
  }

  // Determine the plan based on the stripe price ID
  if (userSubscription.stripePriceId === PLANS.PRO.stripePriceId) {
    return "PRO";
  } else if (userSubscription.stripePriceId === PLANS.CREATOR.stripePriceId) {
    return "CREATOR";
  }

  return "FREE";
}

// Check if user has any minutes left in their plan
export async function hasAvailableMinutes(userId?: string): Promise<boolean> {
  if (!userId) {
    const id = await getUserId();
    userId = id || undefined;
  }

  if (!userId) {
    return false;
  }

  const userSubscription = await getUserSubscription(userId);
  
  if (!userSubscription) {
    return false;
  }

  const plan = await getUserPlan(userId);
  const minutesLimit = PLANS[plan].minutesLimit;
  
  return userSubscription.minutesUsed < minutesLimit;
}

// Get user's remaining minutes
export async function getRemainingMinutes(userId?: string): Promise<number> {
  if (!userId) {
    const id = await getUserId();
    userId = id || undefined;
  }

  if (!userId) {
    return 0;
  }

  const userSubscription = await getUserSubscription(userId);
  
  if (!userSubscription) {
    return 0;
  }

  const plan = await getUserPlan(userId);
  const minutesLimit = PLANS[plan].minutesLimit;
  
  return Math.max(minutesLimit - userSubscription.minutesUsed, 0);
}
