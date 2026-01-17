/**
 * PaymentFollowUpModal Component
 * "Did you get paid?" modal for reporting payment outcomes
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors } from '@/constants/colors';
import { useReportPayment } from '../hooks/useFacilitiesConvex';
import type { PaymentFollowUp } from '@/shared/types/payment-tracking';

interface PaymentFollowUpModalProps {
  followUp: PaymentFollowUp & {
    invoices?: {
      invoice_number: string;
      total_amount: number;
      detention_events?: { facilities?: { name: string } }[];
    };
  };
  onComplete: () => void;
  onCancel: () => void;
}

interface ResponseOption {
  value: PaymentResponse;
  label: string;
  description: string;
  icon: string;
  color: string;
  needsAmount: boolean;
}

const RESPONSE_OPTIONS: ResponseOption[] = [
  {
    value: 'paid_full',
    label: 'Paid in Full',
    description: 'Received the full amount',
    icon: '✓',
    color: '#22C55E',
    needsAmount: false,
  },
  {
    value: 'paid_partial',
    label: 'Partial Payment',
    description: 'Received less than invoiced',
    icon: '½',
    color: '#F59E0B',
    needsAmount: true,
  },
  {
    value: 'not_paid',
    label: 'Not Paid',
    description: 'Did not receive payment',
    icon: '✗',
    color: '#EF4444',
    needsAmount: false,
  },
  {
    value: 'pending',
    label: 'Still Waiting',
    description: 'Payment is pending',
    icon: '⏳',
    color: '#6B7280',
    needsAmount: false,
  },
  {
    value: 'disputed',
    label: 'Disputed',
    description: 'Payment is being disputed',
    icon: '⚠',
    color: '#F97316',
    needsAmount: false,
  },
];

export function PaymentFollowUpModal({
  followUp,
  onComplete,
  onCancel,
}: PaymentFollowUpModalProps) {
  const theme = colors.dark;
  const reportPayment = useReportPayment();

  const [selectedResponse, setSelectedResponse] = useState<PaymentResponse | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDays, setPaymentDays] = useState('');
  const [notes, setNotes] = useState('');

  const invoiceNumber = followUp.invoices?.invoice_number || 'Unknown';
  const invoiceAmount = followUp.invoices?.total_amount || 0;
  const facilityName =
    followUp.invoices?.detention_events?.[0]?.facilities?.name || 'Unknown Facility';

  const selectedOption = RESPONSE_OPTIONS.find((o) => o.value === selectedResponse);

  const handleSubmit = useCallback(async () => {
    if (!selectedResponse) return;

    try {
      // Convex mutations are called directly
      await reportPayment({
        // Note: The Convex API may need facilityId and userId instead
        // This is a placeholder - the actual API depends on the Convex function
        wasPaid: selectedResponse === 'paid_full' || selectedResponse === 'paid_partial',
        paymentDays: paymentDays ? parseInt(paymentDays, 10) : undefined,
        notes: notes || undefined,
      });

      onComplete();
    } catch (error) {
      console.error('Failed to record response:', error);
    }
  }, [
    selectedResponse,
    paymentAmount,
    paymentDays,
    notes,
    reportPayment,
    onComplete,
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Did you get paid?
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Help other drivers by reporting your payment outcome
          </Text>
        </View>

        {/* Invoice Info */}
        <View style={[styles.invoiceCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.invoiceNumber, { color: theme.primary }]}>
            {invoiceNumber}
          </Text>
          <Text style={[styles.facilityName, { color: theme.textPrimary }]}>
            {facilityName}
          </Text>
          <Text style={[styles.invoiceAmount, { color: theme.success }]}>
            {formatCurrency(invoiceAmount)}
          </Text>
        </View>

        {/* Response Options */}
        <View style={styles.optionsContainer}>
          {RESPONSE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                { backgroundColor: theme.card },
                selectedResponse === option.value && {
                  borderColor: option.color,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelectedResponse(option.value)}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: option.color + '20' },
                ]}
              >
                <Text style={[styles.optionIconText, { color: option.color }]}>
                  {option.icon}
                </Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>
                  {option.label}
                </Text>
                <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                  {option.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Fields */}
        {selectedOption && (
          <View style={styles.additionalFields}>
            {selectedOption.needsAmount && (
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                  Amount Received
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.card, color: theme.textPrimary },
                  ]}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={theme.textDisabled}
                />
              </View>
            )}

            {(selectedResponse === 'paid_full' || selectedResponse === 'paid_partial') && (
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                  Days to Payment (optional)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.card, color: theme.textPrimary },
                  ]}
                  value={paymentDays}
                  onChangeText={setPaymentDays}
                  keyboardType="number-pad"
                  placeholder="e.g., 30"
                  placeholderTextColor={theme.textDisabled}
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Notes (optional)
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { backgroundColor: theme.card, color: theme.textPrimary },
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional details..."
                placeholderTextColor={theme.textDisabled}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.divider }]}
            onPress={onCancel}
          >
            <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
              Skip for Now
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: selectedResponse ? theme.primary : theme.divider },
            ]}
            onPress={handleSubmit}
            disabled={!selectedResponse || recordResponse.isPending}
          >
            {recordResponse.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
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
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  invoiceCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  invoiceAmount: {
    fontSize: 28,
    fontWeight: '700',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionIconText: {
    fontSize: 20,
    fontWeight: '600',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
  },
  additionalFields: {
    gap: 16,
    marginBottom: 24,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
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
    height: 80,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
