/**
 * SavedContactsManager Component
 * View, edit, and manage saved email contacts
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/constants/colors';
import {
  useEmailContacts,
  useSaveContact,
  useDeleteContact,
  useUpdateContact,
  useContactStats,
  type EmailContact,
} from '../hooks/useEmailContacts';

type ContactType = 'broker' | 'shipper' | 'dispatcher' | 'other';

interface SavedContactsManagerProps {
  onSelectContact?: (contact: EmailContact) => void;
  onClose?: () => void;
}

const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  broker: 'Broker',
  shipper: 'Shipper',
  dispatcher: 'Dispatcher',
  other: 'Other',
};

const CONTACT_TYPE_ICONS: Record<ContactType, string> = {
  broker: '🤝',
  shipper: '📦',
  dispatcher: '📞',
  other: '👤',
};

function ContactTypeFilter({
  selected,
  onChange,
  stats,
}: {
  selected: ContactType | null;
  onChange: (type: ContactType | null) => void;
  stats: { byType: Record<string, number> } | undefined;
}) {
  const theme = colors.dark;
  const types: (ContactType | null)[] = [null, 'broker', 'shipper', 'dispatcher', 'other'];

  return (
    <View style={styles.filterContainer}>
      {types.map((type) => {
        const isSelected = selected === type;
        const count = type ? stats?.byType[type] || 0 : undefined;

        return (
          <TouchableOpacity
            key={type || 'all'}
            style={[
              styles.filterButton,
              isSelected && { backgroundColor: theme.primary },
            ]}
            onPress={() => onChange(type)}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: isSelected ? '#FFF' : theme.textSecondary },
              ]}
            >
              {type ? CONTACT_TYPE_LABELS[type] : 'All'}
              {count !== undefined && count > 0 && ` (${count})`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ContactCard({
  contact,
  onEdit,
  onDelete,
  onSelect,
}: {
  contact: EmailContact;
  onEdit: () => void;
  onDelete: () => void;
  onSelect?: () => void;
}) {
  const theme = colors.dark;
  const typeIcon = contact.contact_type ? CONTACT_TYPE_ICONS[contact.contact_type] : '👤';

  return (
    <TouchableOpacity
      style={[styles.contactCard, { backgroundColor: theme.card }]}
      onPress={onSelect}
      disabled={!onSelect}
      activeOpacity={onSelect ? 0.7 : 1}
    >
      <View style={styles.contactIcon}>
        <Text style={styles.contactIconText}>{typeIcon}</Text>
      </View>

      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: theme.textPrimary }]} numberOfLines={1}>
          {contact.name || contact.email}
        </Text>
        {contact.name && (
          <Text style={[styles.contactEmail, { color: theme.textSecondary }]} numberOfLines={1}>
            {contact.email}
          </Text>
        )}
        <View style={styles.contactMeta}>
          {contact.company && (
            <Text style={[styles.contactCompany, { color: theme.textDisabled }]} numberOfLines={1}>
              {contact.company}
            </Text>
          )}
          {contact.use_count > 0 && (
            <Text style={[styles.contactUsage, { color: theme.primary }]}>
              {contact.use_count} send{contact.use_count !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.contactActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Text style={[styles.actionIcon, { color: theme.textSecondary }]}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Text style={[styles.actionIcon, { color: theme.danger }]}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function EditContactModal({
  contact,
  onSave,
  onClose,
  isNew,
}: {
  contact?: EmailContact;
  onSave: (data: Partial<EmailContact>) => void;
  onClose: () => void;
  isNew: boolean;
}) {
  const theme = colors.dark;
  const [name, setName] = useState(contact?.name || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [company, setCompany] = useState(contact?.company || '');
  const [contactType, setContactType] = useState<ContactType>(
    (contact?.contact_type as ContactType) || 'broker'
  );

  const handleSave = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    onSave({
      name: name.trim() || undefined,
      email: email.trim(),
      company: company.trim() || undefined,
      contact_type: contactType,
    });
    onClose();
  };

  return (
    <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
      <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
            {isNew ? 'Add Contact' : 'Edit Contact'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: theme.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary }]}
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            placeholderTextColor={theme.textDisabled}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Email *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary }]}
            value={email}
            onChangeText={setEmail}
            placeholder="john@example.com"
            placeholderTextColor={theme.textDisabled}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Company</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary }]}
            value={company}
            onChangeText={setCompany}
            placeholder="ABC Logistics"
            placeholderTextColor={theme.textDisabled}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Contact Type</Text>
          <View style={styles.typeSelector}>
            {(['broker', 'shipper', 'dispatcher', 'other'] as ContactType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeOption,
                  contactType === type && { backgroundColor: theme.primary },
                  { borderColor: contactType === type ? theme.primary : theme.card },
                ]}
                onPress={() => setContactType(type)}
              >
                <Text style={{ fontSize: 16 }}>{CONTACT_TYPE_ICONS[type]}</Text>
                <Text
                  style={[
                    styles.typeLabel,
                    { color: contactType === type ? '#FFF' : theme.textSecondary },
                  ]}
                >
                  {CONTACT_TYPE_LABELS[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: theme.textSecondary }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export function SavedContactsManager({
  onSelectContact,
  onClose,
}: SavedContactsManagerProps) {
  const theme = colors.dark;
  const [filterType, setFilterType] = useState<ContactType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingContact, setEditingContact] = useState<EmailContact | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: contacts, isLoading } = useEmailContacts();
  const { data: stats } = useContactStats();
  const saveContact = useSaveContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  // Filter contacts
  const filteredContacts = (contacts || []).filter((contact) => {
    // Type filter
    if (filterType && contact.contact_type !== filterType) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        contact.email.toLowerCase().includes(query) ||
        (contact.name && contact.name.toLowerCase().includes(query)) ||
        (contact.company && contact.company.toLowerCase().includes(query))
      );
    }

    return true;
  });

  const handleSaveContact = useCallback(
    async (data: Partial<EmailContact>) => {
      try {
        if (editingContact) {
          await updateContact.mutateAsync({
            id: editingContact.id,
            updates: data,
          });
        } else {
          await saveContact.mutateAsync({
            email: data.email!,
            name: data.name,
            company: data.company,
            contact_type: data.contact_type,
          });
        }
      } catch {
        Alert.alert('Error', 'Failed to save contact');
      }
    },
    [editingContact, updateContact, saveContact]
  );

  const handleDeleteContact = useCallback(
    (contact: EmailContact) => {
      Alert.alert(
        'Delete Contact',
        `Remove ${contact.name || contact.email} from your contacts?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteContact.mutateAsync(contact.id);
              } catch {
                Alert.alert('Error', 'Failed to delete contact');
              }
            },
          },
        ]
      );
    },
    [deleteContact]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>📧 Saved Contacts</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {stats ? `${stats.total} contact${stats.total !== 1 ? 's' : ''}` : 'Loading...'}
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeHeaderButton}>
            <Text style={[styles.closeHeaderText, { color: theme.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search contacts..."
          placeholderTextColor={theme.textDisabled}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={[styles.clearButton, { color: theme.textSecondary }]}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter */}
      <ContactTypeFilter selected={filterType} onChange={setFilterType} stats={stats} />

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addContactButton, { backgroundColor: theme.primary }]}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addContactButtonText}>+ Add New Contact</Text>
      </TouchableOpacity>

      {/* Contact List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading contacts...
          </Text>
        </View>
      ) : filteredContacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📧</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {searchQuery || filterType ? 'No contacts match your filter' : 'No saved contacts yet'}
          </Text>
          <Text style={[styles.emptyHint, { color: theme.textDisabled }]}>
            {searchQuery || filterType
              ? 'Try adjusting your search or filter'
              : 'Contacts are saved automatically when you send invoices'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContactCard
              contact={item}
              onEdit={() => setEditingContact(item)}
              onDelete={() => handleDeleteContact(item)}
              onSelect={onSelectContact ? () => onSelectContact(item) : undefined}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Edit Modal */}
      {(editingContact || showAddModal) && (
        <EditContactModal
          contact={editingContact || undefined}
          isNew={!editingContact}
          onSave={handleSaveContact}
          onClose={() => {
            setEditingContact(null);
            setShowAddModal(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 44,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  closeHeaderButton: {
    padding: 8,
  },
  closeHeaderText: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  clearButton: {
    fontSize: 22,
    fontWeight: '300',
    paddingHorizontal: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  addContactButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addContactButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    gap: 10,
    paddingBottom: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactIconText: {
    fontSize: 20,
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
  },
  contactEmail: {
    fontSize: 13,
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  contactCompany: {
    fontSize: 12,
  },
  contactUsage: {
    fontSize: 11,
    fontWeight: '500',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 8,
  },
  actionIcon: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 20,
    padding: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
