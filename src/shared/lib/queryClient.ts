/**
 * TanStack Query Client Configuration
 * Used for caching and managing server state
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered fresh
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // How long inactive data stays in cache
      gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
      
      // Retry failed requests
      retry: 2,
      
      // Don't refetch on window focus (mobile doesn't have this)
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});
