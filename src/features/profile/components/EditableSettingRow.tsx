/**
 * EditableSettingRow Component
 * Reusable row for displaying a setting with edit button
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface EditableSettingRowProps {
  icon: string;
  label: string;
  value: string | number | null | undefined;
  placeholder?: string;
  onEdit: () => void;
  disabled?: boolean;
}

export function EditableSettingRow({
  icon,
  label,
  value,
  placeholder = 'Not set',
  onEdit,
  disabled = false,
}: EditableSettingRowProps) {
  const theme = colors.dark;
  const displayValue = value ?? placeholder;
  const isPlaceholder = value === null || value === undefined || value === '';

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: theme.card }]}
      onPress={onEdit}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.content}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </Text>
        <Text
          style={[
            styles.value,
            { color: isPlaceholder ? theme.textDisabled : theme.textPrimary },
          ]}
          numberOfLines={1}
        >
          {displayValue}
        </Text>
      </View>
      <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
    </TouchableOpacity>
  );
}

/**
 * Section header for grouping settings
 */
export function SettingSectionHeader({ title }: { title: string }) {
  const theme = colors.dark;

  return (
    <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 20,
    marginLeft: 8,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 12,
    marginLeft: 4,
  },
});
