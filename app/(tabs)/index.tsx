/**
 * Home Tab - Main detention tracking screen
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors } from '../../src/constants/colors';
import { StatusCard, DetentionTimerState, NotesInput } from '../../src/features/detention/components';
import { useDetentionStore } from '../../src/features/detention/store';
import {
  FloatingCaptureButton,
  PhotoGallerySummary,
  type PhotoMetadata,
} from '../../src/features/evidence';
import { useCurrentUserId } from '../../src/features/auth';
import { 
  useStartDetention, 
  useEndDetention,
  useActiveDetentionEvent,
  useHistorySummary,
} from '../../src/shared/hooks/convex';
import type { Id } from '../../convex/_generated/dataModel';

// Format milliseconds to HH:MM:SS
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Format currency
function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Format total time in hours and minutes
function formatTotalTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export default function HomeTab() {
  const theme = colors.dark;
  const store = useDetentionStore();
  const { activeDetention, updateNotes, setConvexEventId } = store;
  const isTracking = activeDetention.isTracking;
  const facilityName = activeDetention.facilityName;

  // Get real user ID from auth
  const userId = useCurrentUserId() as Id<"users"> | undefined;

  // Convex mutations for detention
  const startDetention = useStartDetention();
  const endDetention = useEndDetention();

  // Get active event from Convex (real-time sync)
  const activeEvent = useActiveDetentionEvent(userId);

  // Get today's summary from Convex
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const summary = useHistorySummary(userId, {
    startDate: todayStart.getTime(),
    endDate: Date.now(),
  });

  // Local state for photos (pending upload)
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [notes, setNotes] = useState(activeDetention.notes || '');

  const [timerState, setTimerState] = useState<DetentionTimerState>({
    isActive: false,
    startTime: null,
    elapsedMs: 0,
    elapsedFormatted: '00:00:00',
    detentionMs: 0,
    detentionFormatted: '00:00:00',
    earningsFormatted: '$0.00',
    isInGracePeriod: true,
  });

  // Update timer every second when tracking
  useEffect(() => {
    const arrivalTime = activeDetention.arrivalTime;
    if (!isTracking || !arrivalTime) {
      setTimerState({
        isActive: false,
        startTime: null,
        elapsedMs: 0,
        elapsedFormatted: '00:00:00',
        detentionMs: 0,
        detentionFormatted: '00:00:00',
        earningsFormatted: '$0.00',
        isInGracePeriod: true,
      });
      return;
    }

    const startTime = new Date(arrivalTime).getTime();
    const gracePeriodMs = activeDetention.gracePeriodMinutes * 60 * 1000;
    const hourlyRate = activeDetention.hourlyRate;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - startTime;
      const isInGracePeriod = elapsedMs < gracePeriodMs;
      const detentionMs = isInGracePeriod ? 0 : elapsedMs - gracePeriodMs;
      const earningsHours = detentionMs / (1000 * 60 * 60);
      const earnings = earningsHours * hourlyRate;

      setTimerState({
        isActive: true,
        startTime: new Date(startTime),
        elapsedMs,
        elapsedFormatted: formatTime(elapsedMs),
        detentionMs,
        detentionFormatted: formatTime(detentionMs),
        earningsFormatted: formatCurrency(earnings),
        isInGracePeriod,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking, activeDetention.arrivalTime, activeDetention.gracePeriodMinutes, activeDetention.hourlyRate]);

  // Photo capture handler
  const handlePhotoCapture = useCallback((photo: PhotoMetadata) => {
    setPhotos((prev) => [...prev, photo]);
  }, []);

  // Photo capture error handler
  const handlePhotoError = useCallback((error: string) => {
    Alert.alert('Photo Error', error);
  }, []);

  // Notes change handler
  const handleNotesChange = useCallback((text: string) => {
    setNotes(text);
  }, []);

  // Notes blur handler - save to store
  const handleNotesBlur = useCallback(() => {
    updateNotes(notes);
  }, [notes, updateNotes]);

  // Reset photos when tracking stops
  useEffect(() => {
    if (!isTracking) {
      setPhotos([]);
      setNotes('');
    }
  }, [isTracking]);

  const handleStartTracking = async () => {
    if (!userId) {
      Alert.alert('Sign In Required', 'Please sign in to track detention time.');
      return;
    }

    // For demo, use a placeholder facility
    // In production, this would come from facility detection or selection
    const demoFacility = {
      id: 'demo-facility',
      name: 'Demo Facility',
      address: '123 Demo St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      lat: 37.7749,
      lng: -122.4194,
      facility_type: 'receiver' as const,
      avg_wait_minutes: null,
      avg_rating: null,
      total_reviews: 0,
      overnight_parking: null,
      parking_spaces: null,
      restrooms: null,
      driver_lounge: null,
      water_available: null,
      vending_machines: null,
      wifi_available: null,
      showers_available: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // Start local tracking first (for offline support)
      const verificationCode = await store.startTracking(demoFacility, 'delivery', 120, 75);

      // Create event in Convex
      const eventId = await startDetention({
        userId,
        facilityName: demoFacility.name,
        facilityAddress: demoFacility.address,
        eventType: 'delivery',
        gracePeriodMinutes: 120,
        hourlyRate: 75,
        verificationCode: verificationCode || undefined,
      });

      // Store the Convex event ID locally
      if (eventId) {
        setConvexEventId(eventId);
      }
    } catch (error) {
      console.error('Failed to start detention:', error);
      Alert.alert('Error', 'Failed to start detention tracking. Please try again.');
    }
  };

  const handleStopTracking = async () => {
    try {
      // Get final values from store
      const result = await store.endTracking();

      // End event in Convex
      if (activeDetention.id) {
        await endDetention({
          id: activeDetention.id as Id<"detentionEvents">,
          totalElapsedMinutes: result?.totalElapsedMinutes || 0,
          detentionMinutes: result?.detentionMinutes || 0,
          totalAmount: result?.totalAmount || 0,
          notes: notes || undefined,
        });
      }
    } catch (error) {
      console.error('Failed to end detention:', error);
      Alert.alert('Error', 'Failed to end detention tracking. Please try again.');
    }
  };

  return (
  <>
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>DwellTime</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {isTracking ? `At: ${facilityName}` : 'Track your detention time'}
        </Text>
      </View>

      <StatusCard
        timerState={timerState}
        onStartTracking={handleStartTracking}
        onStopTracking={handleStopTracking}
      />

      {/* Evidence Section - Only shown when tracking */}
      {isTracking && (
        <View style={styles.evidenceSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Evidence
          </Text>

          {/* Photo Gallery Summary */}
          <PhotoGallerySummary photos={photos} />

          {/* Notes Input */}
          <View style={styles.notesContainer}>
            <NotesInput
              value={notes}
              onChange={handleNotesChange}
              onBlur={handleNotesBlur}
              placeholder="Add notes about delays, issues, etc..."
            />
          </View>
        </View>
      )}

      <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.statsTitle, { color: theme.textPrimary }]}>
          Today's Summary
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.success }]}>
              {formatCurrency(summary?.totalEarnings || 0)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {summary?.totalEvents || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Visits</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {formatTotalTime(summary?.totalMinutes || 0)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Time</Text>
          </View>
        </View>
      </View>
    </ScrollView>

    {/* Floating Camera Button - Only shown when tracking */}
    {isTracking && (
      <FloatingCaptureButton
        onPhotoCapture={handlePhotoCapture}
        onError={handlePhotoError}
        defaultCategory="dock"
      />
    )}
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  evidenceSection: {
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesContainer: {
    marginTop: 8,
  },
});
