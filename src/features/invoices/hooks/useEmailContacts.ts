/**
 * useEmailContacts Hook
 * React Query hooks for email contact operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store';
import {
  fetchEmailContacts,
  saveEmailContact,
  deleteEmailContact,
  incrementContactUsage,
  searchEmailContacts,
  getFrequentContacts,
  updateEmailContact,
  fetchContactsByType,
  getContactStats,
  type EmailContact,
  type EmailContactInput,
} from '../services/emailService';

const CONTACTS_KEY = ['email-contacts'];

/**
 * Hook to fetch all email contacts for current user
 */
export function useEmailContacts() {
  const { userProfile } = useAuthStore();

  return useQuery({
    queryKey: [...CONTACTS_KEY, userProfile?.id],
    queryFn: () => fetchEmailContacts(userProfile!.id),
    enabled: !!userProfile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to search email contacts
 */
export function useSearchContacts(query: string) {
  const { userProfile } = useAuthStore();

  return useQuery({
    queryKey: [...CONTACTS_KEY, 'search', userProfile?.id, query],
    queryFn: () => searchEmailContacts(userProfile!.id, query),
    enabled: !!userProfile?.id && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch frequently used contacts
 */
export function useFrequentContacts(limit: number = 5) {
  const { userProfile } = useAuthStore();

  return useQuery({
    queryKey: [...CONTACTS_KEY, 'frequent', userProfile?.id, limit],
    queryFn: () => getFrequentContacts(userProfile!.id, limit),
    enabled: !!userProfile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to save a new email contact
 */
export function useSaveContact() {
  const queryClient = useQueryClient();
  const { userProfile } = useAuthStore();

  return useMutation({
    mutationFn: (input: Omit<EmailContactInput, 'user_id'>) =>
      saveEmailContact({ ...input, user_id: userProfile!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEY });
    },
  });
}

/**
 * Hook to delete an email contact
 */
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmailContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEY });
    },
  });
}

/**
 * Hook to increment contact usage count
 */
export function useIncrementContactUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: incrementContactUsage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEY });
    },
  });
}

/**
 * Hook to update an email contact
 */
export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<EmailContactInput, 'user_id'>> }) =>
      updateEmailContact(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEY });
    },
  });
}

/**
 * Hook to fetch contacts by type
 */
export function useContactsByType(contactType: 'broker' | 'shipper' | 'dispatcher' | 'other' | null) {
  const { userProfile } = useAuthStore();

  return useQuery({
    queryKey: [...CONTACTS_KEY, 'byType', userProfile?.id, contactType],
    queryFn: () => fetchContactsByType(userProfile!.id, contactType!),
    enabled: !!userProfile?.id && !!contactType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch contact statistics
 */
export function useContactStats() {
  const { userProfile } = useAuthStore();

  return useQuery({
    queryKey: [...CONTACTS_KEY, 'stats', userProfile?.id],
    queryFn: () => getContactStats(userProfile!.id),
    enabled: !!userProfile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Re-export types
export type { EmailContact, EmailContactInput };
