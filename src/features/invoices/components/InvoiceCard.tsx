/**
 * InvoiceCard Component
 * Displays a single invoice summary
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import type { Invoice } from '@/shared/types';

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: () => void;
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
    year: 'numeric',
  });
}

function getStatusConfig(status: Invoice['status']): {
  label: string;
  bgColor: string;
  textColor: string;
} {
  switch (status) {
    case 'draft':
      return { label: 'Draft', bgColor: '#FEF3C7', textColor: '#92400E' };
    case 'sent':
      return { label: 'Sent', bgColor: '#DBEAFE', textColor: '#1E40AF' };
    case 'paid':
      return { label: 'Paid', bgColor: '#D1FAE5', textColor: '#065F46' };
    default:
      return { label: status, bgColor: '#E5E7EB', textColor: '#374151' };
  }
}

export function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
  const theme = colors.dark;
  const statusConfig = getStatusConfig(invoice.status);
  const eventCount = invoice.detention_event_ids.length;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.invoiceNumber, { color: theme.primary }]}>
            {invoice.invoice_number}
          </Text>
          <Text style={[styles.date, { color: theme.textSecondary }]}>
            {formatDate(invoice.created_at)}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.bgColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.textDisabled }]}>
            Events
          </Text>
          <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
            {eventCount}
          </Text>
        </View>

        {invoice.recipient_email && (
          <View style={[styles.detailItem, { flex: 2 }]}>
            <Text style={[styles.detailLabel, { color: theme.textDisabled }]}>
              To
            </Text>
            <Text
              style={[styles.detailValue, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {invoice.recipient_email}
            </Text>
          </View>
        )}

        <View style={styles.amountContainer}>
          <Text style={[styles.amountLabel, { color: theme.textDisabled }]}>
            Total
          </Text>
          <Text style={[styles.amount, { color: theme.success }]}>
            {formatCurrency(invoice.total_amount)}
          </Text>
        </View>
      </View>

      {invoice.sent_at && (
        <View style={[styles.footer, { borderTopColor: theme.divider }]}>
          <Text style={[styles.footerText, { color: theme.textDisabled }]}>
            Sent {formatDate(invoice.sent_at)}
          </Text>
          {invoice.paid_at && (
            <Text style={[styles.footerText, { color: theme.success }]}>
              Paid {formatDate(invoice.paid_at)}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  date: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: {
    fontSize: 12,
  },
});
