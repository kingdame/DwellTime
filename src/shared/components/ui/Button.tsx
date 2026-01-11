/**
 * Reusable Button Component
 */

import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const theme = colors.dark;

  const getBackgroundColor = () => {
    if (disabled) return theme.textDisabled;
    switch (variant) {
      case 'primary':
        return theme.primary;
      case 'secondary':
        return theme.card;
      case 'outline':
        return 'transparent';
      case 'danger':
        return theme.error;
      default:
        return theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.background;
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
        return theme.textPrimary;
      case 'outline':
        return theme.primary;
      default:
        return '#FFFFFF';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return 10;
      case 'medium':
        return 14;
      case 'large':
        return 18;
      default:
        return 14;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          padding: getPadding(),
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variant === 'outline' ? theme.primary : undefined,
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor(), fontSize: getFontSize() }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  text: {
    fontWeight: '600',
  },
});
