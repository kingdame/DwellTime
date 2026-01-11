/**
 * Card Component
 * Themed container with optional header and shadow
 */

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';

import { colors, typography } from '@/constants';
import { useUIStore } from '@/shared/stores/uiStore';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  noPadding?: boolean;
}

export function Card({
  children,
  title,
  subtitle,
  onPress,
  style,
  contentStyle,
  noPadding = false,
}: CardProps) {
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColors.card,
          shadowColor: themeColors.cardShadow,
        },
        !isDark && styles.shadow,
        style,
      ]}
    >
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}

      <View style={[!noPadding && styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  shadow: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
});
