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
  type EmailContact,
  type EmailContactInput,
} from '../services/emailService';

const CONTACTS_KEY = ['email-contacts'];

/**
 * Hook to fetch all email contacts for current user
 */
export function useEmailContacts() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [...CONTACTS_KEY, user?.id],
    queryFn: () => fetchEmailContacts(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to search email contacts
 */
export function useSearchContacts(query: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [...CONTACTS_KEY, 'search', user?.id, query],
    queryFn: () => searchEmailContacts(user!.id, query),
    enabled: !!user?.id && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch frequently used contacts
 */
export function useFrequentContacts(limit: number = 5) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [...CONTACTS_KEY, 'frequent', user?.id, limit],
    queryFn: () => getFrequentContacts(user!.id, limit),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to save a new email contact
 */
export function useSaveContact() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (input: Omit<EmailContactInput, 'user_id'>) =>
      saveEmailContact({ ...input, user_id: user!.id }),
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

// Re-export types
export type { EmailContact, EmailContactInput };
