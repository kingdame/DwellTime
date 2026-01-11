/**
 * DwellTime App Configuration
 * Default values and constants
 */

export const config = {
  // App Info
  app: {
    name: 'DwellTime',
    version: '1.0.0',
    bundleId: 'com.dwelltime.app',
  },

  // Detention Defaults (from Appendix F)
  detention: {
    defaultGracePeriodMinutes: 120, // 2 hours
    defaultHourlyRate: 75.0, // $75/hr
    gpsLogIntervalMinutes: 5,
    geofenceRadiusMeters: 200,
    geofenceRadiusMin: 100,
    geofenceRadiusMax: 500,
  },

  // Photo Limits
  photos: {
    maxPerEventFree: 5,
    maxPerEventPro: 10,
  },

  // Subscription Limits
  subscription: {
    freeEventsPerMonth: 3,
  },

  // API Timeouts
  api: {
    timeoutMs: 30000,
    retryAttempts: 3,
  },

  // Offline Sync
  sync: {
    maxOfflineHours: 24,
    syncIntervalMs: 60000, // 1 minute
    stillAtFacilityPromptMs: 1800000, // 30 minutes
  },

  // Notifications
  notifications: {
    gracePeriodWarningMinutes: 15,
  },

  // UI
  ui: {
    minTouchTarget: 48, // Exceeds 44px minimum for accessibility
    cardBorderRadius: 12,
    buttonBorderRadius: 12,
    inputBorderRadius: 10,
  },
} as const;

export type Config = typeof config;
