/**
 * Subscription/Pricing Screen
 * Displays subscription tiers and handles checkout
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAction } from 'convex/react';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/constants/colors';
import { useCurrentUserId, useCurrentUser } from '../../src/features/auth';
import { PricingCard, IntervalToggle } from '../../src/features/billing/components';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import type { BillingInterval, PricingPlan, SubscriptionTier } from '../../src/features/billing/types';

// Pricing plans data
const PRICING_PLANS: PricingPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'Track up to 10 detention events/month',
      'Basic invoice generation',
      'Single user',
      'Email support',
    ],
    limits: {
      maxEvents: 10,
      maxStorage: '100 MB',
      pdfExport: false,
      emailInvoices: false,
      analyticsReports: false,
      fleetManagement: false,
    },
  },
  {
    tier: 'pro',
    name: 'Pro',
    description: 'For independent owner-operators',
    monthlyPrice: 19,
    annualPrice: 190,
    features: [
      'Unlimited detention tracking',
      'PDF invoice export',
      'Email invoices directly',
      'Photo documentation',
      'Analytics dashboard',
      'Priority support',
    ],
    limits: {
      maxEvents: -1,
      maxStorage: '5 GB',
      pdfExport: true,
      emailInvoices: true,
      analyticsReports: true,
      fleetManagement: false,
    },
    isPopular: true,
    trialDays: 7,
  },
  {
    tier: 'small_fleet',
    name: 'Small Fleet',
    description: 'For small trucking companies',
    monthlyPrice: 49,
    annualPrice: 490,
    features: [
      'Everything in Pro',
      'Up to 10 drivers',
      'Fleet dashboard',
      'Driver management',
      'Team invoicing',
      'API access',
    ],
    limits: {
      maxEvents: -1,
      maxStorage: '25 GB',
      pdfExport: true,
      emailInvoices: true,
      analyticsReports: true,
      fleetManagement: true,
    },
    trialDays: 7,
  },
  {
    tier: 'fleet',
    name: 'Fleet',
    description: 'For large operations',
    monthlyPrice: 149,
    annualPrice: 1490,
    features: [
      'Everything in Small Fleet',
      'Unlimited drivers',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
    ],
    limits: {
      maxEvents: -1,
      maxStorage: '100 GB',
      pdfExport: true,
      emailInvoices: true,
      analyticsReports: true,
      fleetManagement: true,
    },
    trialDays: 14,
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large fleets',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'Everything in Fleet',
      'Custom pricing',
      'White-label options',
      'On-premise deployment',
      'Dedicated account manager',
      '24/7 phone support',
    ],
    limits: {
      maxEvents: -1,
      maxStorage: 'Unlimited',
      pdfExport: true,
      emailInvoices: true,
      analyticsReports: true,
      fleetManagement: true,
    },
  },
];

export default function SubscriptionScreen() {
  const theme = colors.dark;
  const router = useRouter();
  const userId = useCurrentUserId() as Id<'users'> | undefined;
  const user = useCurrentUser();

  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const createCheckoutSession = useAction(api.subscriptions.createCheckoutSession);
  const createPortalSession = useAction(api.subscriptions.createCustomerPortalSession);

  const currentTier = (user?.subscriptionTier || 'free') as SubscriptionTier;

  const handleSubscribe = useCallback(
    async (tier: SubscriptionTier, billingInterval: BillingInterval) => {
      if (!userId) {
        Alert.alert('Sign In Required', 'Please sign in to subscribe.');
        router.push('/auth/sign-in');
        return;
      }

      if (tier === 'free' || tier === 'enterprise') {
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLoading(tier);

      try {
        const result = await createCheckoutSession({
          userId,
          tier: tier as 'pro' | 'small_fleet' | 'fleet',
          interval: billingInterval,
          successUrl: 'dwelltime://subscription/success',
          cancelUrl: 'dwelltime://subscription/cancel',
        });

        if (result.url) {
          await Linking.openURL(result.url);
        } else {
          Alert.alert('Error', 'Could not create checkout session');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        Alert.alert('Error', 'Failed to start checkout. Please try again.');
      } finally {
        setLoading(null);
      }
    },
    [userId, createCheckoutSession, router]
  );

  const handleManageSubscription = useCallback(async () => {
    if (!userId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading('manage');

    try {
      const result = await createPortalSession({
        userId,
        returnUrl: 'dwelltime://profile',
      });

      if (result.url) {
        await Linking.openURL(result.url);
      }
    } catch (error) {
      console.error('Portal error:', error);
      Alert.alert('Error', 'Failed to open billing portal. Please try again.');
    } finally {
      setLoading(null);
    }
  }, [userId, createPortalSession]);

  const handleContactSales = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Contact Sales',
      'For enterprise pricing, please contact our sales team at sales@dwelltime.app',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email Sales',
          onPress: () => Linking.openURL('mailto:sales@dwelltime.app?subject=Enterprise%20Inquiry'),
        },
      ]
    );
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Choose Your Plan
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Start with a 7-day free trial. Cancel anytime.
          </Text>
        </View>

        {/* Billing Interval Toggle */}
        <View style={styles.intervalContainer}>
          <IntervalToggle interval={interval} onChange={setInterval} />
          {interval === 'annual' && (
            <Text style={[styles.savingsText, { color: theme.success }]}>
              Save up to 17% with annual billing
            </Text>
          )}
        </View>

        {/* Pricing Cards */}
        <View style={styles.cardsContainer}>
          {PRICING_PLANS.map((plan) => (
            <View key={plan.tier} style={styles.cardWrapper}>
              {loading === plan.tier && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={theme.primary} />
                </View>
              )}
              <PricingCard
                plan={plan}
                currentTier={currentTier}
                isCurrentPlan={plan.tier === currentTier}
                selectedInterval={interval}
                onSelectInterval={setInterval}
                onSubscribe={handleSubscribe}
                onContactSales={handleContactSales}
              />
            </View>
          ))}
        </View>

        {/* Manage Subscription (for existing subscribers) */}
        {currentTier !== 'free' && (
          <View style={styles.manageSection}>
            <Pressable
              style={[styles.manageButton, { borderColor: theme.divider }]}
              onPress={handleManageSubscription}
              disabled={loading === 'manage'}
            >
              {loading === 'manage' ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Text style={[styles.manageButtonText, { color: theme.primary }]}>
                  Manage Subscription
                </Text>
              )}
            </Pressable>
          </View>
        )}

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={[styles.faqTitle, { color: theme.textPrimary }]}>
            Frequently Asked Questions
          </Text>

          <View style={[styles.faqItem, { backgroundColor: theme.card }]}>
            <Text style={[styles.faqQuestion, { color: theme.textPrimary }]}>
              Can I cancel anytime?
            </Text>
            <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
              Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.
            </Text>
          </View>

          <View style={[styles.faqItem, { backgroundColor: theme.card }]}>
            <Text style={[styles.faqQuestion, { color: theme.textPrimary }]}>
              What payment methods do you accept?
            </Text>
            <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
              We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe.
            </Text>
          </View>

          <View style={[styles.faqItem, { backgroundColor: theme.card }]}>
            <Text style={[styles.faqQuestion, { color: theme.textPrimary }]}>
              Is there a free trial?
            </Text>
            <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
              Yes! All paid plans include a 7-day free trial. You won't be charged until the trial ends.
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  intervalContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  cardWrapper: {
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    zIndex: 10,
  },
  manageSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  manageButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  faqSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  faqItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
