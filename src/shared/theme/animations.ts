/**
 * Reanimated Animation Utilities
 * Premium micro-interactions and transitions
 */

import { useCallback, useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { animation } from './tokens';

// ============================================
// PRESS ANIMATION HOOK
// ============================================
export interface UsePressAnimationOptions {
  scale?: number;
  haptic?: boolean;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
}

export function usePressAnimation(options: UsePressAnimationOptions = {}) {
  const {
    scale = 0.98,
    haptic = true,
    hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  } = options;

  const pressed = useSharedValue(0);

  const triggerHaptic = useCallback(() => {
    if (haptic) {
      Haptics.impactAsync(hapticStyle);
    }
  }, [haptic, hapticStyle]);

  const onPressIn = useCallback(() => {
    pressed.value = withSpring(1, animation.spring.snappy);
    triggerHaptic();
  }, [pressed, triggerHaptic]);

  const onPressOut = useCallback(() => {
    pressed.value = withSpring(0, animation.spring.snappy);
  }, [pressed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, scale]) }],
  }));

  return {
    onPressIn,
    onPressOut,
    animatedStyle,
    pressed,
  };
}

// ============================================
// FADE IN ANIMATION
// ============================================
export function useFadeIn(delay = 0, duration = 300) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  const animate = useCallback(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(delay, withSpring(0, animation.spring.gentle));
  }, [delay, duration, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return { animate, animatedStyle, opacity, translateY };
}

// ============================================
// SCALE ENTRANCE ANIMATION
// ============================================
export function useScaleEntrance(delay = 0) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  const animate = useCallback(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) })
    );
    scale.value = withDelay(delay, withSpring(1, animation.spring.bouncy));
  }, [delay, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return { animate, animatedStyle, scale, opacity };
}

// ============================================
// STAGGER ANIMATION FOR LISTS
// ============================================
export function useStaggerAnimation(baseDelay = 50) {
  const getDelay = useCallback(
    (index: number) => index * baseDelay,
    [baseDelay]
  );

  const getAnimatedStyle = useCallback(
    (index: number) => {
      const delay = getDelay(index);
      const opacity = useSharedValue(0);
      const translateY = useSharedValue(16);

      useEffect(() => {
        opacity.value = withDelay(
          delay,
          withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
        );
        translateY.value = withDelay(
          delay,
          withSpring(0, animation.spring.gentle)
        );
      }, []);

      return useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
      }));
    },
    [getDelay]
  );

  return { getDelay, getAnimatedStyle };
}

// ============================================
// PULSE ANIMATION (for status indicators)
// ============================================
export function usePulse(active = true, interval = 2000) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!active) {
      scale.value = 1;
      return;
    }

    const pulse = () => {
      scale.value = withSequence(
        withSpring(1.15, animation.spring.snappy),
        withSpring(1, animation.spring.gentle)
      );
    };

    pulse();
    const timer = setInterval(pulse, interval);
    return () => clearInterval(timer);
  }, [active, interval, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, scale };
}

// ============================================
// SHIMMER LOADING EFFECT
// ============================================
export function useShimmer() {
  const translateX = useSharedValue(-100);

  const startShimmer = useCallback(() => {
    translateX.value = withRepeat(
      withTiming(100, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, [translateX]);

  const stopShimmer = useCallback(() => {
    translateX.value = -100;
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${translateX.value}%` as unknown as number }],
  }));

  return { startShimmer, stopShimmer, animatedStyle };
}

// ============================================
// ENTRANCE WITH AUTO-TRIGGER
// ============================================
export function useAutoEntrance(delay = 0) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(delay, withSpring(0, animation.spring.gentle));
    scale.value = withDelay(delay, withSpring(1, animation.spring.gentle));
  }, [delay, opacity, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return animatedStyle;
}

// ============================================
// VALUE CHANGE ANIMATION (for numbers)
// ============================================
export function useValueChange() {
  const scale = useSharedValue(1);

  const animateChange = useCallback(() => {
    scale.value = withSequence(
      withSpring(1.05, { damping: 15, stiffness: 400 }),
      withSpring(1, animation.spring.snappy)
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animateChange, animatedStyle };
}

// ============================================
// HAPTIC FEEDBACK HELPERS
// ============================================
export const haptics = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  selection: () => Haptics.selectionAsync(),
};
