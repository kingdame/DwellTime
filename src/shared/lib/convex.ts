/**
 * Convex Client Configuration
 * Replaces Supabase client for real-time database operations
 */

import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  console.warn(
    "Convex URL not found. Set EXPO_PUBLIC_CONVEX_URL in your environment."
  );
}

/**
 * Convex React client instance
 * Use this with ConvexProvider in your app root
 */
export const convex = new ConvexReactClient(
  convexUrl ?? "https://placeholder.convex.cloud",
  {
    // Disable unsaved changes warning in React Native
    unsavedChangesWarning: false,
  }
);

/**
 * Check if Convex is properly configured
 */
export const isConvexConfigured = (): boolean => {
  return Boolean(convexUrl);
};
