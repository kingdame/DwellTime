/**
 * TanStack Query Client Configuration
 * Will be configured when TanStack Query is installed
 */

// Placeholder - will be implemented in Task 1.3
export const queryClient = null;

// TODO: Configure with:
// import { QueryClient } from '@tanstack/react-query';
//
// export const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 60 * 5, // 5 minutes
//       gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
//       retry: 2,
//       refetchOnWindowFocus: false,
//     },
//   },
// });

// Query key factory for type-safe queries
export const queryKeys = {
  // User
  user: ['user'] as const,
  userSettings: ['user', 'settings'] as const,

  // Detention
  detentions: ['detentions'] as const,
  detentionsList: (filters: Record<string, unknown>) =>
    ['detentions', 'list', filters] as const,
  detentionDetail: (id: string) =>
    ['detentions', 'detail', id] as const,
  activeDetention: ['detentions', 'active'] as const,

  // Facilities
  facilities: ['facilities'] as const,
  facilitySearch: (query: string) =>
    ['facilities', 'search', query] as const,
  facilityDetail: (id: string) =>
    ['facilities', 'detail', id] as const,
  facilityReviews: (id: string) =>
    ['facilities', 'reviews', id] as const,

  // Invoices
  invoices: ['invoices'] as const,
  invoiceDetail: (id: string) =>
    ['invoices', 'detail', id] as const,
};
