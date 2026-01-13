/**
 * Fleet Settings Screen
 * Full screen version of fleet settings (not a modal)
 */

import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { colors } from '../../src/constants/colors';
import {
  useCurrentFleet,
  useFleetStore,
  useUpdateFleet,
} from '../../src/features/fleet';

export default function FleetSettingsScreen() {
  const theme = colors.dark;
  const router = useRouter();

  const currentFleet = useCurrentFleet();
  const { fleetSettings } = useFleetStore();
  const updateFleet = useUpdateFleet();

  // Form state
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

  // Initialize form with existing values
  useEffect(() => {
    if (currentFleet) {
      setName(currentFleet.name || '');
      setCompanyName(currentFleet.company_name || '');
      setCompanyAddress(currentFleet.company_address || '');
      setCompanyPhone(currentFleet.company_phone || '');
      setCompanyEmail(currentFleet.company_email || '');
      setDotNumber(currentFleet.dot_number || '');
      setMcNumber(currentFleet.mc_number || '');
    }
    if (fleetSettings) {
      setHourlyRate(String(fleetSettings.default_hourly_rate || 75));
      setGracePeriod(String(fleetSettings.default_grace_period_minutes || 120));
    }
  }, [currentFleet, fleetSettings]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Fleet name is required';
    }
    if (!companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (companyEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail.trim())) {
      newErrors.companyEmail = 'Invalid email address';
    }

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate < 0) {
      newErrors.hourlyRate = 'Invalid hourly rate';
    }

    const grace = parseInt(gracePeriod, 10);
    if (isNaN(grace) || grace < 0) {
      newErrors.gracePeriod = 'Invalid grace period';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = useCallback(async () => {
    if (!validate() || !currentFleet) return;

    setIsSubmitting(true);
    try {
      await updateFleet.mutateAsync({
        fleetId: currentFleet.id,
        updates: {
          name: name.trim(),
          company_name: companyName.trim(),
          billing_email: companyEmail.trim() || undefined,
          default_hourly_rate: parseFloat(hourlyRate) || undefined,
          default_grace_period_minutes: parseInt(gracePeriod, 10) || undefined,
        },
      });

      Alert.alert('Success', 'Fleet settings saved successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    currentFleet,
    name,
    companyName,
    companyAddress,
    companyPhone,
    companyEmail,
    dotNumber,
    mcNumber,
    updateFleet,
    router,
  ]);

  if (!currentFleet) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>No Fleet Selected</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Text style={[styles.saveButton, { color: theme.primary }]}>Save</Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Fleet Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Fleet Information
            </Text>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Fleet Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    color: theme.textPrimary,
                    borderColor: errors.name ? theme.error : theme.divider,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="My Fleet"
                placeholderTextColor={theme.textDisabled}
                editable={!isSubmitting}
              />
              {errors.name && <Text style={[styles.errorText, { color: theme.error }]}>{errors.name}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Company Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    color: theme.textPrimary,
                    borderColor: errors.companyName ? theme.error : theme.divider,
                  },
                ]}
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="ABC Trucking LLC"
                placeholderTextColor={theme.textDisabled}
                editable={!isSubmitting}
              />
              {errors.companyName && (
                <Text style={[styles.errorText, { color: theme.error }]}>{errors.companyName}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Address</Text>
              <TextInput
                style={[styles.input, styles.multiline, { backgroundColor: theme.card, color: theme.textPrimary }]}
                value={companyAddress}
                onChangeText={setCompanyAddress}
                placeholder="123 Main St, City, State 12345"
                placeholderTextColor={theme.textDisabled}
                multiline
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.halfField]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Phone</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary }]}
                  value={companyPhone}
                  onChangeText={setCompanyPhone}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={theme.textDisabled}
                  keyboardType="phone-pad"
                  editable={!isSubmitting}
                />
              </View>
              <View style={[styles.field, styles.halfField]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      color: theme.textPrimary,
                      borderColor: errors.companyEmail ? theme.error : theme.divider,
                    },
                  ]}
                  value={companyEmail}
                  onChangeText={setCompanyEmail}
                  placeholder="billing@example.com"
                  placeholderTextColor={theme.textDisabled}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSubmitting}
                />
              </View>
            </View>
          </View>

          {/* Regulatory Numbers */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Regulatory Numbers</Text>
            <View style={styles.row}>
              <View style={[styles.field, styles.halfField]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>DOT Number</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary }]}
                  value={dotNumber}
                  onChangeText={setDotNumber}
                  placeholder="1234567"
                  placeholderTextColor={theme.textDisabled}
                  keyboardType="number-pad"
                  editable={!isSubmitting}
                />
              </View>
              <View style={[styles.field, styles.halfField]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>MC Number</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary }]}
                  value={mcNumber}
                  onChangeText={setMcNumber}
                  placeholder="MC-123456"
                  placeholderTextColor={theme.textDisabled}
                  editable={!isSubmitting}
                />
              </View>
            </View>
          </View>

          {/* Default Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Default Settings</Text>
            <View style={styles.row}>
              <View style={[styles.field, styles.halfField]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Hourly Rate ($)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      color: theme.textPrimary,
                      borderColor: errors.hourlyRate ? theme.error : theme.divider,
                    },
                  ]}
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  placeholder="75"
                  placeholderTextColor={theme.textDisabled}
                  keyboardType="decimal-pad"
                  editable={!isSubmitting}
                />
              </View>
              <View style={[styles.field, styles.halfField]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Grace Period (min)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      color: theme.textPrimary,
                      borderColor: errors.gracePeriod ? theme.error : theme.divider,
                    },
                  ]}
                  value={gracePeriod}
                  onChangeText={setGracePeriod}
                  placeholder="120"
                  placeholderTextColor={theme.textDisabled}
                  keyboardType="number-pad"
                  editable={!isSubmitting}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  multiline: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});
