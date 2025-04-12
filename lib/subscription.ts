import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";
import { SubscriptionPlan, PLANS } from "@/constants/subscription-plans";

const DAY_IN_MS = 86_400_000;

// Check user's subscription status
export async function checkSubscription() {
  const { userId } = auth();

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
    const { userId: authUserId } = auth();
    userId = authUserId;
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
    const { userId: authUserId } = auth();
    userId = authUserId;
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
    const { userId: authUserId } = auth();
    userId = authUserId;
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
    const { userId: authUserId } = auth();
    userId = authUserId;
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
