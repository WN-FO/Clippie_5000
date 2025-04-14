import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { PLANS, getPlanFromStripeId } from "@/constants/subscription-plans";
export const dynamic = 'force-dynamic';

// Specify Node.js runtime for this API route
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        
        if (!checkoutSession?.metadata?.userId) {
          return new NextResponse("User id is required", { status: 400 });
        }

        if (!checkoutSession.subscription) {
          return new NextResponse("Subscription is required", { status: 400 });
        }

        const subscription = await stripe.subscriptions.retrieve(
          checkoutSession.subscription as string
        ) as Stripe.Subscription;

        await prismadb.userSubscription.create({
          data: {
            userId: checkoutSession.metadata.userId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              (subscription as any).current_period_end * 1000
            ),
          },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        if (!subscriptionId) {
          return new NextResponse("Subscription ID is required", { status: 400 });
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;
        
        // Get the plan details based on the price ID
        const plan = getPlanFromStripeId(priceId);

        await prismadb.userSubscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            minutesLimit: plan.minutesLimit,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        if (!subscriptionId) {
          return new NextResponse("Subscription ID is required", { status: 400 });
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
        
        await prismadb.userSubscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted":
      case "customer.subscription.paused": {
        const subscription = event.data.object as Stripe.Subscription;
        
        await prismadb.userSubscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
          },
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.resumed": {
        const subscription = event.data.object as Stripe.Subscription;
        
        await prismadb.userSubscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          },
        });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        // Handle refund logic if needed
        // You might want to mark the subscription as refunded or take other actions
        break;
      }

      // Add handlers for other events as needed
      case "customer.subscription.created":
      case "customer.source.updated":
      case "customer.updated":
      case "customer.created":
      case "customer.deleted":
      case "customer.discount.created":
      case "customer.discount.deleted":
      case "customer.discount.updated":
      case "customer.source.created":
      case "customer.source.deleted":
      case "customer.source.expiring":
      case "customer.subscription.pending_update_applied":
      case "customer.subscription.pending_update_expired":
      case "customer.subscription.trial_will_end":
      case "customer.tax_id.created":
      case "customer.tax_id.deleted":
      case "customer.tax_id.updated":
      case "payment_method.attached":
      case "payment_method.automatically_updated":
      case "payment_method.detached":
      case "payment_method.updated":
      case "refund.created":
      case "refund.failed":
      case "refund.updated":
      case "subscription_schedule.aborted":
      case "subscription_schedule.canceled":
      case "subscription_schedule.completed":
      case "subscription_schedule.created":
      case "subscription_schedule.expiring":
      case "subscription_schedule.released":
      case "subscription_schedule.updated":
      case "price.created":
      case "price.deleted":
      case "price.updated":
      case "account.updated":
      case "account.external_account.created":
      case "account.external_account.deleted":
      case "account.external_account.updated":
        // Log these events for now, implement specific handlers as needed
        console.log(`Received ${event.type} event`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.log(error);
    return new NextResponse('Webhook Error', { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
