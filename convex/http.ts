/**
 * HTTP Routes - Webhook handlers
 *
 * Handles external webhooks like Stripe
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

// ============================================================================
// STRIPE WEBHOOK
// ============================================================================

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500 }
      );
    }

    // Get signature from header
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400 }
      );
    }

    try {
      const body = await request.text();

      // In production, verify signature using Stripe SDK
      // For now, parse the event directly (UNSAFE - add verification!)
      const event = JSON.parse(body);

      console.log("Received Stripe webhook:", event.type);

      // Handle different event types
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = session.metadata?.user_id;
          const customerId = session.customer;

          if (userId && customerId) {
            // Update user's Stripe customer ID
            // This would need an internal mutation
            console.log("Checkout completed for user:", userId);
          }
          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object;
          const customerId = subscription.customer;
          const status = mapSubscriptionStatus(subscription.status);
          const tier = extractTier(subscription);

          // Find user by Stripe customer ID and update subscription
          console.log(
            "Subscription updated:",
            subscription.id,
            "status:",
            status,
            "tier:",
            tier
          );

          // In production, call a mutation to update the subscription
          // await ctx.runMutation(api.subscriptions.update, { ... });
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          console.log("Subscription canceled:", subscription.id);
          // Cancel subscription in database
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object;
          console.log("Payment failed for invoice:", invoice.id);
          // Update subscription status to past_due
          break;
        }

        case "invoice.paid": {
          const invoice = event.data.object;
          console.log("Invoice paid:", invoice.id);
          // Ensure subscription is marked as active
          break;
        }

        default:
          console.log("Unhandled webhook event:", event.type);
      }

      return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response(
        JSON.stringify({ error: "Webhook handler failed" }),
        { status: 500 }
      );
    }
  }),
});

// ============================================================================
// HELPERS
// ============================================================================

function mapSubscriptionStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    trialing: "trialing",
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "past_due",
    incomplete: "incomplete",
    incomplete_expired: "canceled",
  };
  return statusMap[stripeStatus] || "active";
}

function extractTier(subscription: any): string {
  // Try metadata first
  const tierFromMetadata = subscription.metadata?.tier;
  if (tierFromMetadata) {
    return tierFromMetadata;
  }

  // Fall back to price lookup key
  const item = subscription.items?.data?.[0];
  if (item?.price?.lookup_key) {
    const lookupKey = item.price.lookup_key;
    if (lookupKey.includes("pro")) return "pro";
    if (lookupKey.includes("small_fleet")) return "small_fleet";
    if (lookupKey.includes("fleet")) return "fleet";
    if (lookupKey.includes("enterprise")) return "enterprise";
  }

  return "pro";
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({
        status: "ok",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

export default http;
