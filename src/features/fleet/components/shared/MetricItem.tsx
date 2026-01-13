/**
 * MetricItem Component
 * Displays a single metric with value and label
 */

import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface MetricItemProps {
  value: string | number;
  label: string;
  valueColor?: string;
  size?: 'small' | 'medium' | 'large';
}

export function MetricItem({
  value,
  label,
  valueColor,
  size = 'medium',
}: MetricItemProps) {
  const theme = colors.dark;
  const finalValueColor = valueColor || theme.textPrimary;

  const getFontSizes = () => {
    switch (size) {
      case 'small':
        return { value: 16, label: 10 };
      case 'large':
        return { value: 24, label: 12 };
      default:
        return { value: 20, label: 11 };
    }
  };

  const fontSizes = getFontSizes();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.value,
          { color: finalValueColor, fontSize: fontSizes.value },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.label,
          { color: theme.textSecondary, fontSize: fontSizes.label },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  value: {
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
