/**
 * ModalHeader Component
 * Reusable header for modal components
 */

import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/colors';

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  onAction?: () => void;
  actionText?: string;
  isLoading?: boolean;
  showBackButton?: boolean;
}

export function ModalHeader({
  title,
  onClose,
  onBack,
  onAction,
  actionText = 'Done',
  isLoading = false,
  showBackButton = false,
}: ModalHeaderProps) {
  const theme = colors.dark;

  return (
    <View style={[styles.header, { borderBottomColor: theme.divider }]}>
      <TouchableOpacity
        onPress={showBackButton && onBack ? onBack : onClose}
        style={styles.leftButton}
      >
        <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
          {showBackButton && onBack ? 'Back' : 'Cancel'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>

      {onAction ? (
        <TouchableOpacity
          onPress={onAction}
          style={styles.rightButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Text style={[styles.actionText, { color: theme.primary }]}>
              {actionText}
            </Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onClose} style={styles.rightButton}>
          <Text style={[styles.actionText, { color: theme.primary }]}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  leftButton: {
    width: 60,
    padding: 4,
  },
  rightButton: {
    width: 60,
    padding: 4,
    alignItems: 'flex-end',
  },
  buttonText: {
    fontSize: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
