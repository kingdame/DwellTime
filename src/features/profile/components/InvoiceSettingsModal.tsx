/**
 * InvoiceSettingsModal Component
 * Modal for editing invoice-related settings (company name, terms)
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '@/constants/colors';
import { useUpdateProfile } from '../hooks/useProfile';
import { VALIDATION_RULES, type ProfileUpdateInput } from '../services/profileService';

interface InvoiceSettingsModalProps {
  visible: boolean;
  userId: string;
  currentCompanyName: string | null;
  currentInvoiceTerms: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const DEFAULT_TERMS = [
  'Payment due within 30 days of invoice date.',
  'Payment due upon receipt. Late payments subject to 1.5% monthly interest.',
  'NET 15 - Payment due within 15 days.',
  'NET 45 - Payment due within 45 days.',
];

export function InvoiceSettingsModal({
  visible,
  userId,
  currentCompanyName,
  currentInvoiceTerms,
  onClose,
  onSuccess,
}: InvoiceSettingsModalProps) {
  const theme = colors.dark;
  const updateProfile = useUpdateProfile();

  const [companyName, setCompanyName] = useState(currentCompanyName || '');
  const [invoiceTerms, setInvoiceTerms] = useState(currentInvoiceTerms || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setCompanyName(currentCompanyName || '');
      setInvoiceTerms(currentInvoiceTerms || '');
      setErrors({});
    }
  }, [visible, currentCompanyName, currentInvoiceTerms]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (companyName.length > VALIDATION_RULES.companyName.maxLength) {
      newErrors.companyName = `Company name cannot exceed ${VALIDATION_RULES.companyName.maxLength} characters`;
    }

    if (invoiceTerms.length > VALIDATION_RULES.invoiceTerms.maxLength) {
      newErrors.invoiceTerms = `Invoice terms cannot exceed ${VALIDATION_RULES.invoiceTerms.maxLength} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await updateProfile.mutateAsync({
        userId: userId as any, // Cast to handle string vs Id type
        companyName: companyName.trim() || undefined,
        invoiceTerms: invoiceTerms.trim() || undefined,
      });

      Alert.alert('Saved', 'Invoice settings updated successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save');
    }
  };

  const hasChanges =
    companyName !== (currentCompanyName || '') ||
    invoiceTerms !== (currentInvoiceTerms || '');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelButton, { color: theme.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Invoice Settings
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!hasChanges || updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Text
                style={[
                  styles.saveButton,
                  { color: hasChanges ? theme.primary : theme.textDisabled },
                ]}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Company Name */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Company Name
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
              Displayed on invoices and reports
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary }]}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Your Company, LLC"
              placeholderTextColor={theme.textDisabled}
              maxLength={VALIDATION_RULES.companyName.maxLength}
            />

            {errors.companyName && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {errors.companyName}
              </Text>
            )}

            <Text style={[styles.charCount, { color: theme.textDisabled }]}>
              {companyName.length}/{VALIDATION_RULES.companyName.maxLength}
            </Text>
          </View>

          {/* Invoice Terms */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Invoice Terms
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
              Default payment terms shown on invoices
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: theme.card, color: theme.textPrimary },
              ]}
              value={invoiceTerms}
              onChangeText={setInvoiceTerms}
              placeholder="Payment due within 30 days..."
              placeholderTextColor={theme.textDisabled}
              multiline
              numberOfLines={4}
              maxLength={VALIDATION_RULES.invoiceTerms.maxLength}
            />

            {errors.invoiceTerms && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {errors.invoiceTerms}
              </Text>
            )}

            <Text style={[styles.charCount, { color: theme.textDisabled }]}>
              {invoiceTerms.length}/{VALIDATION_RULES.invoiceTerms.maxLength}
            </Text>

            {/* Quick Templates */}
            <Text style={[styles.templatesLabel, { color: theme.textSecondary }]}>
              Quick Templates
            </Text>
            <View style={styles.templates}>
              {DEFAULT_TERMS.map((term, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.templateButton, { backgroundColor: theme.card }]}
                  onPress={() => setInvoiceTerms(term)}
                >
                  <Text
                    style={[styles.templateText, { color: theme.textPrimary }]}
                    numberOfLines={2}
                  >
                    {term}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View style={[styles.previewCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.previewTitle, { color: theme.textSecondary }]}>
              Invoice Preview
            </Text>
            <Text style={[styles.previewCompany, { color: theme.textPrimary }]}>
              {companyName || 'Your Company Name'}
            </Text>
            <View style={styles.previewDivider} />
            <Text style={[styles.previewTerms, { color: theme.textSecondary }]}>
              {invoiceTerms || 'Payment terms will appear here'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cancelButton: {
    fontSize: 17,
    fontWeight: '500',
  },
  saveButton: {
    fontSize: 17,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 13,
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  templatesLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  templates: {
    gap: 8,
  },
  templateButton: {
    borderRadius: 10,
    padding: 12,
  },
  templateText: {
    fontSize: 13,
  },
  previewCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  previewCompany: {
    fontSize: 18,
    fontWeight: '700',
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 12,
  },
  previewTerms: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});
