/**
 * Invoice Detail Screen
 * Shows full invoice details with actions
 */

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { useInvoice, useMarkInvoiceSent, useMarkInvoicePaid } from '../../src/shared/hooks/convex';
import type { Id } from '../../convex/_generated/dataModel';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateStr: string | number): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function InvoiceDetailScreen() {
  const theme = colors.dark;
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const invoice = useInvoice(id as Id<"invoices">);
  const markSent = useMarkInvoiceSent();
  const markPaid = useMarkInvoicePaid();
  
  const [isUpdating, setIsUpdating] = useState(false);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleMarkSent = useCallback(async () => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await markSent({ id: id as Id<"invoices"> });
      Alert.alert('Success', 'Invoice marked as sent');
    } catch (error) {
      Alert.alert('Error', 'Failed to update invoice');
    } finally {
      setIsUpdating(false);
    }
  }, [id, markSent]);

  const handleMarkPaid = useCallback(async () => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await markPaid({ id: id as Id<"invoices">, paidAmount: invoice?.totalAmount || 0 });
      Alert.alert('Success', 'Invoice marked as paid');
    } catch (error) {
      Alert.alert('Error', 'Failed to update invoice');
    } finally {
      setIsUpdating(false);
    }
  }, [id, markPaid, invoice]);

  const handleSendReminder = useCallback(() => {
    router.push({
      pathname: '/invoice/send',
      params: { id },
    });
  }, [router, id]);

  if (invoice === undefined) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
          Invoice not found
        </Text>
        <TouchableOpacity onPress={handleBack}>
          <Text style={[styles.linkText, { color: theme.primary }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: theme.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {invoice.invoiceNumber}
          </Text>
          <View
            style={[
              styles.statusBadge,
              invoice.status === 'draft' && { backgroundColor: '#FEF3C7' },
              invoice.status === 'sent' && { backgroundColor: '#DBEAFE' },
              invoice.status === 'paid' && { backgroundColor: '#D1FAE5' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                invoice.status === 'draft' && { color: '#92400E' },
                invoice.status === 'sent' && { color: '#1E40AF' },
                invoice.status === 'paid' && { color: '#065F46' },
              ]}
            >
              {invoice.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Amount Card */}
        <View style={[styles.amountCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>
            Total Amount
          </Text>
          <Text style={[styles.amountValue, { color: theme.success }]}>
            {formatCurrency(invoice.totalAmount)}
          </Text>
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            Created {formatDate(invoice._creationTime)}
          </Text>
        </View>

        {/* Recipient */}
        {invoice.recipientEmail && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Recipient
            </Text>
            <Text style={[styles.recipientText, { color: theme.textSecondary }]}>
              {invoice.recipientName || invoice.recipientEmail}
            </Text>
            <Text style={[styles.recipientEmail, { color: theme.textDisabled }]}>
              {invoice.recipientEmail}
            </Text>
          </View>
        )}

        {/* Actions */}
        {invoice.status !== 'paid' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: theme.primary }]}
              onPress={handleSendReminder}
            >
              <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                Send Email
              </Text>
            </TouchableOpacity>

            {invoice.status === 'draft' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.primary }]}
                onPress={handleMarkSent}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Mark as Sent</Text>
                )}
              </TouchableOpacity>
            )}

            {invoice.status === 'sent' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.success }]}
                onPress={handleMarkPaid}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Mark as Paid</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  amountCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  recipientText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  recipientEmail: {
    fontSize: 14,
  },
  actions: {
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    height: 50,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    borderWidth: 0,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
