/**
 * SendInvoiceModal Component
 * Modal for composing and sending invoice emails
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
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { colors } from '@/constants/colors';
import { ContactPicker, type Contact } from './ContactPicker';
import { EmailPreview } from './EmailPreview';
import type { InvoiceWithDetails } from '../services/invoiceService';

interface SendInvoiceModalProps {
  invoice: InvoiceWithDetails;
  recentContacts: Contact[];
  onSend: (email: string, ccEmail?: string, message?: string) => Promise<void>;
  onCancel: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function SendInvoiceModal({
  invoice,
  recentContacts,
  onSend,
  onCancel,
}: SendInvoiceModalProps) {
  const theme = colors.dark;

  const [recipientEmail, setRecipientEmail] = useState(invoice.recipient_email || '');
  const [showCcField, setShowCcField] = useState(false);
  const [ccEmail, setCcEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [ccError, setCcError] = useState('');

  const validateInputs = useCallback((): boolean => {
    let isValid = true;

    if (!recipientEmail.trim()) {
      setEmailError('Email address is required');
      isValid = false;
    } else if (!isValidEmail(recipientEmail)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (showCcField && ccEmail.trim() && !isValidEmail(ccEmail)) {
      setCcError('Please enter a valid CC email address');
      isValid = false;
    } else {
      setCcError('');
    }

    return isValid;
  }, [recipientEmail, ccEmail, showCcField]);

  const handleContactSelect = useCallback((contact: Contact) => {
    setRecipientEmail(contact.email);
    setEmailError('');
  }, []);

  const handlePreview = useCallback(() => {
    if (validateInputs()) {
      setShowPreview(true);
    }
  }, [validateInputs]);

  const handleSend = useCallback(async () => {
    if (!validateInputs()) return;

    setIsSending(true);
    try {
      await onSend(
        recipientEmail.trim(),
        showCcField && ccEmail.trim() ? ccEmail.trim() : undefined,
        customMessage.trim() || undefined
      );
      Alert.alert(
        'Invoice Sent',
        `Invoice ${invoice.invoice_number} has been sent to ${recipientEmail}`,
        [{ text: 'OK', onPress: onCancel }]
      );
    } catch (error) {
      Alert.alert(
        'Send Failed',
        error instanceof Error ? error.message : 'Failed to send invoice email'
      );
    } finally {
      setIsSending(false);
    }
  }, [
    validateInputs,
    recipientEmail,
    ccEmail,
    customMessage,
    showCcField,
    invoice.invoice_number,
    onSend,
    onCancel,
  ]);

  if (showPreview) {
    return (
      <Modal visible animationType="slide" presentationStyle="pageSheet">
        <EmailPreview
          invoice={invoice}
          recipientEmail={recipientEmail}
          ccEmail={showCcField && ccEmail ? ccEmail : undefined}
          customMessage={customMessage || undefined}
          onClose={() => setShowPreview(false)}
        />
      </Modal>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Send Invoice {invoice.invoice_number}
            </Text>
            <Text style={[styles.amount, { color: theme.success }]}>
              Amount: {formatCurrency(invoice.total_amount)}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: theme.textSecondary }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {/* Email Input */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            To:
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.card, color: theme.textPrimary },
              emailError && { borderColor: theme.error, borderWidth: 1 },
            ]}
            value={recipientEmail}
            onChangeText={(text) => {
              setRecipientEmail(text);
              if (emailError) setEmailError('');
            }}
            placeholder="recipient@example.com"
            placeholderTextColor={theme.textDisabled}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {emailError && (
            <Text style={[styles.errorText, { color: theme.error }]}>
              {emailError}
            </Text>
          )}
        </View>

        {/* CC Field */}
        {showCcField ? (
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              CC:
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.card, color: theme.textPrimary },
                ccError && { borderColor: theme.error, borderWidth: 1 },
              ]}
              value={ccEmail}
              onChangeText={(text) => {
                setCcEmail(text);
                if (ccError) setCcError('');
              }}
              placeholder="cc@example.com"
              placeholderTextColor={theme.textDisabled}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {ccError && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {ccError}
              </Text>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addCcButton}
            onPress={() => setShowCcField(true)}
          >
            <Text style={[styles.addCcText, { color: theme.primary }]}>
              + Add CC
            </Text>
          </TouchableOpacity>
        )}

        {/* Contact Picker */}
        {recentContacts.length > 0 && (
          <ContactPicker
            contacts={recentContacts}
            onSelectContact={handleContactSelect}
            selectedEmail={recipientEmail}
          />
        )}

        {/* Custom Message */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Message (optional):
          </Text>
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: theme.card, color: theme.textPrimary },
            ]}
            value={customMessage}
            onChangeText={setCustomMessage}
            placeholder="Please find attached my detention invoice for services rendered..."
            placeholderTextColor={theme.textDisabled}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.previewButton, { borderColor: theme.divider }]}
            onPress={handlePreview}
            disabled={isSending}
          >
            <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
              Preview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.sendButton,
              { backgroundColor: theme.primary },
              isSending && styles.buttonDisabled,
            ]}
            onPress={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.buttonText, { color: '#fff' }]}>
                Send Email
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
  closeText: {
    fontSize: 20,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 20,
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
  textArea: {
    minHeight: 100,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
  },
  addCcButton: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  addCcText: {
    fontSize: 14,
    fontWeight: '600',
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
  previewButton: {
    borderWidth: 1,
  },
  sendButton: {},
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
