/**
 * Reusable Input Component
 */

import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../../../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const theme = colors.dark;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            color: theme.textPrimary,
            borderColor: error ? theme.error : theme.divider,
          },
          style,
        ]}
        placeholderTextColor={theme.textDisabled}
        {...props}
      />
      {error && (
        <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
  },
});
