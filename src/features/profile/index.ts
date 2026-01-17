/**
 * Profile Feature Exports
 *
 * NOTE: Profile data operations now use Convex hooks from @/shared/hooks/convex:
 * - useUser(id) - Get user profile
 * - useCreateUser() - Create user
 * - useUpdateUser() - Update user profile
 */

// Services - Utility and validation functions
export {
  type ProfileUpdateInput,
  type ValidationError,
  type ProfileUpdateResult,
  validateProfileInput,
  cleanProfileInput,
  formatGracePeriod,
  formatHourlyRate,
  VALIDATION_RULES,
} from './services/profileService';

// Convex Hooks (re-export for convenience)
export {
  useUser,
  useUserByEmail,
  useCreateUser,
  useUpdateUser,
  useUpdateUserSubscription,
  useSetCurrentFleet,
  useSubscription,
  useCreateSubscription,
  useUpdateSubscription,
  useCancelSubscription,
} from './hooks/useProfileConvex';

// Profile Completion Hook
export { useProfileCompletion } from './hooks/useProfileCompletion';

// Components
export { EditableSettingRow, SettingSectionHeader } from './components/EditableSettingRow';
export { DetentionSettingsModal } from './components/DetentionSettingsModal';
export { InvoiceSettingsModal } from './components/InvoiceSettingsModal';
