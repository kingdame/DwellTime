/**
 * Profile Service
 * Handles user profile updates with validation
 */

import { supabase } from '@/shared/lib/supabase';
import type { User } from '@/shared/types';

export interface ProfileUpdateInput {
  name?: string;
  phone?: string;
  company_name?: string;
  hourly_rate?: number;
  grace_period_minutes?: number;
  invoice_terms?: string;
  invoice_logo_url?: string;
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
  hourly_rate: { min: 10, max: 300 },
  grace_period_minutes: { min: 0, max: 480 },
  name: { minLength: 1, maxLength: 50 },
  company_name: { minLength: 1, maxLength: 100 },
  phone: { pattern: /^[\d\s\-\(\)\+]{7,20}$/ },
  invoice_terms: { maxLength: 500 },
};

/**
 * Validate profile update input
 */
export function validateProfileInput(input: ProfileUpdateInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // Hourly rate validation
  if (input.hourly_rate !== undefined) {
    if (typeof input.hourly_rate !== 'number' || isNaN(input.hourly_rate)) {
      errors.push({ field: 'hourly_rate', message: 'Hourly rate must be a number' });
    } else if (input.hourly_rate < VALIDATION_RULES.hourly_rate.min) {
      errors.push({ field: 'hourly_rate', message: `Hourly rate must be at least $${VALIDATION_RULES.hourly_rate.min}` });
    } else if (input.hourly_rate > VALIDATION_RULES.hourly_rate.max) {
      errors.push({ field: 'hourly_rate', message: `Hourly rate cannot exceed $${VALIDATION_RULES.hourly_rate.max}` });
    }
  }

  // Grace period validation
  if (input.grace_period_minutes !== undefined) {
    if (typeof input.grace_period_minutes !== 'number' || isNaN(input.grace_period_minutes)) {
      errors.push({ field: 'grace_period_minutes', message: 'Grace period must be a number' });
    } else if (input.grace_period_minutes < VALIDATION_RULES.grace_period_minutes.min) {
      errors.push({ field: 'grace_period_minutes', message: 'Grace period cannot be negative' });
    } else if (input.grace_period_minutes > VALIDATION_RULES.grace_period_minutes.max) {
      errors.push({ field: 'grace_period_minutes', message: `Grace period cannot exceed ${VALIDATION_RULES.grace_period_minutes.max} minutes (8 hours)` });
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
  if (input.company_name !== undefined && input.company_name.trim().length > 0) {
    if (input.company_name.length > VALIDATION_RULES.company_name.maxLength) {
      errors.push({ field: 'company_name', message: `Company name cannot exceed ${VALIDATION_RULES.company_name.maxLength} characters` });
    }
  }

  // Phone validation
  if (input.phone !== undefined && input.phone.trim().length > 0) {
    if (!VALIDATION_RULES.phone.pattern.test(input.phone)) {
      errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
    }
  }

  // Invoice terms validation
  if (input.invoice_terms !== undefined) {
    if (input.invoice_terms.length > VALIDATION_RULES.invoice_terms.maxLength) {
      errors.push({ field: 'invoice_terms', message: `Invoice terms cannot exceed ${VALIDATION_RULES.invoice_terms.maxLength} characters` });
    }
  }

  return errors;
}

/**
 * Fetch user profile by ID
 */
export async function fetchUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching user profile:', error);
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data;
}

/**
 * Update user profile with validation
 */
export async function updateUserProfile(
  userId: string,
  input: ProfileUpdateInput
): Promise<ProfileUpdateResult> {
  // Validate input
  const validationErrors = validateProfileInput(input);
  if (validationErrors.length > 0) {
    return { success: false, errors: validationErrors };
  }

  // Clean input - trim strings, remove undefined
  const cleanedInput: Record<string, any> = {};

  if (input.name !== undefined) cleanedInput.name = input.name.trim();
  if (input.phone !== undefined) cleanedInput.phone = input.phone.trim() || null;
  if (input.company_name !== undefined) cleanedInput.company_name = input.company_name.trim() || null;
  if (input.hourly_rate !== undefined) cleanedInput.hourly_rate = input.hourly_rate;
  if (input.grace_period_minutes !== undefined) cleanedInput.grace_period_minutes = input.grace_period_minutes;
  if (input.invoice_terms !== undefined) cleanedInput.invoice_terms = input.invoice_terms.trim() || null;
  if (input.invoice_logo_url !== undefined) cleanedInput.invoice_logo_url = input.invoice_logo_url || null;

  // Add updated_at timestamp
  cleanedInput.updated_at = new Date().toISOString();

  // Update in Supabase
  const { data, error } = await supabase
    .from('users')
    .update(cleanedInput)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      errors: [{ field: 'general', message: `Failed to update profile: ${error.message}` }],
    };
  }

  return { success: true, user: data };
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
