/**
 * ContactPicker Component
 * Displays a list of recent/saved contacts for quick email selection
 */

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { colors } from '@/constants/colors';

export type ContactType = 'broker' | 'shipper' | 'carrier' | 'dispatch' | 'other';

export interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  type: ContactType;
}

interface ContactPickerProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  selectedEmail?: string;
}

const TYPE_COLORS: Record<ContactType, string> = {
  broker: '#3B82F6',
  shipper: '#22C55E',
  carrier: '#F97316',
  dispatch: '#A855F7',
  other: '#6B7280',
};

const TYPE_LABELS: Record<ContactType, string> = {
  broker: 'Broker',
  shipper: 'Shipper',
  carrier: 'Carrier',
  dispatch: 'Dispatch',
  other: 'Other',
};

export function ContactPicker({
  contacts,
  onSelectContact,
  selectedEmail,
}: ContactPickerProps) {
  const theme = colors.dark;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  const renderContact = useCallback(
    ({ item }: { item: Contact }) => {
      const isSelected = item.email === selectedEmail;
      const typeColor = TYPE_COLORS[item.type];

      return (
        <TouchableOpacity
          style={[
            styles.contactRow,
            { backgroundColor: theme.card },
            isSelected && { borderColor: theme.primary, borderWidth: 2 },
          ]}
          onPress={() => onSelectContact(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
            <Text style={[styles.typeBadgeText, { color: typeColor }]}>
              {TYPE_LABELS[item.type]}
            </Text>
          </View>
          <View style={styles.contactInfo}>
            <Text
              style={[styles.contactName, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {item.company || item.name}
            </Text>
            <Text
              style={[styles.contactEmail, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {item.email}
            </Text>
          </View>
          {isSelected && (
            <Text style={[styles.checkmark, { color: theme.primary }]}>✓</Text>
          )}
        </TouchableOpacity>
      );
    },
    [theme, selectedEmail, onSelectContact]
  );

  const renderEmpty = useCallback(
    () => (
      <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.emptyIcon]}>📇</Text>
        <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
          {searchQuery ? 'No contacts found' : 'No saved contacts'}
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          {searchQuery
            ? 'Try a different search term'
            : 'Contacts will appear here after you send invoices'}
        </Text>
      </View>
    ),
    [theme, searchQuery]
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        Recent Contacts
      </Text>

      {contacts.length > 3 && (
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              { backgroundColor: theme.card, color: theme.textPrimary },
            ]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search contacts..."
            placeholderTextColor={theme.textDisabled}
          />
        </View>
      )}

      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  listContent: {
    gap: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 13,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
});
