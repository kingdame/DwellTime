/**
 * Notifications Feature
 * Push notifications for detention tracking alerts using expo-notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// ============================================================================
// NOTIFICATION CONFIGURATION
// ============================================================================

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notification channel for Android
const ANDROID_CHANNEL_ID = 'detention-alerts';

// Notification identifiers
export const NOTIFICATION_IDS = {
  GRACE_PERIOD_WARNING: 'grace-period-warning',
  DETENTION_STARTED: 'detention-started',
  ARRIVED_AT_FACILITY: 'arrived-at-facility',
  DAILY_SUMMARY: 'daily-summary',
};

// ============================================================================
// PERMISSION HANDLING
// ============================================================================

/**
 * Request permission to show notifications
 * Returns the push token if granted
 */
export async function requestNotificationPermissions(): Promise<string | null> {
  // Only request on physical devices
  if (!Device.isDevice) {
    console.log('[Notifications] Push notifications not available in simulator');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Notifications] Permission not granted');
    return null;
  }

  // Get the push token
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    return token.data;
  } catch (error) {
    console.error('[Notifications] Error getting push token:', error);
    return null;
  }
}

/**
 * Set up Android notification channel
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Detention Alerts',
      description: 'Notifications for detention tracking events',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
      sound: 'default',
    });
  }
}

// ============================================================================
// NOTIFICATION SCHEDULING
// ============================================================================

/**
 * Schedule a grace period warning notification
 * Fires X minutes before grace period ends
 */
export async function scheduleGracePeriodWarning(
  facilityName: string,
  gracePeriodEnd: Date,
  warningMinutes: number = 15
): Promise<string | null> {
  // Cancel any existing grace period warning
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.GRACE_PERIOD_WARNING);

  // Calculate when to show the warning
  const warningTime = new Date(gracePeriodEnd.getTime() - warningMinutes * 60 * 1000);

  // Don't schedule if the warning time is in the past
  if (warningTime <= new Date()) {
    console.log('[Notifications] Warning time already passed, skipping');
    return null;
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.GRACE_PERIOD_WARNING,
    content: {
      title: '⏰ Grace Period Ending Soon',
      body: `Only ${warningMinutes} minutes left at ${facilityName}. Detention charges will begin soon.`,
      data: { type: 'grace-warning', facilityName },
      sound: 'default',
      ...(Platform.OS === 'android' && { channelId: ANDROID_CHANNEL_ID }),
    },
    trigger: {
      date: warningTime,
    },
  });

  console.log('[Notifications] Grace period warning scheduled for:', warningTime);
  return identifier;
}

/**
 * Send detention started notification immediately
 */
export async function scheduleDetentionStartedNotification(
  facilityName: string,
  detentionStartTime: Date,
  hourlyRate: number
): Promise<string | null> {
  const identifier = await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.DETENTION_STARTED,
    content: {
      title: '💰 Detention Started',
      body: `You're now earning $${hourlyRate}/hr at ${facilityName}. Keep tracking!`,
      data: { type: 'detention-started', facilityName, hourlyRate, startTime: detentionStartTime.toISOString() },
      sound: 'default',
      ...(Platform.OS === 'android' && { channelId: ANDROID_CHANNEL_ID }),
    },
    trigger: null, // Send immediately
  });

  console.log('[Notifications] Detention started notification sent');
  return identifier;
}

/**
 * Send arrived at facility notification
 */
export async function sendArrivedAtFacilityNotification(
  facilityName: string
): Promise<string | null> {
  const identifier = await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.ARRIVED_AT_FACILITY,
    content: {
      title: '📍 Arrived at Facility',
      body: `Tracking started at ${facilityName}. Grace period active.`,
      data: { type: 'arrived', facilityName },
      sound: 'default',
      ...(Platform.OS === 'android' && { channelId: ANDROID_CHANNEL_ID }),
    },
    trigger: null, // Send immediately
  });

  console.log('[Notifications] Arrived notification sent');
  return identifier;
}

/**
 * Schedule daily summary notification
 */
export async function scheduleDailySummary(
  hour: number = 18, // 6 PM default
  minute: number = 0
): Promise<string | null> {
  // Cancel existing daily summary
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.DAILY_SUMMARY);

  const identifier = await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.DAILY_SUMMARY,
    content: {
      title: '📊 Daily Summary',
      body: 'Tap to view your detention tracking summary for today.',
      data: { type: 'daily-summary' },
      sound: 'default',
      ...(Platform.OS === 'android' && { channelId: ANDROID_CHANNEL_ID }),
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });

  console.log('[Notifications] Daily summary scheduled for:', `${hour}:${minute}`);
  return identifier;
}

// ============================================================================
// NOTIFICATION MANAGEMENT
// ============================================================================

/**
 * Cancel all detention-related notifications
 */
export async function cancelAllDetentionNotifications(): Promise<void> {
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.GRACE_PERIOD_WARNING),
    Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.DETENTION_STARTED),
    Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.ARRIVED_AT_FACILITY),
  ]);
  console.log('[Notifications] All detention notifications cancelled');
}

/**
 * Cancel a specific notification
 */
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Send a local notification immediately
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<string | null> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
      ...(Platform.OS === 'android' && { channelId: ANDROID_CHANNEL_ID }),
    },
    trigger: null, // Send immediately
  });

  return identifier;
}

// ============================================================================
// NOTIFICATION LISTENERS
// ============================================================================

/**
 * Add listener for when a notification is received while app is foregrounded
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for when user interacts with a notification
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Remove a notification listener subscription
 */
export function removeNotificationSubscription(subscription: Notifications.Subscription): void {
  Notifications.removeNotificationSubscription(subscription);
}

// ============================================================================
// BADGE MANAGEMENT
// ============================================================================

/**
 * Set the app badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear the app badge
 */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}
