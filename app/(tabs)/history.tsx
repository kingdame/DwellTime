/**
 * History Tab - View detention records
 */

import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../src/constants/colors';
import {
  HistoryList,
  HistorySummaryCard,
  useMonthSummary,
  type DetentionRecord,
  formatCurrency,
  formatDuration,
  formatDate,
  formatTime,
  shareRecordAsPdf,
  shareRecordAsText,
} from '../../src/features/history';

export default function HistoryTab() {
  const theme = colors.dark;
  const { data: summary } = useMonthSummary();
  const [selectedRecord, setSelectedRecord] = useState<DetentionRecord | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleRecordPress = (record: DetentionRecord) => {
    setSelectedRecord(record);
  };

  const handleCloseDetail = () => {
    setSelectedRecord(null);
  };

  const handleSharePdf = useCallback(async () => {
    if (!selectedRecord) return;
    setIsSharing(true);
    try {
      await shareRecordAsPdf(selectedRecord);
    } catch (error) {
      Alert.alert('Share Error', error instanceof Error ? error.message : 'Failed to share record');
    } finally {
      setIsSharing(false);
    }
  }, [selectedRecord]);

  const handleShareText = useCallback(async () => {
    if (!selectedRecord) return;
    setIsSharing(true);
    try {
      await shareRecordAsText(selectedRecord);
    } catch (error) {
      Alert.alert('Share Error', error instanceof Error ? error.message : 'Failed to share record');
    } finally {
      setIsSharing(false);
    }
  }, [selectedRecord]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>History</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Your detention records
        </Text>
      </View>

      {/* Summary Card */}
      <HistorySummaryCard
        totalEarnings={summary?.totalEarnings || 0}
        totalSessions={summary?.totalSessions || 0}
        label="This Month"
      />

      {/* History List */}
      <HistoryList onRecordPress={handleRecordPress} />

      {/* Detail Modal */}
      <Modal
        visible={selectedRecord !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseDetail}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          {selectedRecord && (
            <>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCloseDetail}>
                  <Text style={[styles.closeButton, { color: theme.primary }]}>Close</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Detention Details
                </Text>
                <View style={{ width: 50 }} />
              </View>

              <ScrollView style={styles.modalContent}>
                {/* Facility Info */}
                <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                  <Text style={[styles.detailFacilityName, { color: theme.textPrimary }]}>
                    {selectedRecord.facilityName}
                  </Text>
                  {selectedRecord.facilityAddress && (
                    <Text style={[styles.detailAddress, { color: theme.textSecondary }]}>
                      {selectedRecord.facilityAddress}
                    </Text>
                  )}
                  <View style={styles.detailMeta}>
                    <Text style={styles.detailMetaEmoji}>
                      {selectedRecord.eventType === 'pickup' ? '📦' : '🚚'}
                    </Text>
                    <Text style={[styles.detailMetaText, { color: theme.textSecondary }]}>
                      {selectedRecord.eventType === 'pickup' ? 'Pickup' : 'Delivery'}
                    </Text>
                    {selectedRecord.loadReference && (
                      <Text style={[styles.detailMetaText, { color: theme.textDisabled }]}>
                        {' '}• Load: {selectedRecord.loadReference}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Earnings Card */}
                <View style={[styles.earningsCard, { backgroundColor: theme.card }]}>
                  <Text style={[styles.earningsLabel, { color: theme.textSecondary }]}>
                    Detention Earnings
                  </Text>
                  <Text style={[styles.earningsValue, { color: theme.success }]}>
                    {formatCurrency(selectedRecord.detentionAmount)}
                  </Text>
                  <Text style={[styles.earningsSubtext, { color: theme.textSecondary }]}>
                    {formatDuration(selectedRecord.detentionMinutes)} detention @ ${selectedRecord.hourlyRate}/hr
                  </Text>
                </View>

                {/* Time Details */}
                <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                  <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                    Time Details
                  </Text>
                  <View style={styles.timeGrid}>
                    <View style={styles.timeItem}>
                      <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>
                        Arrival
                      </Text>
                      <Text style={[styles.timeValue, { color: theme.textPrimary }]}>
                        {formatDate(selectedRecord.arrivalTime)}
                      </Text>
                      <Text style={[styles.timeValueSub, { color: theme.textSecondary }]}>
                        {formatTime(selectedRecord.arrivalTime)}
                      </Text>
                    </View>
                    {selectedRecord.departureTime && (
                      <View style={styles.timeItem}>
                        <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>
                          Departure
                        </Text>
                        <Text style={[styles.timeValue, { color: theme.textPrimary }]}>
                          {formatDate(selectedRecord.departureTime)}
                        </Text>
                        <Text style={[styles.timeValueSub, { color: theme.textSecondary }]}>
                          {formatTime(selectedRecord.departureTime)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                  <View style={styles.durationRow}>
                    <View style={styles.durationItem}>
                      <Text style={[styles.durationLabel, { color: theme.textSecondary }]}>
                        Total Time
                      </Text>
                      <Text style={[styles.durationValue, { color: theme.textPrimary }]}>
                        {formatDuration(selectedRecord.totalElapsedMinutes)}
                      </Text>
                    </View>
                    <View style={styles.durationItem}>
                      <Text style={[styles.durationLabel, { color: theme.textSecondary }]}>
                        Grace Period
                      </Text>
                      <Text style={[styles.durationValue, { color: theme.textPrimary }]}>
                        {formatDuration(selectedRecord.gracePeriodMinutes)}
                      </Text>
                    </View>
                    <View style={styles.durationItem}>
                      <Text style={[styles.durationLabel, { color: theme.textSecondary }]}>
                        Detention
                      </Text>
                      <Text style={[styles.durationValue, { color: theme.warning }]}>
                        {formatDuration(selectedRecord.detentionMinutes)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Notes */}
                {selectedRecord.notes && (
                  <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                      Notes
                    </Text>
                    <Text style={[styles.notesText, { color: theme.textSecondary }]}>
                      {selectedRecord.notes}
                    </Text>
                  </View>
                )}

                {/* Verification Code */}
                <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                  <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                    Verification
                  </Text>
                  <Text style={[styles.verificationCode, { color: theme.primary }]}>
                    {selectedRecord.verificationCode}
                  </Text>
                  <Text style={[styles.verificationHint, { color: theme.textDisabled }]}>
                    Use this code to verify your detention claim
                  </Text>
                </View>

                {/* Photos indicator */}
                {selectedRecord.photoCount > 0 && (
                  <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                      Evidence
                    </Text>
                    <Text style={[styles.photosText, { color: theme.textSecondary }]}>
                      📷 {selectedRecord.photoCount} photo{selectedRecord.photoCount !== 1 ? 's' : ''} attached
                    </Text>
                  </View>
                )}

                {/* Share Buttons */}
                <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                  <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                    Share Record
                  </Text>
                  <View style={styles.shareButtonsRow}>
                    <TouchableOpacity
                      style={[styles.shareButton, { backgroundColor: theme.primary }]}
                      onPress={handleSharePdf}
                      disabled={isSharing}
                    >
                      {isSharing ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.shareButtonText}>📄 PDF</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.shareButton, { backgroundColor: theme.backgroundSecondary }]}
                      onPress={handleShareText}
                      disabled={isSharing}
                    >
                      {isSharing ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.shareButtonText}>📝 Text</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </>
          )}
        </SafeAreaView>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
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
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  detailFacilityName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailAddress: {
    fontSize: 14,
    marginBottom: 12,
  },
  detailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailMetaEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  detailMetaText: {
    fontSize: 14,
  },
  earningsCard: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 12,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  earningsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  earningsSubtext: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  timeValueSub: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  durationItem: {
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  durationValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
  },
  verificationCode: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 8,
  },
  verificationHint: {
    fontSize: 13,
  },
  photosText: {
    fontSize: 15,
  },
  shareButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
