/**
 * SelectableRow Component
 * Reusable selectable row with checkbox
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface SelectableRowProps {
  isSelected: boolean;
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function SelectableRow({
  isSelected,
  onPress,
  children,
  disabled = false,
}: SelectableRowProps) {
  const theme = colors.dark;

  return (
    <TouchableOpacity
      style={[
        styles.row,
        { backgroundColor: theme.card },
        isSelected && {
          borderColor: theme.primary,
          borderWidth: 2,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.checkbox}>
        {isSelected && <Text style={styles.checkmark}>OK</Text>}
      </View>
      {children}
    </TouchableOpacity>
  );
}

export function Checkbox({ isChecked }: { isChecked: boolean }) {
  return (
    <View style={styles.checkbox}>
      {isChecked && <Text style={styles.checkmark}>OK</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
