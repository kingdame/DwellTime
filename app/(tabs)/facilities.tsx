/**
 * Facilities Tab - Manage saved facilities
 */

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors } from '../../src/constants/colors';

export default function FacilitiesTab() {
  const theme = colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Facilities</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Your saved locations
        </Text>
      </View>

      <Pressable
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => console.log('Add facility')}
      >
        <Text style={styles.addButtonText}>+ Add Facility</Text>
      </Pressable>

      <ScrollView style={styles.list}>
        <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
          <Text style={[styles.emptyIcon]}>🏢</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No facilities saved yet
          </Text>
          <Text style={[styles.emptyHint, { color: theme.textDisabled }]}>
            Add a facility to start tracking
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  addButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
  },
});
