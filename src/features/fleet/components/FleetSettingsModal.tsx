/**
 * FleetSettingsModal Component
 * Modal for configuring fleet settings
 */

import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '@/constants/colors';
import { styles } from './FleetSettingsModal.styles';
import type { Fleet, FleetSettings } from '../types';

interface FleetSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: FleetSettingsInput) => Promise<void>;
  fleet: Fleet | null;
  settings: FleetSettings | null;
}

interface FleetSettingsInput {
  name: string;
  company_name: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  dot_number?: string;
  mc_number?: string;
  default_hourly_rate: number;
  default_grace_period_minutes: number;
}

export function FleetSettingsModal({
  visible,
  onClose,
  onSave,
  fleet,
  settings,
}: FleetSettingsModalProps) {
  const theme = colors.dark;

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [dotNumber, setDotNumber] = useState('');
  const [mcNumber, setMcNumber] = useState('');
  const [hourlyRate, setHourlyRate] = useState('75');
  const [gracePeriod, setGracePeriod] = useState('120');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (fleet) {
      setName(fleet.name || '');
      setCompanyName(fleet.company_name || '');
      setCompanyAddress(fleet.company_address || '');
      setCompanyPhone(fleet.company_phone || '');
      setCompanyEmail(fleet.company_email || '');
      setDotNumber(fleet.dot_number || '');
      setMcNumber(fleet.mc_number || '');
    }
    if (settings) {
      setHourlyRate(String(settings.default_hourly_rate || 75));
      setGracePeriod(String(settings.default_grace_period_minutes || 120));
    }
  }, [fleet, settings]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Fleet name is required';
    if (!companyName.trim()) newErrors.companyName = 'Company name is required';
    if (companyEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail.trim())) {
      newErrors.companyEmail = 'Invalid email address';
    }

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate < 0) newErrors.hourlyRate = 'Invalid hourly rate';

    const grace = parseInt(gracePeriod, 10);
    if (isNaN(grace) || grace < 0) newErrors.gracePeriod = 'Invalid grace period';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        company_name: companyName.trim(),
        company_address: companyAddress.trim() || undefined,
        company_phone: companyPhone.trim() || undefined,
        company_email: companyEmail.trim() || undefined,
        dot_number: dotNumber.trim() || undefined,
        mc_number: mcNumber.trim() || undefined,
        default_hourly_rate: parseFloat(hourlyRate),
        default_grace_period_minutes: parseInt(gracePeriod, 10),
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  }, [name, companyName, companyAddress, companyPhone, companyEmail, dotNumber, mcNumber, hourlyRate, gracePeriod, onSave, onClose]);

  const renderInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options?: {
      placeholder?: string;
      keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad' | 'decimal-pad';
      autoCapitalize?: 'none' | 'sentences';
      multiline?: boolean;
      error?: string;
    }
  ) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          options?.multiline && styles.multilineInput,
          {
            backgroundColor: theme.card,
            color: theme.textPrimary,
            borderColor: options?.error ? theme.error : theme.divider,
          },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={options?.placeholder}
        placeholderTextColor={theme.textDisabled}
        keyboardType={options?.keyboardType}
        autoCapitalize={options?.autoCapitalize}
        editable={!isSubmitting}
        multiline={options?.multiline}
        numberOfLines={options?.multiline ? 2 : 1}
      />
      {options?.error && (
        <Text style={[styles.errorText, { color: theme.error }]}>{options.error}</Text>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.divider }]}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Fleet Settings</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Text style={[styles.saveButtonText, { color: theme.primary }]}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
            {/* Fleet Information */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Fleet Information</Text>
              {renderInput('Fleet Name *', name, setName, { placeholder: 'My Fleet', error: errors.name })}
              {renderInput('Company Name *', companyName, setCompanyName, { placeholder: 'ABC Trucking LLC', error: errors.companyName })}
              {renderInput('Company Address', companyAddress, setCompanyAddress, { placeholder: '123 Main St, City, State 12345', multiline: true })}
              <View style={styles.row}>
                <View style={styles.halfField}>
                  {renderInput('Phone', companyPhone, setCompanyPhone, { placeholder: '(555) 123-4567', keyboardType: 'phone-pad' })}
                </View>
                <View style={styles.halfField}>
                  {renderInput('Email', companyEmail, setCompanyEmail, { placeholder: 'billing@example.com', keyboardType: 'email-address', autoCapitalize: 'none', error: errors.companyEmail })}
                </View>
              </View>
            </View>

            {/* Regulatory Numbers */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Regulatory Numbers</Text>
              <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>These will appear on your fleet invoices</Text>
              <View style={styles.row}>
                <View style={styles.halfField}>
                  {renderInput('DOT Number', dotNumber, setDotNumber, { placeholder: '1234567', keyboardType: 'number-pad' })}
                </View>
                <View style={styles.halfField}>
                  {renderInput('MC Number', mcNumber, setMcNumber, { placeholder: 'MC-123456' })}
                </View>
              </View>
            </View>

            {/* Default Settings */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Default Settings</Text>
              <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>These defaults apply to new drivers. Individual drivers can have overrides.</Text>
              <View style={styles.row}>
                <View style={styles.halfField}>
                  {renderInput('Hourly Rate ($)', hourlyRate, setHourlyRate, { placeholder: '75', keyboardType: 'decimal-pad', error: errors.hourlyRate })}
                </View>
                <View style={styles.halfField}>
                  {renderInput('Grace Period (min)', gracePeriod, setGracePeriod, { placeholder: '120', keyboardType: 'number-pad', error: errors.gracePeriod })}
                </View>
              </View>

              <View style={[styles.infoBox, { backgroundColor: theme.card }]}>
                <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>About These Settings</Text>
                <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                  <Text style={{ fontWeight: '600' }}>Hourly Rate:</Text> The default amount charged per hour of detention time.{'\n\n'}
                  <Text style={{ fontWeight: '600' }}>Grace Period:</Text> Free time before detention charges begin. Industry standard is typically 2 hours (120 minutes).
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
