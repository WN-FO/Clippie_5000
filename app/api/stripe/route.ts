import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

// Specify Node.js runtime for this API route
export const runtime = 'nodejs';

const settingsUrl = absoluteUrl("/settings");

export async function GET() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: subscriptionData } = await supabaseClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (subscriptionData?.stripe_customer_id) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: subscriptionData.stripe_customer_id,
        return_url: settingsUrl
      });

      return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: session.user.email,
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "Clippie Pro",
              description: "Unlimited AI Generations"
            },
            unit_amount: 2000,
            recurring: {
              interval: "month"
            }
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    });

    return new NextResponse(JSON.stringify({ url: stripeSession.url }));
  } catch (error) {
    console.log("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
