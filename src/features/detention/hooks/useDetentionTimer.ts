/**
 * useDetentionTimer Hook
 * Manages the detention timer state and updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import {
  calculateTimerState,
  formatTime,
  formatCurrency,
  calculateDetentionAmount,
  getGracePeriodEnd,
} from '../utils/timerUtils';
import { config } from '@/constants';

export interface DetentionTimerState {
  isActive: boolean;
  arrivalTime: Date | null;
  gracePeriodMinutes: number;
  hourlyRate: number;

  // Calculated values (update every second)
  elapsedSeconds: number;
  detentionSeconds: number;
  isInGracePeriod: boolean;
  currentEarnings: number;

  // Formatted values
  elapsedFormatted: string;
  detentionFormatted: string;
  earningsFormatted: string;
  gracePeriodEnd: Date | null;
}

export interface DetentionTimerActions {
  startTimer: (
    arrivalTime?: Date,
    gracePeriodMinutes?: number,
    hourlyRate?: number
  ) => void;
  stopTimer: () => {
    detentionMinutes: number;
    totalAmount: number;
    arrivalTime: Date;
    departureTime: Date;
  } | null;
  resetTimer: () => void;
}

const INITIAL_STATE: DetentionTimerState = {
  isActive: false,
  arrivalTime: null,
  gracePeriodMinutes: config.detention.defaultGracePeriodMinutes,
  hourlyRate: config.detention.defaultHourlyRate,
  elapsedSeconds: 0,
  detentionSeconds: 0,
  isInGracePeriod: false,
  currentEarnings: 0,
  elapsedFormatted: '00:00:00',
  detentionFormatted: '00:00:00',
  earningsFormatted: '$0.00',
  gracePeriodEnd: null,
};

export function useDetentionTimer(): DetentionTimerState & DetentionTimerActions {
  const [state, setState] = useState<DetentionTimerState>(INITIAL_STATE);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update timer every second when active
  useEffect(() => {
    if (state.isActive && state.arrivalTime) {
      const updateTimer = () => {
        const calculation = calculateTimerState(
          state.arrivalTime!,
          new Date(),
          state.gracePeriodMinutes,
          state.hourlyRate
        );

        setState((prev) => ({
          ...prev,
          elapsedSeconds: calculation.elapsedSeconds,
          detentionSeconds: calculation.detentionSeconds,
          isInGracePeriod: calculation.isInGracePeriod,
          currentEarnings: calculation.currentEarnings,
          elapsedFormatted: formatTime(calculation.elapsedSeconds),
          detentionFormatted: formatTime(calculation.detentionSeconds),
          earningsFormatted: formatCurrency(calculation.currentEarnings),
        }));
      };

      // Update immediately
      updateTimer();

      // Then update every second
      intervalRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [state.isActive, state.arrivalTime, state.gracePeriodMinutes, state.hourlyRate]);

  const startTimer = useCallback(
    (
      arrivalTime: Date = new Date(),
      gracePeriodMinutes: number = config.detention.defaultGracePeriodMinutes,
      hourlyRate: number = config.detention.defaultHourlyRate
    ) => {
      const gracePeriodEnd = getGracePeriodEnd(arrivalTime, gracePeriodMinutes);

      setState({
        ...INITIAL_STATE,
        isActive: true,
        arrivalTime,
        gracePeriodMinutes,
        hourlyRate,
        gracePeriodEnd,
        isInGracePeriod: true,
      });
    },
    []
  );

  const stopTimer = useCallback(() => {
    if (!state.isActive || !state.arrivalTime) {
      return null;
    }

    const departureTime = new Date();
    const result = calculateDetentionAmount(
      state.arrivalTime,
      departureTime,
      state.gracePeriodMinutes,
      state.hourlyRate
    );

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Reset state
    setState(INITIAL_STATE);

    return {
      ...result,
      arrivalTime: state.arrivalTime,
      departureTime,
    };
  }, [state.isActive, state.arrivalTime, state.gracePeriodMinutes, state.hourlyRate]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setState(INITIAL_STATE);
  }, []);

  return {
    ...state,
    startTimer,
    stopTimer,
    resetTimer,
  };
}
