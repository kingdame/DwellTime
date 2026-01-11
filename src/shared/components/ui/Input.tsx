/**
 * Input Component
 * Themed text input with label and error states
 */

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, typography } from '@/constants';
import { useUIStore } from '@/shared/stores/uiStore';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const hasError = Boolean(error);

  const getBorderColor = (): string => {
    if (hasError) return themeColors.error;
    return themeColors.divider;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: themeColors.textPrimary }]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: themeColors.card,
            borderColor: getBorderColor(),
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            {
              color: themeColors.textPrimary,
              paddingLeft: leftIcon ? 0 : 16,
              paddingRight: rightIcon ? 0 : 16,
            },
            style,
          ]}
          placeholderTextColor={themeColors.textSecondary}
          selectionColor={colors.timer}
          {...props}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {(error || hint) && (
        <Text
          style={[
            styles.helperText,
            { color: hasError ? themeColors.error : themeColors.textSecondary },
          ]}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    paddingVertical: 12,
  },
  leftIcon: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  rightIcon: {
    paddingRight: 12,
    paddingLeft: 8,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    marginTop: 4,
  },
});
