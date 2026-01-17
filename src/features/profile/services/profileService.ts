/**
 * Profile Service
 * Handles user profile validation and formatting utilities
 *
 * NOTE: Data operations now use Convex. Use the hooks from @/shared/hooks/convex
 * for data fetching and mutations:
 * - useQuery(api.users.get, { id }) - Get user profile
 * - useMutation(api.users.update) - Update user profile
 */

import type { User } from '@/shared/types';

export interface ProfileUpdateInput {
  name?: string;
  phone?: string;
  companyName?: string;
  hourlyRate?: number;
  gracePeriodMinutes?: number;
  invoiceTerms?: string;
  invoiceLogoUrl?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ProfileUpdateResult {
  success: boolean;
  user?: User;
  errors?: ValidationError[];
}

// Validation constants
const VALIDATION_RULES = {
  hourlyRate: { min: 10, max: 300 },
  gracePeriodMinutes: { min: 0, max: 480 },
  name: { minLength: 1, maxLength: 50 },
  companyName: { minLength: 1, maxLength: 100 },
  phone: { pattern: /^[\d\s\-\(\)\+]{7,20}$/ },
  invoiceTerms: { maxLength: 500 },
};

/**
 * Validate profile update input
 */
export function validateProfileInput(input: ProfileUpdateInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // Hourly rate validation
  if (input.hourlyRate !== undefined) {
    if (typeof input.hourlyRate !== 'number' || isNaN(input.hourlyRate)) {
      errors.push({ field: 'hourlyRate', message: 'Hourly rate must be a number' });
    } else if (input.hourlyRate < VALIDATION_RULES.hourlyRate.min) {
      errors.push({ field: 'hourlyRate', message: `Hourly rate must be at least $${VALIDATION_RULES.hourlyRate.min}` });
    } else if (input.hourlyRate > VALIDATION_RULES.hourlyRate.max) {
      errors.push({ field: 'hourlyRate', message: `Hourly rate cannot exceed $${VALIDATION_RULES.hourlyRate.max}` });
    }
  }

  // Grace period validation
  if (input.gracePeriodMinutes !== undefined) {
    if (typeof input.gracePeriodMinutes !== 'number' || isNaN(input.gracePeriodMinutes)) {
      errors.push({ field: 'gracePeriodMinutes', message: 'Grace period must be a number' });
    } else if (input.gracePeriodMinutes < VALIDATION_RULES.gracePeriodMinutes.min) {
      errors.push({ field: 'gracePeriodMinutes', message: 'Grace period cannot be negative' });
    } else if (input.gracePeriodMinutes > VALIDATION_RULES.gracePeriodMinutes.max) {
      errors.push({ field: 'gracePeriodMinutes', message: `Grace period cannot exceed ${VALIDATION_RULES.gracePeriodMinutes.max} minutes (8 hours)` });
    }
  }

  // Name validation
  if (input.name !== undefined) {
    const trimmed = input.name.trim();
    if (trimmed.length < VALIDATION_RULES.name.minLength) {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (trimmed.length > VALIDATION_RULES.name.maxLength) {
      errors.push({ field: 'name', message: `Name cannot exceed ${VALIDATION_RULES.name.maxLength} characters` });
    }
  }

  // Company name validation
  if (input.companyName !== undefined && input.companyName.trim().length > 0) {
    if (input.companyName.length > VALIDATION_RULES.companyName.maxLength) {
      errors.push({ field: 'companyName', message: `Company name cannot exceed ${VALIDATION_RULES.companyName.maxLength} characters` });
    }
  }

  // Phone validation
  if (input.phone !== undefined && input.phone.trim().length > 0) {
    if (!VALIDATION_RULES.phone.pattern.test(input.phone)) {
      errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
    }
  }

  // Invoice terms validation
  if (input.invoiceTerms !== undefined) {
    if (input.invoiceTerms.length > VALIDATION_RULES.invoiceTerms.maxLength) {
      errors.push({ field: 'invoiceTerms', message: `Invoice terms cannot exceed ${VALIDATION_RULES.invoiceTerms.maxLength} characters` });
    }
  }

  return errors;
}

/**
 * Clean profile input - trim strings, prepare for mutation
 */
export function cleanProfileInput(input: ProfileUpdateInput): Record<string, unknown> {
  const cleanedInput: Record<string, unknown> = {};

  if (input.name !== undefined) cleanedInput.name = input.name.trim();
  if (input.phone !== undefined) cleanedInput.phone = input.phone.trim() || undefined;
  if (input.companyName !== undefined) cleanedInput.companyName = input.companyName.trim() || undefined;
  if (input.hourlyRate !== undefined) cleanedInput.hourlyRate = input.hourlyRate;
  if (input.gracePeriodMinutes !== undefined) cleanedInput.gracePeriodMinutes = input.gracePeriodMinutes;
  if (input.invoiceTerms !== undefined) cleanedInput.invoiceTerms = input.invoiceTerms.trim() || undefined;
  if (input.invoiceLogoUrl !== undefined) cleanedInput.invoiceLogoUrl = input.invoiceLogoUrl || undefined;

  return cleanedInput;
}

/**
 * Format grace period for display
 */
export function formatGracePeriod(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  return `${hours}h ${mins}m`;
}

/**
 * Format hourly rate for display
 */
export function formatHourlyRate(rate: number): string {
  return `$${rate.toFixed(2)}/hr`;
}

// Export validation rules for UI hints
export { VALIDATION_RULES };
