export const PLANS = {
  FREE: {
    name: "Free",
    description: "Basic plan for occasional users",
    minutesLimit: 5,
    maxVideoLength: 5 * 60, // 5 minutes in seconds
    storageDays: 7,
    features: [
      "1 video per month",
      "5 minutes of processing",
      "Basic transcription",
      "Watermarked exports",
      "720p maximum resolution",
      "7-day storage"
    ],
    limitations: [
      "Limited to 5-minute videos",
      "Basic subtitle options only",
      "Watermark on all exports"
    ]
  },
  CREATOR: {
    name: "Creator",
    description: "Perfect for content creators",
    price: 29,
    stripePriceId: process.env.STRIPE_CREATOR_PLAN_ID,
    minutesLimit: 120,
    maxVideoLength: 30 * 60, // 30 minutes in seconds
    storageDays: 365,
    features: [
      "120 minutes of processing per month",
      "30-minute maximum video length",
      "Enhanced subtitle styles",
      "No watermark",
      "1080p exports",
      "365-day storage",
      "Basic subtitle customization"
    ],
    limitations: [
      "Limited to 120 minutes per month",
      "Up to 1080p exports only"
    ]
  },
  PRO: {
    name: "Pro",
    description: "Advanced features for professionals",
    price: 79,
    stripePriceId: process.env.STRIPE_PRO_PLAN_ID,
    minutesLimit: 300,
    maxVideoLength: 60 * 60, // 60 minutes in seconds
    storageDays: 365,
    features: [
      "300 minutes of processing per month",
      "1-hour maximum video length",
      "Advanced subtitle customization",
      "Priority processing",
      "4K exports",
      "365-day storage",
      "Direct social sharing",
      "Premium support"
    ],
    limitations: [
      "Limited to 300 minutes per month"
    ]
  }
};

export const DEFAULT_PLAN = PLANS.FREE;

export function getPlanFromStripeId(stripePriceId?: string | null) {
  if (!stripePriceId) return PLANS.FREE;
  if (stripePriceId === PLANS.CREATOR.stripePriceId) return PLANS.CREATOR;
  if (stripePriceId === PLANS.PRO.stripePriceId) return PLANS.PRO;
  return PLANS.FREE;
}

export type SubscriptionPlan = keyof typeof PLANS;

export function getMinutesUsedPercentage(minutesUsed: number, plan: SubscriptionPlan) {
  const limit = PLANS[plan].minutesLimit;
  return Math.min((minutesUsed / limit) * 100, 100);
}

export function getRemainingMinutes(minutesUsed: number, plan: SubscriptionPlan) {
  const limit = PLANS[plan].minutesLimit;
  const remaining = limit - minutesUsed;
  return Math.max(remaining, 0);
} 