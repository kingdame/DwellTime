/**
 * PremiumButton - Animated button with gradient and glass variants
 * Features: scale animation, gradient backgrounds, haptic feedback, loading state
 */

import React, { useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  palette,
  gradients,
  spacing,
  radius,
  typography,
  animation,
  shadows,
} from '../../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  haptic?: boolean;
}

const sizeConfig = {
  small: {
    height: 40,
    paddingHorizontal: spacing.lg,
    fontSize: typography.size.md,
    iconSize: 16,
  },
  medium: {
    height: 52,
    paddingHorizontal: spacing.xl,
    fontSize: typography.size.lg,
    iconSize: 18,
  },
  large: {
    height: 60,
    paddingHorizontal: spacing.xxl,
    fontSize: typography.size.xl,
    iconSize: 20,
  },
};

const variantGradients: Record<string, readonly [string, string]> = {
  primary: gradients.primary,
  danger: gradients.danger,
  success: gradients.success,
};

export function PremiumButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  haptic = true,
}: PremiumButtonProps) {
  const pressed = useSharedValue(0);
  const isDisabled = disabled || loading;

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    pressed.value = withSpring(1, animation.spring.snappy);
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [isDisabled, haptic, pressed]);

  const handlePressOut = useCallback(() => {
    pressed.value = withSpring(0, animation.spring.snappy);
  }, [pressed]);

  const handlePress = useCallback(() => {
    if (isDisabled) return;
    onPress();
  }, [isDisabled, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.97]) }],
    opacity: isDisabled ? 0.5 : 1,
  }));

  const config = sizeConfig[size];
  const isGradient = ['primary', 'danger', 'success'].includes(variant);

  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary':
        return palette.dark.card;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return palette.dark.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return palette.dark.textPrimary;
      case 'outline':
        return palette.dark.primary;
      case 'ghost':
        return palette.dark.textSecondary;
      default:
        return '#FFFFFF';
    }
  };

  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 2,
        borderColor: palette.dark.primary,
      };
    }
    return {};
  };

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: config.fontSize,
              },
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </>
      )}
    </View>
  );

  if (isGradient && !isDisabled) {
    return (
      <AnimatedPressable
        style={[
          styles.container,
          { height: config.height },
          fullWidth && styles.fullWidth,
          animatedStyle,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={variantGradients[variant] || gradients.primary}
          style={[styles.gradient, { paddingHorizontal: config.paddingHorizontal }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      style={[
        styles.container,
        styles.solidContainer,
        {
          height: config.height,
          paddingHorizontal: config.paddingHorizontal,
          backgroundColor: getBackgroundColor(),
        },
        getBorderStyle(),
        fullWidth && styles.fullWidth,
        animatedStyle,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      {renderContent()}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  solidContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.weight.semibold,
    letterSpacing: typography.tracking.wide,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
});
