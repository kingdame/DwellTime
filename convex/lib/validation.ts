/**
 * Security Validation Helpers
 * Input validation, sanitization, and rate limiting utilities
 */

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

/**
 * RFC 5322 compliant email regex (simplified version)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false; // Max email length per RFC
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

/**
 * Normalize email (lowercase, trim)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// ============================================================================
// STRING VALIDATION
// ============================================================================

/**
 * Sanitize string input (remove potentially harmful characters)
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove null bytes and control characters (except newlines and tabs)
  return input
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Validate string length
 */
export function isValidLength(str: string, min: number, max: number): boolean {
  if (!str || typeof str !== 'string') return min === 0;
  const length = str.trim().length;
  return length >= min && length <= max;
}

/**
 * Check if string contains only alphanumeric characters and specified additional chars
 */
export function isAlphanumeric(str: string, additionalChars: string = ''): boolean {
  if (!str) return false;
  const regex = new RegExp(`^[a-zA-Z0-9${escapeRegex(additionalChars)}]+$`);
  return regex.test(str);
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// NUMBER VALIDATION
// ============================================================================

/**
 * Validate number within range
 */
export function isValidNumber(
  value: unknown,
  min?: number,
  max?: number
): value is number {
  if (typeof value !== 'number' || !isFinite(value)) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return isValidNumber(value, 0);
}

/**
 * Validate integer
 */
export function isValidInteger(
  value: unknown,
  min?: number,
  max?: number
): value is number {
  return isValidNumber(value, min, max) && Number.isInteger(value);
}

// ============================================================================
// PHONE NUMBER VALIDATION
// ============================================================================

/**
 * Basic phone number format validation
 * Accepts various formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
 */
const PHONE_REGEX = /^[\d\s\-\(\)\+\.]+$/;

export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove formatting characters and check length
  const digits = phone.replace(/\D/g, '');
  
  // Most phone numbers are between 10 and 15 digits
  if (digits.length < 10 || digits.length > 15) return false;
  
  return PHONE_REGEX.test(phone);
}

/**
 * Normalize phone number (keep only digits, optionally with leading +)
 */
export function normalizePhone(phone: string): string {
  const hasPlus = phone.startsWith('+');
  const digits = phone.replace(/\D/g, '');
  return hasPlus ? '+' + digits : digits;
}

// ============================================================================
// URL VALIDATION
// ============================================================================

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// ============================================================================
// RATE LIMITING (In-Memory for Convex)
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory rate limit store
// Note: This resets on function cold starts, use database for persistence
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Simple rate limiter for Convex functions
 * @param key - Unique identifier (e.g., userId, IP, etc.)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupRateLimitStore();
  }

  if (!entry || now >= entry.resetTime) {
    // Create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Get remaining rate limit allowance
 */
export function getRateLimitInfo(
  key: string,
  maxRequests: number,
  windowMs: number
): { remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetTime) {
    return { remaining: maxRequests, resetIn: 0 };
  }

  return {
    remaining: Math.max(0, maxRequests - entry.count),
    resetIn: entry.resetTime - now,
  };
}

/**
 * Clean up expired entries from rate limit store
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize object by removing undefined/null values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}

/**
 * Deep sanitize strings in an object
 */
export function deepSanitize<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(deepSanitize) as unknown as T;
  }
  
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = deepSanitize(value);
    }
    return result as T;
  }
  
  return obj;
}

// ============================================================================
// COMMON VALIDATION ERRORS
// ============================================================================

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Assert validation condition, throw ValidationError if false
 */
export function assertValid(condition: boolean, message: string, field?: string): void {
  if (!condition) {
    throw new ValidationError(message, field);
  }
}

// ============================================================================
// BUSINESS LOGIC VALIDATION
// ============================================================================

/**
 * Validate hourly rate is within acceptable range
 */
export function validateHourlyRate(rate: number): void {
  assertValid(
    isValidNumber(rate, 0, 1000),
    'Hourly rate must be between $0 and $1000',
    'hourlyRate'
  );
}

/**
 * Validate grace period is within acceptable range
 */
export function validateGracePeriod(minutes: number): void {
  assertValid(
    isValidInteger(minutes, 0, 720), // Max 12 hours
    'Grace period must be between 0 and 720 minutes',
    'gracePeriodMinutes'
  );
}

/**
 * Validate invoice number format
 */
export function validateInvoiceNumber(invoiceNumber: string): void {
  assertValid(
    isAlphanumeric(invoiceNumber, '-_'),
    'Invoice number can only contain letters, numbers, dashes, and underscores',
    'invoiceNumber'
  );
  assertValid(
    isValidLength(invoiceNumber, 1, 50),
    'Invoice number must be between 1 and 50 characters',
    'invoiceNumber'
  );
}
