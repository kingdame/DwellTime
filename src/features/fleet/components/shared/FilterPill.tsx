/**
 * FilterPill Component
 * Reusable filter button/chip used in lists
 */

import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface FilterPillProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function FilterPill({
  label,
  isActive,
  onPress,
  disabled = false,
}: FilterPillProps) {
  const theme = colors.dark;

  return (
    <TouchableOpacity
      style={[
        styles.pill,
        isActive && { backgroundColor: theme.primary },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.pillText,
          { color: theme.textSecondary },
          isActive && { color: '#fff' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
