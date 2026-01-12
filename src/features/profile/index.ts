/**
 * Profile Feature Exports
 */

// Services
export {
  fetchUserProfile,
  updateUserProfile,
  validateProfileInput,
  formatGracePeriod,
  formatHourlyRate,
  VALIDATION_RULES,
  type ProfileUpdateInput,
  type ProfileUpdateResult,
  type ValidationError,
} from './services/profileService';

// Hooks
export {
  useUserProfile,
  useUpdateProfile,
  useCurrentUser,
  useIsProfileComplete,
  useProfileCompletion,
} from './hooks/useProfile';

// Components
export { EditableSettingRow, SettingSectionHeader } from './components/EditableSettingRow';
export { DetentionSettingsModal } from './components/DetentionSettingsModal';
export { InvoiceSettingsModal } from './components/InvoiceSettingsModal';
