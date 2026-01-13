/**
 * SkeletonLoader Component
 * Loading placeholder components
 */

import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface SkeletonLineProps {
  width?: string | number;
  height?: number;
  borderRadius?: number;
}

export function SkeletonLine({
  width = '100%',
  height = 16,
  borderRadius = 4,
}: SkeletonLineProps) {
  const theme = colors.dark;

  return (
    <View
      style={[
        styles.line,
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.divider,
        },
      ]}
    />
  );
}

interface SkeletonCardProps {
  children?: React.ReactNode;
}

export function SkeletonCard({ children }: SkeletonCardProps) {
  const theme = colors.dark;

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      {children}
    </View>
  );
}

// Pre-built skeleton for driver cards
export function DriverCardSkeleton() {
  const theme = colors.dark;

  return (
    <View style={[styles.driverCard, { backgroundColor: theme.card }]}>
      <View style={styles.skeletonHeader}>
        <SkeletonLine width="60%" height={18} />
        <SkeletonLine width={60} height={20} borderRadius={10} />
      </View>
      <SkeletonLine width="80%" height={14} />
      <View style={styles.spacer} />
      <SkeletonLine width="80%" height={14} />
      <View style={styles.skeletonStats}>
        <SkeletonLine width={60} height={36} borderRadius={8} />
        <SkeletonLine width={60} height={36} borderRadius={8} />
      </View>
    </View>
  );
}

// Pre-built skeleton for event cards
export function EventCardSkeleton() {
  const theme = colors.dark;

  return (
    <View style={[styles.eventCard, { backgroundColor: theme.card }]}>
      <View style={styles.skeletonHeader}>
        <SkeletonLine width="70%" height={18} />
        <SkeletonLine width={70} height={20} borderRadius={10} />
      </View>
      <SkeletonLine width="50%" height={14} />
      <View style={styles.spacer} />
      <View style={styles.skeletonMetrics}>
        <SkeletonLine width={50} height={24} />
        <SkeletonLine width={50} height={24} />
        <SkeletonLine width={50} height={24} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    // Base styles applied via props
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  driverCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  eventCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
  },
  skeletonMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
  },
  spacer: {
    height: 8,
  },
});
