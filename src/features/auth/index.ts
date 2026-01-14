/**
 * Auth Feature - Authentication exports
 */

export { useAuthStore } from './store';

// Convenience hook that wraps useAuthStore for common use cases
export function useAuth() {
  const store = useAuthStore();

  return {
    user: store.user,
    session: store.session,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    signOut: store.signOut,
  };
}
