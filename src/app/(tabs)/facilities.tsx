/**
 * Facilities Screen
 * Search and browse facilities with ratings
 */

import { View, Text, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUIStore } from '@/shared/stores/uiStore';
import { colors, typography } from '@/constants';

export default function FacilitiesScreen() {
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';

  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          Facilities
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          Search and rate facilities
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: themeColors.card,
              color: themeColors.textPrimary,
              borderColor: themeColors.divider,
            },
          ]}
          placeholder="Search by name or address..."
          placeholderTextColor={themeColors.textSecondary}
        />
      </View>

      {/* Empty State */}
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyIcon, { color: themeColors.textSecondary }]}>
          □
        </Text>
        <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
          No Facilities Yet
        </Text>
        <Text style={[styles.emptyDescription, { color: themeColors.textSecondary }]}>
          Facilities will appear here as you visit them or search for locations.
          Connect Supabase to enable facility search.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold as '700',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    marginTop: 4,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold as '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
});
