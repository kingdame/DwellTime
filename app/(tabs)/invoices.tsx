/**
 * Invoices Tab - Create and manage invoices
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';
import {
  InvoiceList,
  InvoiceSummaryCard,
  CreateInvoiceModal,
  SendInvoiceModal,
  SavedContactsManager,
  useInvoiceDetails,
  useUpdateInvoiceStatus,
  useShareInvoice,
  useSendInvoiceEmail,
  useFrequentContacts,
  type InvoiceWithDetails,
  type Contact,
} from '../../src/features/invoices';
import { useDetentionHistory, type DetentionRecord } from '../../src/features/history';
import type { Invoice } from '../../src/shared/types';

// Mock user ID for now (would come from auth context)
const MOCK_USER_ID = 'demo-user-id';

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

function InvoiceDetailModal({
  invoiceId,
  onClose,
  onStatusUpdate,
  onSendPress,
}: {
  invoiceId: string;
  onClose: () => void;
  onStatusUpdate: () => void;
  onSendPress: (invoice: InvoiceWithDetails) => void;
}) {
  const theme = colors.dark;
  const { data: invoice, isLoading } = useInvoiceDetails(invoiceId);
  const updateStatus = useUpdateInvoiceStatus();
  const shareInvoice = useShareInvoice();

  const handleMarkSent = useCallback(async () => {
    try {
      await updateStatus.mutateAsync({ invoiceId, status: 'sent' });
      onStatusUpdate();
      Alert.alert('Success', 'Invoice marked as sent');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update');
    }
  }, [invoiceId, updateStatus, onStatusUpdate]);

  const handleMarkPaid = useCallback(async () => {
    try {
      await updateStatus.mutateAsync({ invoiceId, status: 'paid' });
      onStatusUpdate();
      Alert.alert('Success', 'Invoice marked as paid');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update');
    }
  }, [invoiceId, updateStatus, onStatusUpdate]);

  const handleShare = useCallback(async () => {
    if (!invoice) return;
    try {
      await shareInvoice.mutateAsync({ invoice });
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to share');
    }
  }, [invoice, shareInvoice]);

  const handleSendEmail = useCallback(() => {
    if (invoice) {
      onSendPress(invoice);
    }
  }, [invoice, onSendPress]);

  if (isLoading || !invoice) {
    return (
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.closeButton, { color: theme.primary }]}>Close</Text>
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
          {invoice.invoice_number}
        </Text>
        <TouchableOpacity onPress={handleShare} disabled={shareInvoice.isPending}>
          {shareInvoice.isPending ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Text style={[styles.shareButton, { color: theme.primary }]}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalContent}>
        {/* Status & Total */}
        <View style={[styles.totalCard, { backgroundColor: theme.card }]}>
          <View style={styles.statusRow}>
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
            <Text style={[styles.dateText, { color: theme.textSecondary }]}>
              Created {formatDate(invoice.created_at)}
            </Text>
          </View>
          <Text style={[styles.totalAmount, { color: theme.success }]}>
            {formatCurrency(invoice.total_amount)}
          </Text>
          <Text style={[styles.eventCount, { color: theme.textSecondary }]}>
            {invoice.lineItems.length} detention event{invoice.lineItems.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Line Items */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Events
          </Text>
          {invoice.lineItems.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.lineItem,
                index < invoice.lineItems.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.divider,
                },
              ]}
            >
              <View style={styles.lineItemInfo}>
                <Text style={[styles.lineItemFacility, { color: theme.textPrimary }]}>
                  {item.facilityName}
                </Text>
                <Text style={[styles.lineItemDate, { color: theme.textSecondary }]}>
                  {formatDate(item.date)} • {item.eventType}
                </Text>
              </View>
              <Text style={[styles.lineItemAmount, { color: theme.success }]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Recipient */}
        {invoice.recipient_email && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Recipient
            </Text>
            <Text style={[styles.recipientEmail, { color: theme.textSecondary }]}>
              {invoice.recipient_email}
            </Text>
          </View>
        )}

        {/* Actions */}
        {invoice.status !== 'paid' && (
          <View style={styles.actions}>
            {/* Send Email Button - available for draft and sent invoices */}
            <TouchableOpacity
              style={[styles.actionButton, styles.sendEmailButton, { borderColor: theme.primary }]}
              onPress={handleSendEmail}
            >
              <Text style={[styles.sendEmailButtonText, { color: theme.primary }]}>
                Send Email
              </Text>
            </TouchableOpacity>

            {invoice.status === 'draft' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.primary, marginTop: 12 }]}
                onPress={handleMarkSent}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Mark as Sent</Text>
                )}
              </TouchableOpacity>
            )}
            {invoice.status === 'sent' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.success, marginTop: 12 }]}
                onPress={handleMarkPaid}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Mark as Paid</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function InvoicesTab() {
  const theme = colors.dark;
  const router = useRouter();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [invoiceToSend, setInvoiceToSend] = useState<InvoiceWithDetails | null>(null);

  // Fetch completed events for invoice creation
  const { data: historyData } = useDetentionHistory({ status: 'completed' }, 100, 0);
  const availableEvents = (historyData || []) as DetentionRecord[];

  // Fetch frequent contacts for send modal
  const { data: frequentContacts } = useFrequentContacts(5);
  const sendInvoiceEmail = useSendInvoiceEmail();

  // Transform EmailContact to Contact type for SendInvoiceModal
  const recentContacts: Contact[] = (frequentContacts || []).map((contact) => ({
    id: contact.id,
    name: contact.name || contact.email.split('@')[0],
    email: contact.email,
    company: contact.company || undefined,
    type: 'other' as const,
  }));

  const handleInvoicePress = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedInvoice(null);
  }, []);

  const handleCreateSuccess = useCallback((_invoiceId: string) => {
    setShowCreateModal(false);
    // Optionally open the new invoice
  }, []);

  const handleSendPress = useCallback((invoice: InvoiceWithDetails) => {
    setInvoiceToSend(invoice);
    setShowSendModal(true);
  }, []);

  const handleCloseSendModal = useCallback(() => {
    setShowSendModal(false);
    setInvoiceToSend(null);
  }, []);

  const handleSendInvoice = useCallback(
    async (email: string, ccEmail?: string, message?: string) => {
      if (!invoiceToSend) return;

      await sendInvoiceEmail.mutateAsync({
        invoiceId: invoiceToSend.id,
        recipientEmail: email,
        ccEmails: ccEmail ? [ccEmail] : undefined,
        customMessage: message,
      });

      // Close modals and show success
      handleCloseSendModal();
      setSelectedInvoice(null);
      Alert.alert('Success', `Invoice sent to ${email}`);
    },
    [invoiceToSend, sendInvoiceEmail, handleCloseSendModal]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Invoices</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Manage your billing
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.recoveryButton, { backgroundColor: theme.card }]}
              onPress={() => setShowContactsModal(true)}
            >
              <Text style={[styles.recoveryButtonText, { color: theme.primary }]}>
                Contacts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.recoveryButton, { backgroundColor: theme.card }]}
              onPress={() => router.push('/recovery')}
            >
              <Text style={[styles.recoveryButtonText, { color: theme.primary }]}>
                Recovery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.createButtonText}>+ New</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryContainer}>
        <InvoiceSummaryCard userId={MOCK_USER_ID} />
      </View>

      {/* Invoice List */}
      <InvoiceList userId={MOCK_USER_ID} onInvoicePress={handleInvoicePress} />

      {/* Detail Modal */}
      <Modal
        visible={selectedInvoice !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseDetail}
      >
        {selectedInvoice && (
          <InvoiceDetailModal
            invoiceId={selectedInvoice.id}
            onClose={handleCloseDetail}
            onStatusUpdate={() => {}}
            onSendPress={handleSendPress}
          />
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <CreateInvoiceModal
            userId={MOCK_USER_ID}
            availableEvents={availableEvents}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateModal(false)}
          />
        </SafeAreaView>
      </Modal>

      {/* Send Invoice Modal */}
      <Modal
        visible={showSendModal && invoiceToSend !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseSendModal}
      >
        {invoiceToSend && (
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <SendInvoiceModal
              invoice={invoiceToSend}
              recentContacts={recentContacts}
              onSend={handleSendInvoice}
              onCancel={handleCloseSendModal}
            />
          </SafeAreaView>
        )}
      </Modal>

      {/* Saved Contacts Modal */}
      <Modal
        visible={showContactsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowContactsModal(false)}
      >
        <SavedContactsManager onClose={() => setShowContactsModal(false)} />
      </Modal>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recoveryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  recoveryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  summaryContainer: {
    marginBottom: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeButton: {
    fontSize: 17,
    fontWeight: '500',
  },
  shareButton: {
    fontSize: 17,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 13,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventCount: {
    fontSize: 14,
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
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  lineItemInfo: {
    flex: 1,
  },
  lineItemFacility: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  lineItemDate: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  lineItemAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  recipientEmail: {
    fontSize: 15,
  },
  actions: {
    marginBottom: 40,
  },
  actionButton: {
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sendEmailButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  sendEmailButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
