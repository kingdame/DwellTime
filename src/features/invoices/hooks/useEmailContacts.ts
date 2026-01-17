/**
 * Email Contacts Hooks - Convex-based
 * Provides hooks for managing email contacts
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// Re-export the type
export type EmailContact = {
  _id: Id<"emailContacts">;
  userId: Id<"users">;
  email: string;
  name?: string;
  company?: string;
  contactType?: "broker" | "shipper" | "dispatcher" | "other";
  useCount: number;
  lastUsedAt: number;
};

/**
 * Get all email contacts for a user
 */
export function useEmailContacts(userId: Id<"users"> | undefined) {
  return useQuery(api.emailContacts.getByUser, userId ? { userId } : "skip");
}

/**
 * Get most-used contacts
 */
export function useMostUsedContacts(userId: Id<"users"> | undefined, limit?: number) {
  return useQuery(
    api.emailContacts.getMostUsed,
    userId ? { userId, limit } : "skip"
  );
}

/**
 * Search contacts
 */
export function useSearchContacts(userId: Id<"users"> | undefined, query: string) {
  return useQuery(
    api.emailContacts.search,
    userId && query ? { userId, query } : "skip"
  );
}

/**
 * Get contact stats (simplified)
 */
export function useContactStats(userId: Id<"users"> | undefined) {
  const contacts = useEmailContacts(userId);
  
  if (!contacts) return undefined;
  
  return {
    totalContacts: contacts.length,
    byType: {
      broker: contacts.filter(c => c.contactType === 'broker').length,
      shipper: contacts.filter(c => c.contactType === 'shipper').length,
      dispatcher: contacts.filter(c => c.contactType === 'dispatcher').length,
      other: contacts.filter(c => c.contactType === 'other').length,
    },
  };
}

/**
 * Save (create/update) a contact
 */
export function useSaveContact() {
  return useMutation(api.emailContacts.upsert);
}

/**
 * Delete a contact
 */
export function useDeleteContact() {
  return useMutation(api.emailContacts.remove);
}

/**
 * Update a contact
 */
export function useUpdateContact() {
  return useMutation(api.emailContacts.update);
}
