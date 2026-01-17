/**
 * Send Invoice Screen
 * Email invoice to recipient
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { 
  useInvoice, 
  useSendInvoiceEmail,
  useMostUsedContacts,
} from '../../src/shared/hooks/convex';
import { useCurrentUserId } from '../../src/features/auth';
import type { Id } from '../../convex/_generated/dataModel';

export default function SendInvoiceScreen() {
  const theme = colors.dark;
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useCurrentUserId() as Id<"users"> | undefined;
  
  const invoice = useInvoice(id as Id<"invoices">);
  const sendEmail = useSendInvoiceEmail();
  const frequentContacts = useMostUsedContacts(userId, 5);
  
  const [email, setEmail] = useState('');
  const [ccEmail, setCcEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSelectContact = useCallback((contactEmail: string) => {
    setEmail(contactEmail);
  }, []);

  const handleSend = useCallback(async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter a recipient email');
      return;
    }

    if (!id) return;

    setIsSending(true);
    try {
      await sendEmail({
        invoiceId: id as Id<"invoices">,
        recipientEmail: email.trim(),
        ccEmails: ccEmail.trim() ? [ccEmail.trim()] : undefined,
        customMessage: message.trim() || undefined,
      });

      Alert.alert('Success', `Invoice sent to ${email}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to send invoice. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [id, email, ccEmail, message, sendEmail, router]);

  if (invoice === undefined) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: theme.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Send Invoice
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Invoice Summary */}
        <View style={[styles.invoiceSummary, { backgroundColor: theme.card }]}>
          <Text style={[styles.invoiceNumber, { color: theme.textPrimary }]}>
            {invoice?.invoiceNumber || 'Invoice'}
          </Text>
          <Text style={[styles.invoiceAmount, { color: theme.success }]}>
            ${(invoice?.totalAmount || 0).toFixed(2)}
          </Text>
        </View>

        {/* Frequent Contacts */}
        {frequentContacts && frequentContacts.length > 0 && (
          <View style={styles.contactsSection}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              Recent Contacts
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {frequentContacts.map((contact) => (
                <TouchableOpacity
                  key={contact._id}
                  style={[styles.contactChip, { backgroundColor: theme.card }]}
                  onPress={() => handleSelectContact(contact.email)}
                >
                  <Text style={[styles.contactName, { color: theme.textPrimary }]}>
                    {contact.name || contact.email.split('@')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Email Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>To</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.card, color: theme.textPrimary },
              ]}
              placeholder="recipient@email.com"
              placeholderTextColor={theme.textDisabled}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>CC (optional)</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.card, color: theme.textPrimary },
              ]}
              placeholder="cc@email.com"
              placeholderTextColor={theme.textDisabled}
              value={ccEmail}
              onChangeText={setCcEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Message (optional)</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: theme.card, color: theme.textPrimary },
              ]}
              placeholder="Add a personal message..."
              placeholderTextColor={theme.textDisabled}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[
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
            <Text style={styles.sendButtonText}>Send Invoice</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  invoiceSummary: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  invoiceNumber: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  invoiceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  contactsSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  contactChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  sendButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
