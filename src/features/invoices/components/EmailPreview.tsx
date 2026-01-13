/**
 * EmailPreview Component
 * Shows a preview of the email that will be sent with the invoice
 */

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '@/constants/colors';
import type { InvoiceWithDetails } from '../services/invoiceService';

interface EmailPreviewProps {
  invoice: InvoiceWithDetails;
  recipientEmail: string;
  ccEmail?: string;
  customMessage?: string;
  onClose: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function EmailPreview({
  invoice,
  recipientEmail,
  ccEmail,
  customMessage,
  onClose,
}: EmailPreviewProps) {
  const theme = colors.dark;
  const { userProfile, lineItems } = invoice;

  const senderName = userProfile.company_name || userProfile.name || 'DwellTime User';
  const defaultMessage = `Please find attached invoice ${invoice.invoice_number} for detention services. Payment is due within 30 days.`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Email Preview
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={[styles.closeText, { color: theme.textSecondary }]}>
            Close
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Email Headers */}
        <View style={[styles.emailHeaders, { backgroundColor: theme.card }]}>
          <View style={styles.emailHeaderRow}>
            <Text style={[styles.emailHeaderLabel, { color: theme.textSecondary }]}>
              From:
            </Text>
            <Text style={[styles.emailHeaderValue, { color: theme.textPrimary }]}>
              {senderName} &lt;{userProfile.email || 'noreply@dwelltime.app'}&gt;
            </Text>
          </View>
          <View style={styles.emailHeaderRow}>
            <Text style={[styles.emailHeaderLabel, { color: theme.textSecondary }]}>
              To:
            </Text>
            <Text style={[styles.emailHeaderValue, { color: theme.textPrimary }]}>
              {recipientEmail}
            </Text>
          </View>
          {ccEmail && (
            <View style={styles.emailHeaderRow}>
              <Text style={[styles.emailHeaderLabel, { color: theme.textSecondary }]}>
                CC:
              </Text>
              <Text style={[styles.emailHeaderValue, { color: theme.textPrimary }]}>
                {ccEmail}
              </Text>
            </View>
          )}
          <View style={styles.emailHeaderRow}>
            <Text style={[styles.emailHeaderLabel, { color: theme.textSecondary }]}>
              Subject:
            </Text>
            <Text style={[styles.emailHeaderValue, { color: theme.textPrimary }]}>
              Invoice {invoice.invoice_number} - {formatCurrency(invoice.total_amount)}
            </Text>
          </View>
        </View>

        {/* Email Body Preview */}
        <View style={[styles.emailBody, { backgroundColor: theme.card }]}>
          <Text style={[styles.greeting, { color: theme.textPrimary }]}>
            Hello,
          </Text>

          <Text style={[styles.messageText, { color: theme.textPrimary }]}>
            {customMessage || defaultMessage}
          </Text>

          {/* Invoice Summary Card */}
          <View style={[styles.invoiceSummary, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.summaryHeader}>
              <Text style={[styles.summaryTitle, { color: theme.primary }]}>
                Invoice {invoice.invoice_number}
              </Text>
              <Text style={[styles.summaryDate, { color: theme.textSecondary }]}>
                {formatDate(invoice.created_at)}
              </Text>
            </View>

            <View style={[styles.summaryDivider, { backgroundColor: theme.divider }]} />

            <View style={styles.summaryDetails}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Detention Events
                </Text>
                <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>
                  {lineItems.length}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Amount Due
                </Text>
                <Text style={[styles.summaryAmount, { color: theme.success }]}>
                  {formatCurrency(invoice.total_amount)}
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.closingText, { color: theme.textPrimary }]}>
            The detailed invoice PDF is attached to this email.
          </Text>

          <Text style={[styles.signature, { color: theme.textPrimary }]}>
            Best regards,{'\n'}
            {senderName}
          </Text>
        </View>

        {/* Attachment Preview */}
        <View style={[styles.attachmentSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.attachmentLabel, { color: theme.textSecondary }]}>
            Attachment:
          </Text>
          <View style={[styles.attachmentItem, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={styles.attachmentIcon}>📎</Text>
            <View style={styles.attachmentInfo}>
              <Text style={[styles.attachmentName, { color: theme.textPrimary }]}>
                Invoice_{invoice.invoice_number}.pdf
              </Text>
              <Text style={[styles.attachmentSize, { color: theme.textSecondary }]}>
                PDF Document
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Text style={[styles.footerNoteText, { color: theme.textDisabled }]}>
            This is a preview of how the email will appear to the recipient.
            The actual email may vary slightly based on email client.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emailHeaders: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  emailHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  emailHeaderLabel: {
    width: 60,
    fontSize: 13,
    fontWeight: '600',
  },
  emailHeaderValue: {
    flex: 1,
    fontSize: 13,
  },
  emailBody: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  greeting: {
    fontSize: 15,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  invoiceSummary: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryDate: {
    fontSize: 13,
  },
  summaryDivider: {
    height: 1,
    marginBottom: 12,
  },
  summaryDetails: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  closingText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  signature: {
    fontSize: 15,
    lineHeight: 22,
  },
  attachmentSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  attachmentLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  attachmentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  attachmentSize: {
    fontSize: 12,
    marginTop: 2,
  },
  footerNote: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  footerNoteText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
