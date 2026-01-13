/**
 * Supabase Edge Function: Create Stripe Checkout Session
 *
 * Creates a Stripe checkout session for subscription purchases.
 * Handles Pro, Small Fleet, and Fleet tiers with monthly/annual billing.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Stripe configuration
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Price IDs from Stripe Dashboard (set these in your environment)
const PRICE_IDS: Record<string, Record<string, string>> = {
  pro: {
    monthly: Deno.env.get('STRIPE_PRICE_PRO_MONTHLY') || '',
    annual: Deno.env.get('STRIPE_PRICE_PRO_ANNUAL') || '',
  },
  small_fleet: {
    monthly: Deno.env.get('STRIPE_PRICE_SMALL_FLEET_MONTHLY') || '',
    annual: Deno.env.get('STRIPE_PRICE_SMALL_FLEET_ANNUAL') || '',
  },
  fleet: {
    monthly: Deno.env.get('STRIPE_PRICE_FLEET_MONTHLY') || '',
    annual: Deno.env.get('STRIPE_PRICE_FLEET_ANNUAL') || '',
  },
};

// Trial days for fleet plans
const TRIAL_DAYS: Record<string, number> = {
  pro: 0,
  small_fleet: 14,
  fleet: 14,
};

// App URLs
const APP_URL = Deno.env.get('APP_URL') || 'dwelltime://';
const SUCCESS_URL = `${APP_URL}checkout/success?session_id={CHECKOUT_SESSION_ID}`;
const CANCEL_URL = `${APP_URL}checkout/cancel`;

interface CheckoutRequest {
  tier: 'pro' | 'small_fleet' | 'fleet';
  interval: 'monthly' | 'annual';
  successUrl?: string;
  cancelUrl?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: CheckoutRequest = await req.json();
    const { tier, interval, successUrl, cancelUrl } = body;

    // Validate tier
    if (!['pro', 'small_fleet', 'fleet'].includes(tier)) {
      return new Response(
        JSON.stringify({ error: 'Invalid subscription tier' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate interval
    if (!['monthly', 'annual'].includes(interval)) {
      return new Response(
        JSON.stringify({ error: 'Invalid billing interval' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get price ID
    const priceId = PRICE_IDS[tier]?.[interval];
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: 'Price configuration not found. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;

    // Check if user already has a Stripe customer ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (userData?.stripe_customer_id) {
      stripeCustomerId = userData.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      stripeCustomerId = customer.id;

      // Save Stripe customer ID to user record
      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    // Check for existing active subscription
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    if (existingSubscriptions.data.length > 0) {
      // User already has an active subscription - redirect to portal instead
      return new Response(
        JSON.stringify({
          error: 'You already have an active subscription. Use the customer portal to manage your subscription.',
          hasActiveSubscription: true,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || SUCCESS_URL,
      cancel_url: cancelUrl || CANCEL_URL,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        user_id: user.id,
        tier,
        interval,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          tier,
        },
      },
    };

    // Add trial period for fleet plans
    const trialDays = TRIAL_DAYS[tier];
    if (trialDays > 0) {
      sessionParams.subscription_data!.trial_period_days = trialDays;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Create checkout error:', error);

    // Handle Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
