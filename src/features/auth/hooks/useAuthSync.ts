/**
 * Auth Sync Hook
 * Syncs Clerk authentication with Convex user database
 * 
 * This hook:
 * 1. Listens for Clerk auth state changes
 * 2. Creates or retrieves user in Convex on sign-in
 * 3. Updates the local auth store with user profile
 * 4. Clears auth store on sign-out
 */

import { useEffect, useRef } from 'react';
import { useAuth, useUser as useClerkUser } from '@clerk/clerk-expo';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthStore } from '../store';

/**
 * Hook to sync Clerk auth with Convex user database
 * Should be used in the root layout component
 */
export function useAuthSync() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useClerkUser();
  
  // Get store functions using separate selectors for stability
  const setUserProfile = useAuthStore((state) => state.setUserProfile);
  const setLoading = useAuthStore((state) => state.setLoading);
  const clearUserProfile = useAuthStore((state) => state.clearUserProfile);

  // Get or create user mutation
  const getOrCreate = useMutation(api.users.getOrCreate);

  // Query for user by Clerk ID (for real-time updates)
  const clerkId = clerkUser?.id;
  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkId ? { clerkId } : 'skip'
  );

  // Track if we've already synced to prevent multiple calls
  const hasSynced = useRef(false);
  const lastConvexUserId = useRef<string | null>(null);

  // Handle auth state changes and sync user
  useEffect(() => {
    if (!authLoaded || !userLoaded) return;

    if (isSignedIn && clerkUser && !hasSynced.current) {
      hasSynced.current = true;
      setLoading(true);

      getOrCreate({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: clerkUser.fullName || clerkUser.firstName || undefined,
      })
        .then((user) => {
          if (user) {
            setUserProfile({
              id: user._id,
              email: user.email,
              name: user.name,
              companyName: user.companyName,
              subscriptionTier: user.subscriptionTier || 'free',
            });
          }
        })
        .catch((error) => {
          console.error('Failed to sync user:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!isSignedIn && hasSynced.current) {
      hasSynced.current = false;
      lastConvexUserId.current = null;
      clearUserProfile();
    }
  }, [isSignedIn, authLoaded, userLoaded, clerkUser?.id, getOrCreate, setUserProfile, setLoading, clearUserProfile]);

  // Keep auth store in sync with Convex user (real-time updates)
  // Only update if the convexUser ID changed to prevent infinite loops
  useEffect(() => {
    if (convexUser && convexUser._id !== lastConvexUserId.current) {
      lastConvexUserId.current = convexUser._id;
      setUserProfile({
        id: convexUser._id,
        email: convexUser.email,
        name: convexUser.name,
        companyName: convexUser.companyName,
        subscriptionTier: convexUser.subscriptionTier || 'free',
      });
    }
  }, [convexUser, setUserProfile]);

  return {
    isLoading: !authLoaded || !userLoaded,
    isSignedIn,
    user: convexUser,
  };
}

/**
 * Hook to get the current Convex user ID
 * Returns undefined if not signed in
 */
export function useCurrentUserId() {
  const { userProfile } = useAuthStore();
  return userProfile?.id;
}

/**
 * Hook to get the current user profile
 * Returns null if not signed in
 */
export function useCurrentUser() {
  const { userProfile } = useAuthStore();
  return userProfile;
}
