/**
 * Supabase Edge Function: Stripe Webhook Handler
 *
 * Handles Stripe webhook events for subscription lifecycle management.
 * Updates database when subscriptions are created, updated, or canceled.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno';

// Stripe configuration
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Supabase Admin client (bypasses RLS)
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Map Stripe status to our status
function mapSubscriptionStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    trialing: 'trialing',
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'incomplete',
    incomplete_expired: 'canceled',
  };
  return statusMap[stripeStatus] || 'active';
}

// Extract tier from subscription metadata or price
function extractTier(subscription: Stripe.Subscription): string {
  // First try metadata
  const tierFromMetadata = subscription.metadata?.tier;
  if (tierFromMetadata) {
    return tierFromMetadata;
  }

  // Fall back to price lookup key or product name
  const item = subscription.items.data[0];
  if (item?.price?.lookup_key) {
    const lookupKey = item.price.lookup_key;
    if (lookupKey.includes('pro')) return 'pro';
    if (lookupKey.includes('small_fleet')) return 'small_fleet';
    if (lookupKey.includes('fleet')) return 'fleet';
  }

  // Default to pro if we can't determine
  return 'pro';
}

// Get user ID from Stripe customer
async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  // First check customer metadata
  const customer = await stripe.customers.retrieve(customerId);
  if ('deleted' in customer && customer.deleted) {
    return null;
  }

  const userId = (customer as Stripe.Customer).metadata?.supabase_user_id;
  if (userId) {
    return userId;
  }

  // Fall back to database lookup
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  return data?.id || null;
}

// Handle checkout.session.completed
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Handling checkout.session.completed:', session.id);

  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error('No user_id in checkout session metadata');
    return;
  }

  // The subscription will be created separately via customer.subscription.created
  // But we can update the user's stripe_customer_id if needed
  if (session.customer) {
    await supabaseAdmin
      .from('users')
      .update({
        stripe_customer_id: session.customer as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  }

  console.log('Checkout completed for user:', userId);
}

// Handle customer.subscription.created
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Handling customer.subscription.created:', subscription.id);

  const customerId = subscription.customer as string;
  const userId = await getUserIdFromCustomer(customerId);

  if (!userId) {
    console.error('Could not find user for customer:', customerId);
    return;
  }

  const tier = extractTier(subscription);
  const status = mapSubscriptionStatus(subscription.status);

  // Create subscription record
  const { error: insertError } = await supabaseAdmin
    .from('subscriptions')
    .insert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      tier,
      status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    });

  if (insertError) {
    console.error('Error creating subscription:', insertError);
    return;
  }

  // Update user's subscription tier
  await supabaseAdmin
    .from('users')
    .update({
      subscription_tier: tier,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  console.log('Subscription created for user:', userId, 'tier:', tier);
}

// Handle customer.subscription.updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Handling customer.subscription.updated:', subscription.id);

  const customerId = subscription.customer as string;
  const userId = await getUserIdFromCustomer(customerId);

  if (!userId) {
    console.error('Could not find user for customer:', customerId);
    return;
  }

  const tier = extractTier(subscription);
  const status = mapSubscriptionStatus(subscription.status);

  // Update subscription record
  const { error: updateError } = await supabaseAdmin
    .from('subscriptions')
    .update({
      tier,
      status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (updateError) {
    console.error('Error updating subscription:', updateError);
    return;
  }

  // Update user's subscription tier if status is active/trialing
  if (status === 'active' || status === 'trialing') {
    await supabaseAdmin
      .from('users')
      .update({
        subscription_tier: tier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  }

  console.log('Subscription updated for user:', userId, 'tier:', tier, 'status:', status);
}

// Handle customer.subscription.deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Handling customer.subscription.deleted:', subscription.id);

  const customerId = subscription.customer as string;
  const userId = await getUserIdFromCustomer(customerId);

  if (!userId) {
    console.error('Could not find user for customer:', customerId);
    return;
  }

  // Update subscription record
  const { error: updateError } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (updateError) {
    console.error('Error updating subscription:', updateError);
  }

  // Downgrade user to free tier
  await supabaseAdmin
    .from('users')
    .update({
      subscription_tier: 'free',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  console.log('Subscription canceled for user:', userId);
}

// Handle invoice.payment_failed
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Handling invoice.payment_failed:', invoice.id);

  const customerId = invoice.customer as string;
  const userId = await getUserIdFromCustomer(customerId);

  if (!userId) {
    console.error('Could not find user for customer:', customerId);
    return;
  }

  const subscriptionId = invoice.subscription as string;

  // Update subscription status to past_due
  if (subscriptionId) {
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);
  }

  // You could also send a notification to the user here
  // or create a record in a payment_failures table

  console.log('Payment failed for user:', userId, 'amount:', invoice.amount_due);
}

// Handle invoice.paid
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Handling invoice.paid:', invoice.id);

  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  // Ensure subscription is marked as active
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId)
    .eq('status', 'past_due'); // Only update if was past_due

  console.log('Invoice paid for subscription:', subscriptionId);
}

serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature header' }),
      { status: 400 }
    );
  }

  try {
    const body = await req.text();

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    console.log('Received webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);

    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 500 }
    );
  }
});
