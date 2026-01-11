/**
 * Reusable Card Component
 */

import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export function Card({ children, style, padding = 16 }: CardProps) {
  const theme = colors.dark;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
  },
});
