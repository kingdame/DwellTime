/**
 * Timer Utilities
 * Pure functions for time calculations and formatting
 */

import { config } from '@/constants';

export interface TimerState {
  arrivalTime: Date;
  gracePeriodMinutes: number;
  hourlyRate: number;
}

export interface TimerCalculation {
  elapsedSeconds: number;
  gracePeriodSeconds: number;
  detentionSeconds: number;
  isInGracePeriod: boolean;
  isDetentionActive: boolean;
  currentEarnings: number;
}

/**
 * Calculate timer values based on arrival time
 */
export function calculateTimerState(
  arrivalTime: Date,
  now: Date = new Date(),
  gracePeriodMinutes: number = config.detention.defaultGracePeriodMinutes,
  hourlyRate: number = config.detention.defaultHourlyRate
): TimerCalculation {
  const elapsedMs = now.getTime() - arrivalTime.getTime();
  const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));

  const gracePeriodSeconds = gracePeriodMinutes * 60;
  const isInGracePeriod = elapsedSeconds < gracePeriodSeconds;

  const detentionSeconds = Math.max(0, elapsedSeconds - gracePeriodSeconds);
  const isDetentionActive = detentionSeconds > 0;

  // Calculate earnings: hourlyRate per hour of detention
  const detentionHours = detentionSeconds / 3600;
  const currentEarnings = Math.round(detentionHours * hourlyRate * 100) / 100;

  return {
    elapsedSeconds,
    gracePeriodSeconds,
    detentionSeconds,
    isInGracePeriod,
    isDetentionActive,
    currentEarnings,
  };
}

/**
 * Format seconds as HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map((v) => v.toString().padStart(2, '0'))
    .join(':');
}

/**
 * Format seconds as human-readable duration
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Calculate detention amount for completed event
 */
export function calculateDetentionAmount(
  arrivalTime: Date,
  departureTime: Date,
  gracePeriodMinutes: number,
  hourlyRate: number
): { detentionMinutes: number; totalAmount: number } {
  const totalMinutes = (departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60);
  const detentionMinutes = Math.max(0, totalMinutes - gracePeriodMinutes);
  const detentionHours = detentionMinutes / 60;
  const totalAmount = Math.round(detentionHours * hourlyRate * 100) / 100;

  return { detentionMinutes: Math.round(detentionMinutes), totalAmount };
}

/**
 * Get grace period end time
 */
export function getGracePeriodEnd(
  arrivalTime: Date,
  gracePeriodMinutes: number = config.detention.defaultGracePeriodMinutes
): Date {
  return new Date(arrivalTime.getTime() + gracePeriodMinutes * 60 * 1000);
}

/**
 * Get detention start time (same as grace period end)
 */
export function getDetentionStart(
  arrivalTime: Date,
  gracePeriodMinutes: number = config.detention.defaultGracePeriodMinutes
): Date {
  return getGracePeriodEnd(arrivalTime, gracePeriodMinutes);
}
