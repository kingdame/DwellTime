/**
 * Auth Feature - Authentication exports
 * 
 * Primary auth is handled by Clerk (@clerk/clerk-expo)
 * This module provides:
 * - useAuthStore: App-level user profile caching
 * - useAuthSync: Syncs Clerk auth with Convex
 * - useCurrentUserId: Get current Convex user ID
 * - useCurrentUser: Get current user profile
 * - Re-exports from Clerk for convenience
 */

export { useAuthStore } from './store';

// Auth sync hooks - Connect Clerk to Convex
export { 
  useAuthSync, 
  useCurrentUserId, 
  useCurrentUser 
} from './hooks/useAuthSync';

// Re-export Clerk hooks for convenience
// Note: Components should prefer importing directly from @clerk/clerk-expo
// for better tree shaking, but these re-exports are available for convenience
export { useAuth, useUser, useSignIn, useSignUp } from '@clerk/clerk-expo';
