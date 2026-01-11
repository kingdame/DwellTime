/**
 * Notifications Feature (Stub)
 * Push notifications for detention tracking alerts
 * TODO: Implement full notification service
 */

export const NOTIFICATION_IDS = {
  GRACE_PERIOD_WARNING: 'grace-period-warning',
  DETENTION_STARTED: 'detention-started',
  ARRIVED_AT_FACILITY: 'arrived-at-facility',
};

// Stub functions - will be implemented with expo-notifications
export async function scheduleGracePeriodWarning(
  _facilityName: string,
  _gracePeriodEnd: Date,
  _warningMinutes: number
): Promise<void> {
  // TODO: Implement with expo-notifications
  console.log('[Notifications] Grace period warning scheduled');
}

export async function scheduleDetentionStartedNotification(
  _facilityName: string,
  _detentionStartTime: Date,
  _hourlyRate: number
): Promise<void> {
  // TODO: Implement with expo-notifications
  console.log('[Notifications] Detention started notification scheduled');
}

export async function sendArrivedAtFacilityNotification(
  _facilityName: string
): Promise<void> {
  // TODO: Implement with expo-notifications
  console.log('[Notifications] Arrived at facility notification sent');
}

export async function cancelAllDetentionNotifications(): Promise<void> {
  // TODO: Implement with expo-notifications
  console.log('[Notifications] All detention notifications cancelled');
}

export async function sendLocalNotification(
  _title: string,
  _body: string
): Promise<void> {
  // TODO: Implement with expo-notifications
  console.log('[Notifications] Local notification sent');
}
