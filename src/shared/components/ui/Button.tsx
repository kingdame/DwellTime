/**
 * Button Component
 * Themed button with multiple variants
 */

import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

import { colors, typography } from '@/constants';
import { useUIStore } from '@/shared/stores/uiStore';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const isDisabled = disabled || loading;

  const getBackgroundColor = (): string => {
    if (isDisabled) return themeColors.textDisabled;

    switch (variant) {
      case 'primary':
        return colors.timer;
      case 'secondary':
        return themeColors.backgroundSecondary;
      case 'danger':
        return colors.danger;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.timer;
    }
  };

  const getTextColor = (): string => {
    if (isDisabled) return isDark ? '#666' : '#999';

    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
        return themeColors.textPrimary;
      case 'outline':
        return colors.timer;
      case 'ghost':
        return themeColors.textPrimary;
      default:
        return '#FFFFFF';
    }
  };

  const getBorderColor = (): string | undefined => {
    if (variant === 'outline') {
      return isDisabled ? themeColors.textDisabled : colors.timer;
    }
    return undefined;
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { height: 36, paddingHorizontal: 12 };
      case 'lg':
        return { height: 56, paddingHorizontal: 24 };
      default:
        return { height: 48, paddingHorizontal: 16 };
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'sm':
        return typography.fontSize.sm;
      case 'lg':
        return typography.fontSize.lg;
      default:
        return typography.fontSize.base;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getSizeStyles(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          width: fullWidth ? '100%' : undefined,
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                marginLeft: leftIcon ? 8 : 0,
                marginRight: rightIcon ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  text: {
    fontWeight: '600',
  },
});
