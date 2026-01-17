/**
 * GlassCard - Premium glass-morphism card component
 * Features: backdrop blur, gradient border, press animation, haptic feedback
 */

import React, { useCallback } from 'react';
import { StyleSheet, View, Pressable, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { palette, spacing, radius, shadows, animation } from '../../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  intensity?: number;
  showBorder?: boolean;
  showInnerGlow?: boolean;
  haptic?: boolean;
  disabled?: boolean;
  padding?: keyof typeof spacing | number;
}

export function GlassCard({
  children,
  style,
  onPress,
  intensity = 25,
  showBorder = true,
  showInnerGlow = true,
  haptic = true,
  disabled = false,
  padding = 'xxl',
}: GlassCardProps) {
  const pressed = useSharedValue(0);

  const handlePressIn = useCallback(() => {
    if (disabled || !onPress) return;
    pressed.value = withSpring(1, animation.spring.snappy);
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [disabled, onPress, haptic, pressed]);

  const handlePressOut = useCallback(() => {
    pressed.value = withSpring(0, animation.spring.snappy);
  }, [pressed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.98]) }],
    opacity: disabled ? 0.6 : 1,
  }));

  const paddingValue = typeof padding === 'number' ? padding : spacing[padding];

  const cardContent = (
    <>
      {/* Inner glow gradient at top */}
      {showInnerGlow && (
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'transparent']}
          style={styles.innerGlow}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
        />
      )}

      {/* Border gradient overlay */}
      {showBorder && (
        <View style={styles.borderContainer} pointerEvents="none">
          <LinearGradient
            colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']}
            style={styles.borderGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
      )}

      {/* Content */}
      <View style={[styles.content, { padding: paddingValue }]}>{children}</View>
    </>
  );

  // Web doesn't support BlurView well, use solid background
  const useBlur = Platform.OS !== 'web';

  if (onPress) {
    return (
      <AnimatedPressable
        style={[styles.container, style, animatedStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        {useBlur ? (
          <BlurView intensity={intensity} style={styles.blur} tint="dark">
            {cardContent}
          </BlurView>
        ) : (
          <View style={[styles.blur, styles.webFallback]}>{cardContent}</View>
        )}
      </AnimatedPressable>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {useBlur ? (
        <BlurView intensity={intensity} style={styles.blur} tint="dark">
          {cardContent}
        </BlurView>
      ) : (
        <View style={[styles.blur, styles.webFallback]}>{cardContent}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: palette.glass.background,
    ...shadows.md,
  },
  blur: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: radius.lg,
  },
  webFallback: {
    backgroundColor: palette.glass.backgroundSolid,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    zIndex: 0,
  },
  borderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.glass.border,
    zIndex: 2,
  },
  borderGradient: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: radius.lg,
    opacity: 0.5,
  },
});
