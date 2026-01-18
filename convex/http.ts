/**
 * HTTP Routes - Webhook handlers
 *
 * Handles external webhooks like Stripe with secure signature verification
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

// ============================================================================
// STRIPE WEBHOOK SIGNATURE VERIFICATION
// ============================================================================

/**
 * Compute HMAC-SHA256 signature for Stripe webhook verification
 * Uses Web Crypto API (available in Convex runtime)
 */
async function computeHmacSha256(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Securely compare two strings in constant time to prevent timing attacks
 */
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Verify Stripe webhook signature
 * Returns the parsed event if valid, throws error if invalid
 */
async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  webhookSecret: string,
  toleranceSeconds: number = 300 // 5 minutes
): Promise<any> {
  // Parse the signature header
  const elements = signatureHeader.split(",");
  const signatureMap: Record<string, string> = {};

  for (const element of elements) {
    const [key, value] = element.split("=");
    if (key && value) {
      signatureMap[key.trim()] = value.trim();
    }
  }

  const timestamp = signatureMap["t"];
  const v1Signature = signatureMap["v1"];

  if (!timestamp || !v1Signature) {
    throw new Error("Invalid signature header format");
  }

  // Check timestamp to prevent replay attacks
  const timestampNum = parseInt(timestamp, 10);
  const currentTime = Math.floor(Date.now() / 1000);

  if (Math.abs(currentTime - timestampNum) > toleranceSeconds) {
    throw new Error("Webhook timestamp outside tolerance window (possible replay attack)");
  }

  // Compute expected signature
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = await computeHmacSha256(webhookSecret, signedPayload);

  // Securely compare signatures
  if (!secureCompare(expectedSignature, v1Signature)) {
    throw new Error("Webhook signature verification failed");
  }

  // Parse and return the event
  return JSON.parse(payload);
}

// ============================================================================
// STRIPE WEBHOOK ENDPOINT
// ============================================================================

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      console.error("Stripe environment variables not configured");
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get signature from header
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      console.error("Missing stripe-signature header");
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const body = await request.text();

      // SECURE: Verify webhook signature using HMAC-SHA256
      const event = await verifyStripeSignature(body, signature, webhookSecret);

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

      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Webhook error:", errorMessage);

      // Return 400 for signature verification failures (don't retry)
      // Return 500 for processing errors (Stripe will retry)
      const isSignatureError = errorMessage.includes("signature") || errorMessage.includes("timestamp");
      return new Response(
        JSON.stringify({ error: isSignatureError ? "Invalid signature" : "Webhook handler failed" }),
        { status: isSignatureError ? 400 : 500, headers: { "Content-Type": "application/json" } }
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
