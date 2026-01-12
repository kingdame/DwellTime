/**
 * DetentionSettingsModal Component
 * Modal for editing detention-related settings (hourly rate, grace period)
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
import {
  VALIDATION_RULES,
  formatGracePeriod,
  formatHourlyRate,
  type ProfileUpdateInput,
} from '../services/profileService';

interface DetentionSettingsModalProps {
  visible: boolean;
  userId: string;
  currentHourlyRate: number;
  currentGracePeriod: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const GRACE_PERIOD_OPTIONS = [
  { label: 'No grace period', value: 0 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 },
];

export function DetentionSettingsModal({
  visible,
  userId,
  currentHourlyRate,
  currentGracePeriod,
  onClose,
  onSuccess,
}: DetentionSettingsModalProps) {
  const theme = colors.dark;
  const updateProfile = useUpdateProfile(userId);

  const [hourlyRate, setHourlyRate] = useState(currentHourlyRate.toString());
  const [gracePeriod, setGracePeriod] = useState(currentGracePeriod);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setHourlyRate(currentHourlyRate.toString());
      setGracePeriod(currentGracePeriod);
      setErrors({});
    }
  }, [visible, currentHourlyRate, currentGracePeriod]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate)) {
      newErrors.hourly_rate = 'Please enter a valid number';
    } else if (rate < VALIDATION_RULES.hourly_rate.min) {
      newErrors.hourly_rate = `Minimum rate is $${VALIDATION_RULES.hourly_rate.min}/hr`;
    } else if (rate > VALIDATION_RULES.hourly_rate.max) {
      newErrors.hourly_rate = `Maximum rate is $${VALIDATION_RULES.hourly_rate.max}/hr`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const updates: ProfileUpdateInput = {
      hourly_rate: parseFloat(hourlyRate),
      grace_period_minutes: gracePeriod,
    };

    try {
      const result = await updateProfile.mutateAsync(updates);

      if (result.success) {
        Alert.alert('Saved', 'Detention settings updated successfully');
        onSuccess?.();
        onClose();
      } else if (result.errors) {
        const errorMap: Record<string, string> = {};
        result.errors.forEach((e) => {
          errorMap[e.field] = e.message;
        });
        setErrors(errorMap);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save');
    }
  };

  const hasChanges =
    parseFloat(hourlyRate) !== currentHourlyRate || gracePeriod !== currentGracePeriod;

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
            Detention Settings
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
          {/* Hourly Rate */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Hourly Rate
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
              Your standard billing rate for detention time
            </Text>

            <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.currencyPrefix, { color: theme.textSecondary }]}>$</Text>
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="decimal-pad"
                placeholder="50.00"
                placeholderTextColor={theme.textDisabled}
              />
              <Text style={[styles.rateSuffix, { color: theme.textSecondary }]}>/hr</Text>
            </View>

            {errors.hourly_rate && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {errors.hourly_rate}
              </Text>
            )}

            <Text style={[styles.hint, { color: theme.textDisabled }]}>
              Industry standard: $50-100/hr. Min: ${VALIDATION_RULES.hourly_rate.min}, Max: $
              {VALIDATION_RULES.hourly_rate.max}
            </Text>
          </View>

          {/* Grace Period */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Grace Period
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
              Free time before detention charges begin
            </Text>

            <View style={styles.optionsGrid}>
              {GRACE_PERIOD_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    { backgroundColor: theme.card },
                    gracePeriod === option.value && {
                      borderColor: theme.primary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setGracePeriod(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          gracePeriod === option.value
                            ? theme.primary
                            : theme.textPrimary,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.hint, { color: theme.textDisabled }]}>
              Industry standard: 2 hours for pickup, 2 hours for delivery
            </Text>
          </View>

          {/* Preview */}
          <View style={[styles.previewCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.previewTitle, { color: theme.textSecondary }]}>
              Example Calculation
            </Text>
            <Text style={[styles.previewText, { color: theme.textPrimary }]}>
              3 hours at facility
            </Text>
            <Text style={[styles.previewText, { color: theme.textSecondary }]}>
              -{formatGracePeriod(gracePeriod)} grace period
            </Text>
            <View style={styles.previewDivider} />
            <Text style={[styles.previewResult, { color: theme.success }]}>
              {Math.max(0, 180 - gracePeriod)} min billable ={' '}
              {formatHourlyRate(
                Math.max(0, (180 - gracePeriod) / 60) * parseFloat(hourlyRate || '0')
              )}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '600',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
  },
  rateSuffix: {
    fontSize: 18,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 13,
    marginTop: 8,
  },
  hint: {
    fontSize: 12,
    marginTop: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 100,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
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
  previewText: {
    fontSize: 15,
    marginBottom: 4,
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 8,
  },
  previewResult: {
    fontSize: 18,
    fontWeight: '700',
  },
});
