/**
 * Email Service
 * Utility functions for invoice emails
 *
 * NOTE: Email sending now uses Convex HTTP actions.
 * Use: useMutation(api.email.sendInvoice) for sending emails
 */

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailContact {
  id: string;
  userId: string;
  email: string;
  name?: string;
  company?: string;
  facilityId?: string;
  lastUsedAt?: number;
  useCount: number;
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate recipient list
 */
export function validateRecipients(recipients: EmailRecipient[]): {
  valid: EmailRecipient[];
  invalid: string[];
} {
  const valid: EmailRecipient[] = [];
  const invalid: string[] = [];

  for (const recipient of recipients) {
    if (isValidEmail(recipient.email)) {
      valid.push(recipient);
    } else {
      invalid.push(recipient.email);
    }
  }

  return { valid, invalid };
}

/**
 * Format recipient for display
 */
export function formatRecipient(recipient: EmailRecipient): string {
  if (recipient.name) {
    return `${recipient.name} <${recipient.email}>`;
  }
  return recipient.email;
}

/**
 * Sort contacts by usage (most used first)
 */
export function sortContactsByUsage(contacts: EmailContact[]): EmailContact[] {
  return [...contacts].sort((a, b) => {
    // First by use count
    if (b.useCount !== a.useCount) {
      return b.useCount - a.useCount;
    }
    // Then by last used
    const aTime = a.lastUsedAt || 0;
    const bTime = b.lastUsedAt || 0;
    return bTime - aTime;
  });
}

/**
 * Filter contacts by search query
 */
export function filterContacts(contacts: EmailContact[], query: string): EmailContact[] {
  const lowerQuery = query.toLowerCase();
  return contacts.filter(contact => 
    contact.email.toLowerCase().includes(lowerQuery) ||
    contact.name?.toLowerCase().includes(lowerQuery) ||
    contact.company?.toLowerCase().includes(lowerQuery)
  );
}
