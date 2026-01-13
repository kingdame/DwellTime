/**
 * DwellTime Pricing Card Component
 *
 * Displays pricing plan information with subscribe/upgrade button.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { colors } from '../../../constants/colors';
import { formatSubscriptionPrice, calculateAnnualSavings } from '../../../lib/stripe';
import { useSubscription, useCheckout } from '../hooks/useSubscription';
import type { PricingPlan, BillingInterval, SubscriptionTier } from '../types';

interface PricingCardProps {
  plan: PricingPlan;
  isCurrentPlan?: boolean;
  selectedInterval?: BillingInterval;
  onSelectInterval?: (interval: BillingInterval) => void;
  onContactSales?: () => void;
}

export function PricingCard({
  plan,
  isCurrentPlan = false,
  selectedInterval = 'monthly',
  onSelectInterval,
  onContactSales,
}: PricingCardProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;

  const { tier: currentTier } = useSubscription();
  const checkout = plan.tier !== 'free' && plan.tier !== 'enterprise'
    ? useCheckout(plan.tier as Exclude<SubscriptionTier, 'free' | 'enterprise'>)
    : null;

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

    if (plan.tier === 'free') {
      // Already on free, nothing to do
      return;
    }

    checkout?.checkout(interval);
  };

  const getButtonText = (): string => {
    if (isCurrentPlan) return 'Current Plan';
    if (plan.tier === 'free') return 'Downgrade';
    if (plan.tier === 'enterprise') return 'Contact Sales';
    if (plan.trialDays) return `Start ${plan.trialDays}-Day Trial`;
    return 'Subscribe';
  };

  const isButtonDisabled = isCurrentPlan || checkout?.isLoading;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card },
        plan.isPopular && styles.popularContainer,
        plan.isPopular && { borderColor: theme.primary },
      ]}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <View style={[styles.popularBadge, { backgroundColor: theme.primary }]}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}

      {/* Plan Header */}
      <View style={styles.header}>
        <Text style={[styles.planName, { color: theme.textPrimary }]}>
          {plan.name}
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {plan.description}
        </Text>
      </View>

      {/* Pricing */}
      <View style={styles.pricing}>
        {plan.tier === 'enterprise' ? (
          <Text style={[styles.customPricing, { color: theme.textPrimary }]}>
            Custom Pricing
          </Text>
        ) : plan.tier === 'free' ? (
          <Text style={[styles.freePrice, { color: theme.textPrimary }]}>Free</Text>
        ) : (
          <>
            <Text style={[styles.price, { color: theme.textPrimary }]}>
              {formatSubscriptionPrice(price, interval)}
            </Text>
            {interval === 'annual' && savingsPercent > 0 && (
              <View style={[styles.savingsBadge, { backgroundColor: colors.money }]}>
                <Text style={styles.savingsText}>Save {savingsPercent}%</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Interval Toggle (for paid plans) */}
      {plan.tier !== 'free' && plan.tier !== 'enterprise' && (
        <View style={styles.intervalToggle}>
          <TouchableOpacity
            style={[
              styles.intervalButton,
              { borderColor: theme.divider },
              interval === 'monthly' && {
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              },
            ]}
            onPress={() => handleIntervalChange('monthly')}
            accessibilityRole="button"
            accessibilityLabel="Monthly billing"
          >
            <Text
              style={[
                styles.intervalText,
                { color: interval === 'monthly' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.intervalButton,
              { borderColor: theme.divider },
              interval === 'annual' && {
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              },
            ]}
            onPress={() => handleIntervalChange('annual')}
            accessibilityRole="button"
            accessibilityLabel="Annual billing"
          >
            <Text
              style={[
                styles.intervalText,
                { color: interval === 'annual' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Annual
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Trial Info */}
      {plan.trialDays && !isCurrentPlan && (
        <Text style={[styles.trialText, { color: theme.textSecondary }]}>
          {plan.trialDays}-day free trial included
        </Text>
      )}

      {/* Features */}
      <View style={styles.features}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={[styles.checkmark, { color: colors.money }]}>✓</Text>
            <Text style={[styles.featureText, { color: theme.textPrimary }]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      {/* Subscribe Button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isCurrentPlan
              ? theme.backgroundSecondary
              : plan.isPopular
              ? theme.primary
              : theme.backgroundSecondary,
          },
          isButtonDisabled && styles.buttonDisabled,
        ]}
        onPress={handleSubscribe}
        disabled={isButtonDisabled}
        accessibilityRole="button"
        accessibilityLabel={getButtonText()}
        accessibilityState={{ disabled: isButtonDisabled }}
      >
        {checkout?.isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text
            style={[
              styles.buttonText,
              {
                color: isCurrentPlan
                  ? theme.textSecondary
                  : plan.isPopular
                  ? '#FFFFFF'
                  : theme.textPrimary,
              },
            ]}
          >
            {getButtonText()}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

/**
 * Pricing Comparison Grid
 */
interface PricingComparisonProps {
  plans: PricingPlan[];
  currentTier?: SubscriptionTier;
  selectedInterval?: BillingInterval;
  onIntervalChange?: (interval: BillingInterval) => void;
  onContactSales?: () => void;
}

export function PricingComparison({
  plans,
  currentTier = 'free',
  selectedInterval = 'monthly',
  onIntervalChange,
  onContactSales,
}: PricingComparisonProps) {
  const [interval, setInterval] = useState<BillingInterval>(selectedInterval);

  const handleIntervalChange = (newInterval: BillingInterval) => {
    setInterval(newInterval);
    onIntervalChange?.(newInterval);
  };

  return (
    <View style={styles.comparisonContainer}>
      {/* Global Interval Toggle */}
      <View style={styles.globalIntervalToggle}>
        <IntervalToggle interval={interval} onChange={handleIntervalChange} />
      </View>

      {/* Plan Cards */}
      {plans.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          isCurrentPlan={plan.tier === currentTier}
          selectedInterval={interval}
          onSelectInterval={handleIntervalChange}
          onContactSales={onContactSales}
        />
      ))}
    </View>
  );
}

/**
 * Interval Toggle Component
 */
interface IntervalToggleProps {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}

export function IntervalToggle({ interval, onChange }: IntervalToggleProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;

  return (
    <View style={[styles.toggleContainer, { backgroundColor: theme.backgroundSecondary }]}>
      <TouchableOpacity
        style={[
          styles.toggleOption,
          interval === 'monthly' && { backgroundColor: theme.primary },
        ]}
        onPress={() => onChange('monthly')}
        accessibilityRole="button"
        accessibilityLabel="Monthly billing"
        accessibilityState={{ selected: interval === 'monthly' }}
      >
        <Text
          style={[
            styles.toggleText,
            { color: interval === 'monthly' ? '#FFFFFF' : theme.textSecondary },
          ]}
        >
          Monthly
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.toggleOption,
          interval === 'annual' && { backgroundColor: theme.primary },
        ]}
        onPress={() => onChange('annual')}
        accessibilityRole="button"
        accessibilityLabel="Annual billing (save up to 37%)"
        accessibilityState={{ selected: interval === 'annual' }}
      >
        <Text
          style={[
            styles.toggleText,
            { color: interval === 'annual' ? '#FFFFFF' : theme.textSecondary },
          ]}
        >
          Annual (Save up to 37%)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularContainer: {
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -50 }],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  header: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  pricing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
  },
  freePrice: {
    fontSize: 32,
    fontWeight: '700',
  },
  customPricing: {
    fontSize: 24,
    fontWeight: '600',
  },
  savingsBadge: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  intervalToggle: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  intervalButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  intervalText: {
    fontSize: 14,
    fontWeight: '500',
  },
  trialText: {
    fontSize: 13,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  features: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    marginTop: 1,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  comparisonContainer: {
    paddingHorizontal: 16,
  },
  globalIntervalToggle: {
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PricingCard;
