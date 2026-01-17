/**
 * TruckEntranceCard Component
 * Displays truck entrance information and allows contributions
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { colors } from '@/constants/colors';
import {
  hasTruckEntranceInfo,
  extractTruckEntranceInfo,
  getVerificationStatus,
} from '@/shared/types/truck-entrance';
import { useUpdateTruckEntrance } from '../hooks/useFacilitiesConvex';
import { useAuthStore } from '@/features/auth';
import type { Id } from '@/convex/_generated/dataModel';

interface TruckEntranceCardProps {
  facility: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    truck_entrance_different?: boolean | null;
    truck_entrance_address?: string | null;
    truck_entrance_lat?: number | null;
    truck_entrance_lng?: number | null;
    truck_entrance_notes?: string | null;
    truck_entrance_verified_count?: number | null;
    truck_entrance_last_updated_at?: string | null;
  };
  userId: string | null;
  compact?: boolean;
}

function AddEntranceForm({
  facilityId,
  onClose,
}: {
  facilityId: Id<"facilities">;
  onClose: () => void;
}) {
  const theme = colors.dark;
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateTruckEntrance = useUpdateTruckEntrance();

  const handleSubmit = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter the truck entrance location');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTruckEntrance({
        facilityId,
        truckEntranceDifferent: true,
        truckEntranceAddress: address.trim(),
        truckEntranceNotes: notes.trim() || undefined,
      });
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to submit truck entrance info');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.formContainer, { backgroundColor: theme.card }]}>
      <Text style={[styles.formTitle, { color: theme.textPrimary }]}>
        Add Truck Entrance Info
      </Text>

      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
        Where is the truck entrance?
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary }]}
        value={address}
        onChangeText={setAddress}
        placeholder="e.g., Back of building, Gate 3 on Oak St..."
        placeholderTextColor={theme.textDisabled}
        multiline
      />

      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
        Additional notes (optional)
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary }]}
        value={notes}
        onChangeText={setNotes}
        placeholder="e.g., Call ahead for gate code..."
        placeholderTextColor={theme.textDisabled}
        multiline
      />

      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function TruckEntranceCard({ facility, userId, compact = false }: TruckEntranceCardProps) {
  const theme = colors.dark;
  const [showAddForm, setShowAddForm] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const hasEntrance = hasTruckEntranceInfo(facility);
  const entranceInfo = extractTruckEntranceInfo(facility);
  const verificationStatus = getVerificationStatus(entranceInfo.verifiedCount);

  // Simplified - no hasReported tracking for now
  const hasReported = false;
  const updateTruckEntrance = useUpdateTruckEntrance();

  const handleGetDirections = () => {
    const lat = entranceInfo.lat || facility.lat;
    const lng = entranceInfo.lng || facility.lng;
    const destination = encodeURIComponent(entranceInfo.address || facility.name);

    const urls = Platform.select({
      ios: [
        `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`,
        `maps://?daddr=${lat},${lng}`,
      ],
      android: [
        `google.navigation:q=${lat},${lng}`,
        `geo:${lat},${lng}?q=${destination}`,
      ],
      default: [`https://www.google.com/maps/dir/?api=1&destination=${destination}`],
    });

    if (urls && urls.length > 0) {
      Linking.canOpenURL(urls[0]).then((supported) => {
        if (supported) {
          Linking.openURL(urls[0]);
        } else if (urls.length > 1) {
          Linking.openURL(urls[1]);
        }
      });
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      // Increment verified count
      const newCount = (entranceInfo.verifiedCount || 0) + 1;
      await updateTruckEntrance({
        facilityId: facility.id as Id<"facilities">,
        truckEntranceVerifiedCount: newCount,
      });
      Alert.alert('Thanks!', 'Your confirmation helps other drivers.');
    } catch {
      Alert.alert('Error', 'Failed to confirm truck entrance');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReportIncorrect = () => {
    Alert.alert(
      'Report Incorrect?',
      'Is the truck entrance info wrong or outdated?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Report',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear the entrance info if reported incorrect
              await updateTruckEntrance({
                facilityId: facility.id as Id<"facilities">,
                truckEntranceDifferent: false,
                truckEntranceAddress: undefined,
                truckEntranceVerifiedCount: 0,
              });
              Alert.alert('Thanks!', 'We\'ll review the truck entrance info.');
            } catch {
              Alert.alert('Error', 'Failed to submit report');
            }
          },
        },
      ]
    );
  };

  // Show add form
  if (showAddForm) {
    return (
      <AddEntranceForm
        facilityId={facility.id as Id<"facilities">}
        onClose={() => setShowAddForm(false)}
      />
    );
  }

  // Compact mode - just show badge
  if (compact) {
    return hasEntrance ? (
      <TouchableOpacity
        style={[styles.compactBadge, { backgroundColor: theme.success + '20' }]}
        onPress={handleGetDirections}
      >
        <Text style={styles.compactIcon}>🚛</Text>
        <Text style={[styles.compactText, { color: theme.success }]}>
          Truck Entrance
        </Text>
      </TouchableOpacity>
    ) : null;
  }

  // Full card
  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🚛</Text>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Truck Entrance</Text>
      </View>

      {hasEntrance ? (
        <>
          {/* Entrance info */}
          <View style={styles.entranceInfo}>
            {entranceInfo.address && (
              <Text style={[styles.entranceAddress, { color: theme.textPrimary }]}>
                {entranceInfo.address}
              </Text>
            )}
            {entranceInfo.notes && (
              <Text style={[styles.entranceNotes, { color: theme.textSecondary }]}>
                📝 {entranceInfo.notes}
              </Text>
            )}
          </View>

          {/* Verification badge */}
          <View style={styles.verificationRow}>
            <View
              style={[
                styles.verificationBadge,
                { backgroundColor: verificationStatus.color + '20' },
              ]}
            >
              <Text style={{ color: verificationStatus.color, fontSize: 12, fontWeight: '600' }}>
                ✓ {verificationStatus.label}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.directionsButton, { backgroundColor: theme.primary }]}
              onPress={handleGetDirections}
            >
              <Text style={styles.directionsButtonText}>🧭 Get Directions</Text>
            </TouchableOpacity>

            {userId && !hasReported && (
              <View style={styles.feedbackButtons}>
                <TouchableOpacity
                  style={[styles.feedbackButton, { borderColor: theme.success }]}
                  onPress={handleConfirm}
                  disabled={isConfirming}
                >
                  <Text style={[styles.feedbackButtonText, { color: theme.success }]}>
                    ✓ Confirm
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.feedbackButton, { borderColor: theme.danger }]}
                  onPress={handleReportIncorrect}
                >
                  <Text style={[styles.feedbackButtonText, { color: theme.danger }]}>
                    ✗ Wrong
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </>
      ) : (
        <>
          {/* No entrance info */}
          <Text style={[styles.noInfoText, { color: theme.textSecondary }]}>
            No truck entrance info yet.
          </Text>

          {userId && (
            <TouchableOpacity
              style={[styles.addButton, { borderColor: theme.primary }]}
              onPress={() => setShowAddForm(true)}
            >
              <Text style={[styles.addButtonText, { color: theme.primary }]}>
                + Add Truck Entrance Info
              </Text>
            </TouchableOpacity>
          )}

          {!userId && (
            <Text style={[styles.signInPrompt, { color: theme.textDisabled }]}>
              Sign in to add truck entrance info
            </Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  entranceInfo: {
    gap: 8,
  },
  entranceAddress: {
    fontSize: 15,
    lineHeight: 22,
  },
  entranceNotes: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  verificationRow: {
    flexDirection: 'row',
  },
  verificationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actions: {
    gap: 10,
  },
  directionsButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  directionsButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  feedbackButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noInfoText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
  },
  addButton: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  signInPrompt: {
    fontSize: 13,
    textAlign: 'center',
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  compactIcon: {
    fontSize: 14,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600',
  },
  formContainer: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
