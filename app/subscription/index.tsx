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

// Pricing plans data - matches docs/PRICING_STRATEGY.md
const PRICING_PLANS: PricingPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    description: 'Try DwellTime risk-free',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      '3 detention events/month',
      'GPS tracking',
      'Photo evidence',
      'PDF invoice + email',
      'View facility ratings',
      'Add your own ratings',
    ],
    limits: {
      maxEvents: 3,
      maxStorage: '100 MB',
      pdfExport: true,
      emailInvoices: true,
      analyticsReports: false,
      fleetManagement: false,
    },
  },
  {
    tier: 'pro',
    name: 'Pro',
    description: 'For independent owner-operators',
    monthlyPrice: 12.99,
    annualPrice: 99,
    features: [
      'Unlimited detention tracking',
      'Full facility intelligence',
      'Payment reliability data',
      'Load check (before you go)',
      'Money recovery tracker',
      'Invoice follow-up tools',
      'Nearby services',
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
    description: '2-5 drivers',
    monthlyPrice: 49.99,
    annualPrice: 399,
    features: [
      'Everything in Pro, plus:',
      'Fleet dashboard',
      'View all driver events',
      'Admin account (view-only)',
      'Export reports (CSV, PDF)',
      'Set company-wide defaults',
    ],
    limits: {
      maxEvents: -1,
      maxStorage: '25 GB',
      pdfExport: true,
      emailInvoices: true,
      analyticsReports: true,
      fleetManagement: true,
    },
    trialDays: 14,
  },
  {
    tier: 'fleet',
    name: 'Fleet',
    description: '6-10 drivers',
    monthlyPrice: 79.99,
    annualPrice: 649,
    features: [
      'Everything in Small Fleet',
      'Priority support',
      'Dedicated account rep',
      'Custom onboarding',
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
    description: '11+ drivers - Custom pricing',
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
            ROI: One recovered detention event pays for a year of Pro.
          </Text>
        </View>

        {/* Billing Interval Toggle */}
        <View style={styles.intervalContainer}>
          <IntervalToggle interval={interval} onChange={setInterval} />
          {interval === 'annual' && (
            <Text style={[styles.savingsText, { color: theme.success }]}>
              Save up to 36% with annual billing
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
              What's the ROI on Pro?
            </Text>
            <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
              One recovered detention event ($75-150) pays for your entire year of Pro ($99). That's 75-150% ROI on your first event alone.
            </Text>
          </View>

          <View style={[styles.faqItem, { backgroundColor: theme.card }]}>
            <Text style={[styles.faqQuestion, { color: theme.textPrimary }]}>
              What's included in Free?
            </Text>
            <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
              Free includes 3 detention events per month with GPS tracking, photo evidence, PDF invoices, and the ability to view and add facility ratings. Forever free, no credit card required.
            </Text>
          </View>

          <View style={[styles.faqItem, { backgroundColor: theme.card }]}>
            <Text style={[styles.faqQuestion, { color: theme.textPrimary }]}>
              Why is Pro worth $12.99?
            </Text>
            <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
              Pro gives you unlimited tracking plus our exclusive Payment Reliability Data — know if a facility actually pays before you accept the load. No competitor offers this.
            </Text>
          </View>

          <View style={[styles.faqItem, { backgroundColor: theme.card }]}>
            <Text style={[styles.faqQuestion, { color: theme.textPrimary }]}>
              Can I cancel anytime?
            </Text>
            <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
              Yes! Cancel your subscription at any time. Your access continues until the end of your billing period.
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
