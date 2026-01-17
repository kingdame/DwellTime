/**
 * DwellTime Pricing Card Component
 *
 * Displays pricing plan information with subscribe/upgrade button.
 * 
 * NOTE: Billing checkout now uses Convex + Stripe. 
 * See convex/http.ts for Stripe webhook handlers.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { colors } from '../../../constants/colors';
import type { PricingPlan, BillingInterval, SubscriptionTier } from '../types';

interface PricingCardProps {
  plan: PricingPlan;
  currentTier?: SubscriptionTier;
  isCurrentPlan?: boolean;
  selectedInterval?: BillingInterval;
  onSelectInterval?: (interval: BillingInterval) => void;
  onSubscribe?: (tier: SubscriptionTier, interval: BillingInterval) => void;
  onContactSales?: () => void;
}

/**
 * Calculate annual savings percentage
 */
function calculateAnnualSavings(monthlyPrice: number, annualPrice: number): number {
  const yearlyAtMonthly = monthlyPrice * 12;
  if (yearlyAtMonthly <= 0) return 0;
  return Math.round(((yearlyAtMonthly - annualPrice) / yearlyAtMonthly) * 100);
}

/**
 * Format price for display
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function PricingCard({
  plan,
  currentTier,
  isCurrentPlan = false,
  selectedInterval = 'monthly',
  onSelectInterval,
  onSubscribe,
  onContactSales,
}: PricingCardProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;

  const [localInterval, setLocalInterval] = useState<BillingInterval>(selectedInterval);
  const interval = selectedInterval ?? localInterval;

  const price = interval === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const savingsPercent = calculateAnnualSavings(plan.monthlyPrice, plan.annualPrice);

  const handleIntervalChange = (newInterval: BillingInterval) => {
    setLocalInterval(newInterval);
    onSelectInterval?.(newInterval);
  };

  const handleSubscribe = () => {
    if (plan.tier === 'enterprise') {
      onContactSales?.();
      return;
    }
    onSubscribe?.(plan.tier, interval);
  };

  const getButtonText = () => {
    if (isCurrentPlan) return 'Current Plan';
    if (plan.tier === 'free') return 'Get Started';
    if (plan.tier === 'enterprise') return 'Contact Sales';
    return 'Subscribe';
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card },
        plan.isPopular && styles.popularContainer,
        plan.isPopular && { borderColor: theme.primary },
      ]}
    >
      {plan.isPopular && (
        <View style={[styles.popularBadge, { backgroundColor: theme.primary }]}>
          <Text style={styles.popularBadgeText}>Most Popular</Text>
        </View>
      )}

      <Text style={[styles.planName, { color: theme.textPrimary }]}>{plan.name}</Text>
      <Text style={[styles.planDescription, { color: theme.textSecondary }]}>
        {plan.description}
      </Text>

      <View style={styles.priceContainer}>
        <Text style={[styles.price, { color: theme.textPrimary }]}>
          {plan.tier === 'enterprise' ? 'Custom' : formatPrice(price)}
        </Text>
        {plan.tier !== 'free' && plan.tier !== 'enterprise' && (
          <Text style={[styles.priceInterval, { color: theme.textSecondary }]}>
            /{interval === 'annual' ? 'year' : 'month'}
          </Text>
        )}
      </View>

      {plan.tier !== 'free' && plan.tier !== 'enterprise' && savingsPercent > 0 && (
        <View style={styles.intervalToggle}>
          <TouchableOpacity
            style={[
              styles.intervalButton,
              interval === 'monthly' && { backgroundColor: theme.primary },
            ]}
            onPress={() => handleIntervalChange('monthly')}
          >
            <Text
              style={[
                styles.intervalButtonText,
                interval === 'monthly'
                  ? { color: '#FFFFFF' }
                  : { color: theme.textSecondary },
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.intervalButton,
              interval === 'annual' && { backgroundColor: theme.primary },
            ]}
            onPress={() => handleIntervalChange('annual')}
          >
            <Text
              style={[
                styles.intervalButtonText,
                interval === 'annual'
                  ? { color: '#FFFFFF' }
                  : { color: theme.textSecondary },
              ]}
            >
              Annual ({savingsPercent}% off)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={[styles.featureCheck, { color: theme.success }]}>✓</Text>
            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.subscribeButton,
          isCurrentPlan
            ? { backgroundColor: theme.backgroundSecondary }
            : { backgroundColor: theme.primary },
        ]}
        onPress={handleSubscribe}
        disabled={isCurrentPlan}
      >
        <Text
          style={[
            styles.subscribeButtonText,
            isCurrentPlan && { color: theme.textSecondary },
          ]}
        >
          {getButtonText()}
        </Text>
      </TouchableOpacity>

      {plan.trialDays && !isCurrentPlan && plan.tier !== 'free' && (
        <Text style={[styles.trialText, { color: theme.textSecondary }]}>
          {plan.trialDays}-day free trial
        </Text>
      )}
    </View>
  );
}

/**
 * Pricing comparison table
 */
export function PricingComparison({ plans }: { plans: PricingPlan[] }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;

  return (
    <View style={[styles.comparisonContainer, { backgroundColor: theme.card }]}>
      <Text style={[styles.comparisonTitle, { color: theme.textPrimary }]}>
        Compare Plans
      </Text>
      {/* Comparison table would go here */}
      <Text style={[styles.comparisonPlaceholder, { color: theme.textSecondary }]}>
        Full comparison table coming soon
      </Text>
    </View>
  );
}

/**
 * Billing interval toggle
 */
export function IntervalToggle({
  interval,
  onChange,
}: {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;

  return (
    <View style={[styles.intervalToggleContainer, { backgroundColor: theme.backgroundSecondary }]}>
      <TouchableOpacity
        style={[
          styles.intervalToggleButton,
          interval === 'monthly' && { backgroundColor: theme.card },
        ]}
        onPress={() => onChange('monthly')}
      >
        <Text
          style={[
            styles.intervalToggleText,
            { color: interval === 'monthly' ? theme.textPrimary : theme.textSecondary },
          ]}
        >
          Monthly
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.intervalToggleButton,
          interval === 'annual' && { backgroundColor: theme.card },
        ]}
        onPress={() => onChange('annual')}
      >
        <Text
          style={[
            styles.intervalToggleText,
            { color: interval === 'annual' ? theme.textPrimary : theme.textSecondary },
          ]}
        >
          Annual
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  popularContainer: {
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  priceInterval: {
    fontSize: 16,
    marginLeft: 4,
  },
  intervalToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24,
  },
  intervalButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  intervalButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureCheck: {
    fontSize: 14,
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  subscribeButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  trialText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  comparisonContainer: {
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  comparisonPlaceholder: {
    fontSize: 14,
    textAlign: 'center',
  },
  intervalToggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  intervalToggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  intervalToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

