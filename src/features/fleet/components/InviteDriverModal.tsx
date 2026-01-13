/**
 * InviteDriverModal Component
 * Modal for sending driver invitations to join the fleet
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { colors } from '@/constants/colors';
import { styles } from './InviteDriverModal.styles';
import type { FleetRole } from '../types';

interface InviteDriverModalProps {
  visible: boolean;
  onClose: () => void;
  onInvite: (data: { email: string; phone?: string; role: FleetRole }) => Promise<{ invitationCode?: string } | void>;
  fleetName: string;
}

const ROLE_OPTIONS: { value: FleetRole; label: string; description: string }[] = [
  { value: 'driver', label: 'Driver', description: 'Can track detention events and view their own history' },
  { value: 'admin', label: 'Admin', description: 'Full access to manage fleet, drivers, and invoices' },
];

export function InviteDriverModal({ visible, onClose, onInvite, fleetName }: InviteDriverModalProps) {
  const theme = colors.dark;

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<FleetRole>('driver');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(value.trim())) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) validateEmail(value);
  };

  const handleSendInvite = useCallback(async () => {
    if (!validateEmail(email)) return;

    setIsSubmitting(true);
    try {
      const result = await onInvite({ email: email.trim(), phone: phone.trim() || undefined, role });

      if (result?.invitationCode) {
        setInvitationCode(result.invitationCode);
      } else {
        Alert.alert('Invitation Sent', `An invitation has been sent to ${email}`, [{ text: 'OK', onPress: onClose }]);
        resetForm();
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, phone, role, onInvite, onClose]);

  const handleShareCode = useCallback(async () => {
    if (!invitationCode) return;
    try {
      await Share.share({
        message: `You've been invited to join ${fleetName} on DwellTime! Use this invitation code to join: ${invitationCode}`,
        title: `Join ${fleetName} on DwellTime`,
      });
    } catch (error) {
      console.error('Error sharing invitation:', error);
    }
  }, [invitationCode, fleetName]);

  const resetForm = () => {
    setEmail('');
    setPhone('');
    setRole('driver');
    setInvitationCode(null);
    setEmailError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Success view after invitation is created
  if (invitationCode) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.divider }]}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Invitation Sent</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: theme.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.successContent}>
            <View style={[styles.successIcon, { backgroundColor: theme.success + '20' }]}>
              <Text style={styles.successIconText}>OK</Text>
            </View>
            <Text style={[styles.successTitle, { color: theme.textPrimary }]}>Invitation Created</Text>
            <Text style={[styles.successMessage, { color: theme.textSecondary }]}>
              An invitation email has been sent to {email}. They can also use the code below to join your fleet.
            </Text>
            <View style={[styles.codeContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.codeLabel, { color: theme.textSecondary }]}>Invitation Code</Text>
              <Text style={[styles.codeValue, { color: theme.primary }]}>{invitationCode}</Text>
            </View>
            <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.primary }]} onPress={handleShareCode}>
              <Text style={styles.shareButtonText}>Share Invitation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.inviteAnotherButton, { borderColor: theme.divider }]} onPress={resetForm}>
              <Text style={[styles.inviteAnotherText, { color: theme.primary }]}>Invite Another Driver</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.divider }]}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Invite Driver</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email Address *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary, borderColor: emailError ? theme.error : theme.divider }]}
              value={email}
              onChangeText={handleEmailChange}
              placeholder="driver@example.com"
              placeholderTextColor={theme.textDisabled}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
            />
            {emailError && <Text style={[styles.errorText, { color: theme.error }]}>{emailError}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary, borderColor: theme.divider }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="(555) 123-4567"
              placeholderTextColor={theme.textDisabled}
              keyboardType="phone-pad"
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Role</Text>
            <View style={styles.roleOptions}>
              {ROLE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.roleOption,
                    { backgroundColor: theme.card, borderColor: theme.divider },
                    role === option.value && { borderColor: theme.primary, borderWidth: 2 },
                  ]}
                  onPress={() => setRole(option.value)}
                  disabled={isSubmitting}
                >
                  <View style={styles.roleHeader}>
                    <Text style={[styles.roleTitle, { color: theme.textPrimary }, role === option.value && { color: theme.primary }]}>
                      {option.label}
                    </Text>
                    {role === option.value && (
                      <View style={[styles.roleCheck, { backgroundColor: theme.primary }]}>
                        <Text style={styles.roleCheckMark}>OK</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.roleDescription, { color: theme.textSecondary }]}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.infoNote, { backgroundColor: theme.card }]}>
            <Text style={[styles.infoNoteText, { color: theme.textSecondary }]}>
              The invited driver will receive an email with instructions to join your fleet. They will need to create a DwellTime account if they don't have one.
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.divider }]}>
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.primary }, isSubmitting && styles.sendButtonDisabled]}
            onPress={handleSendInvite}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.sendButtonText}>Send Invitation</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
