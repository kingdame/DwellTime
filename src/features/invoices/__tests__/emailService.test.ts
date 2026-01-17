/**
 * Email Service Tests
 * Tests pure utility functions for invoice emails
 * 
 * NOTE: Email sending now uses Convex HTTP actions.
 * These tests cover the utility/helper functions only.
 */

import {
  isValidEmail,
  validateRecipients,
  formatRecipient,
  sortContactsByUsage,
  filterContacts,
} from '../services/emailService';

import type { EmailRecipient, EmailContact } from '../services/emailService';

// ============================================================================
// Test Data
// ============================================================================

const mockContacts: EmailContact[] = [
  {
    id: '1',
    userId: 'user-1',
    email: 'john@broker.com',
    name: 'John Smith',
    company: 'ABC Logistics',
    useCount: 10,
    lastUsedAt: Date.now() - 1000,
  },
  {
    id: '2',
    userId: 'user-1',
    email: 'jane@shipper.com',
    name: 'Jane Doe',
    company: 'XYZ Shipping',
    useCount: 5,
    lastUsedAt: Date.now() - 2000,
  },
  {
    id: '3',
    userId: 'user-1',
    email: 'bob@warehouse.com',
    name: 'Bob Wilson',
    company: 'Fast Freight',
    useCount: 10,
    lastUsedAt: Date.now() - 5000,
  },
];

// ============================================================================
// isValidEmail Tests
// ============================================================================

describe('isValidEmail', () => {
  it('validates correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.org')).toBe(true);
    expect(isValidEmail('user+tag@company.co')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
  });

  it('rejects emails with spaces', () => {
    expect(isValidEmail('user name@domain.com')).toBe(false);
    expect(isValidEmail(' user@domain.com')).toBe(false);
  });
});

// ============================================================================
// validateRecipients Tests
// ============================================================================

describe('validateRecipients', () => {
  it('separates valid and invalid recipients', () => {
    const recipients: EmailRecipient[] = [
      { email: 'valid@example.com', name: 'Valid User' },
      { email: 'invalid', name: 'Invalid User' },
      { email: 'another@test.org' },
    ];

    const result = validateRecipients(recipients);

    expect(result.valid).toHaveLength(2);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0]).toBe('invalid');
  });

  it('handles all valid recipients', () => {
    const recipients: EmailRecipient[] = [
      { email: 'one@test.com' },
      { email: 'two@test.com' },
    ];

    const result = validateRecipients(recipients);

    expect(result.valid).toHaveLength(2);
    expect(result.invalid).toHaveLength(0);
  });

  it('handles all invalid recipients', () => {
    const recipients: EmailRecipient[] = [
      { email: 'bad1' },
      { email: 'bad2' },
    ];

    const result = validateRecipients(recipients);

    expect(result.valid).toHaveLength(0);
    expect(result.invalid).toHaveLength(2);
  });

  it('handles empty array', () => {
    const result = validateRecipients([]);
    expect(result.valid).toHaveLength(0);
    expect(result.invalid).toHaveLength(0);
  });
});

// ============================================================================
// formatRecipient Tests
// ============================================================================

describe('formatRecipient', () => {
  it('formats recipient with name', () => {
    const recipient: EmailRecipient = {
      email: 'john@example.com',
      name: 'John Doe',
    };

    expect(formatRecipient(recipient)).toBe('John Doe <john@example.com>');
  });

  it('returns just email when no name', () => {
    const recipient: EmailRecipient = {
      email: 'john@example.com',
    };

    expect(formatRecipient(recipient)).toBe('john@example.com');
  });

  it('handles empty name', () => {
    const recipient: EmailRecipient = {
      email: 'john@example.com',
      name: '',
    };

    expect(formatRecipient(recipient)).toBe('john@example.com');
  });
});

// ============================================================================
// sortContactsByUsage Tests
// ============================================================================

describe('sortContactsByUsage', () => {
  it('sorts by use count descending', () => {
    const sorted = sortContactsByUsage(mockContacts);

    // Both id 1 and 3 have useCount 10, so first one depends on lastUsedAt
    expect(sorted[0].useCount).toBe(10);
    expect(sorted[2].useCount).toBe(5);
  });

  it('uses lastUsedAt as tiebreaker', () => {
    const sorted = sortContactsByUsage(mockContacts);

    // ID 1 and 3 both have useCount 10, but 1 was used more recently
    const topTwo = sorted.slice(0, 2);
    expect(topTwo.find(c => c.id === '1')).toBeTruthy();
    expect(topTwo.find(c => c.id === '3')).toBeTruthy();
  });

  it('does not mutate original array', () => {
    const original = [...mockContacts];
    sortContactsByUsage(mockContacts);
    expect(mockContacts).toEqual(original);
  });

  it('handles empty array', () => {
    expect(sortContactsByUsage([])).toEqual([]);
  });
});

// ============================================================================
// filterContacts Tests
// ============================================================================

describe('filterContacts', () => {
  it('filters by email', () => {
    const filtered = filterContacts(mockContacts, 'broker');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].email).toBe('john@broker.com');
  });

  it('filters by name', () => {
    const filtered = filterContacts(mockContacts, 'Jane');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Jane Doe');
  });

  it('filters by company', () => {
    const filtered = filterContacts(mockContacts, 'Freight');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].company).toBe('Fast Freight');
  });

  it('is case insensitive', () => {
    const filtered = filterContacts(mockContacts, 'JOHN');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('John Smith');
  });

  it('returns all contacts for empty query', () => {
    const filtered = filterContacts(mockContacts, '');
    expect(filtered).toHaveLength(3);
  });

  it('returns empty array for no matches', () => {
    const filtered = filterContacts(mockContacts, 'nonexistent');
    expect(filtered).toHaveLength(0);
  });
});
