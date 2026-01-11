/**
 * LoadingSpinner Component
 * Themed loading indicator
 */

import { View, ActivityIndicator, Text, StyleSheet, type ViewStyle } from 'react-native';

import { colors, typography } from '@/constants';
import { useUIStore } from '@/shared/stores/uiStore';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export function LoadingSpinner({
  size = 'large',
  message,
  fullScreen = false,
  style,
}: LoadingSpinnerProps) {
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator size={size} color={colors.timer} />
      {message && (
        <Text style={[styles.message, { color: themeColors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View
        style={[
          styles.overlay,
          { backgroundColor: themeColors.background },
        ]}
      >
        {content}
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: typography.fontSize.base,
  },
});
