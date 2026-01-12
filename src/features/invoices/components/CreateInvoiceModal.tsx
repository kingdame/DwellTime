/**
 * CreateInvoiceModal Component
 * Modal for creating an invoice from selected detention events
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '@/constants/colors';
import { useCreateInvoice } from '../hooks/useInvoices';
import type { DetentionRecord } from '@/features/history';

interface CreateInvoiceModalProps {
  userId: string;
  availableEvents: DetentionRecord[];
  onSuccess: (invoiceId: string) => void;
  onCancel: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function CreateInvoiceModal({
  userId,
  availableEvents,
  onSuccess,
  onCancel,
}: CreateInvoiceModalProps) {
  const theme = colors.dark;
  const createInvoice = useCreateInvoice(userId);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientCompany, setRecipientCompany] = useState('');

  const selectedEvents = availableEvents.filter((e) => selectedIds.has(e.id));
  const totalAmount = selectedEvents.reduce(
    (sum, e) => sum + e.detentionAmount,
    0
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(availableEvents.map((e) => e.id)));
  }, [availableEvents]);

  const selectNone = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleCreate = useCallback(async () => {
    if (selectedIds.size === 0) {
      Alert.alert('No Events Selected', 'Please select at least one detention event');
      return;
    }

    try {
      const invoice = await createInvoice.mutateAsync({
        detentionEventIds: Array.from(selectedIds),
        recipientEmail: recipientEmail.trim() || undefined,
        recipientName: recipientName.trim() || undefined,
        recipientCompany: recipientCompany.trim() || undefined,
      });
      onSuccess(invoice.id);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create invoice'
      );
    }
  }, [selectedIds, recipientEmail, recipientName, recipientCompany, createInvoice, onSuccess]);

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Create Invoice
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Select detention events to include
      </Text>

      {/* Selection Controls */}
      <View style={styles.selectionControls}>
        <TouchableOpacity onPress={selectAll}>
          <Text style={[styles.selectionLink, { color: theme.primary }]}>
            Select All
          </Text>
        </TouchableOpacity>
        <Text style={[styles.selectionDivider, { color: theme.textDisabled }]}>
          |
        </Text>
        <TouchableOpacity onPress={selectNone}>
          <Text style={[styles.selectionLink, { color: theme.primary }]}>
            Clear
          </Text>
        </TouchableOpacity>
        <Text style={[styles.selectionCount, { color: theme.textSecondary }]}>
          {selectedIds.size} of {availableEvents.length} selected
        </Text>
      </View>

      {/* Event List */}
      <View style={styles.eventList}>
        {availableEvents.length === 0 ? (
          <View style={[styles.emptyEvents, { backgroundColor: theme.card }]}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No completed detention events available for invoicing
            </Text>
          </View>
        ) : (
          availableEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={[
                styles.eventRow,
                { backgroundColor: theme.card },
                selectedIds.has(event.id) && {
                  borderColor: theme.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => toggleSelection(event.id)}
              activeOpacity={0.7}
            >
              <View style={styles.checkbox}>
                {selectedIds.has(event.id) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <View style={styles.eventInfo}>
                <Text
                  style={[styles.eventFacility, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {event.facilityName}
                </Text>
                <Text style={[styles.eventDate, { color: theme.textSecondary }]}>
                  {formatDate(event.arrivalTime)} • {event.eventType}
                </Text>
              </View>
              <Text style={[styles.eventAmount, { color: theme.success }]}>
                {formatCurrency(event.detentionAmount)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Total */}
      {selectedIds.size > 0 && (
        <View style={[styles.totalRow, { backgroundColor: theme.card }]}>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
            Invoice Total
          </Text>
          <Text style={[styles.totalAmount, { color: theme.success }]}>
            {formatCurrency(totalAmount)}
          </Text>
        </View>
      )}

      {/* Recipient Info */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        Recipient (Optional)
      </Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Company
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary }]}
          value={recipientCompany}
          onChangeText={setRecipientCompany}
          placeholder="Acme Trucking Co."
          placeholderTextColor={theme.textDisabled}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Contact Name
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary }]}
          value={recipientName}
          onChangeText={setRecipientName}
          placeholder="John Smith"
          placeholderTextColor={theme.textDisabled}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Email
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary }]}
          value={recipientEmail}
          onChangeText={setRecipientEmail}
          placeholder="billing@example.com"
          placeholderTextColor={theme.textDisabled}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { borderColor: theme.divider }]}
          onPress={onCancel}
        >
          <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.createButton,
            { backgroundColor: theme.primary },
            (selectedIds.size === 0 || createInvoice.isPending) && styles.buttonDisabled,
          ]}
          onPress={handleCreate}
          disabled={selectedIds.size === 0 || createInvoice.isPending}
        >
          {createInvoice.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.buttonText, { color: '#fff' }]}>
              Create Invoice
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  selectionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectionLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectionDivider: {
    marginHorizontal: 12,
  },
  selectionCount: {
    marginLeft: 'auto',
    fontSize: 13,
  },
  eventList: {
    marginBottom: 16,
  },
  emptyEvents: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventInfo: {
    flex: 1,
  },
  eventFacility: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  eventAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  createButton: {},
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
