/**
 * Evidence Feature Exports
 * Photo capture and upload functionality for detention evidence
 *
 * NOTE: Photo uploads now use Convex with R2 storage.
 * Use: useAddPhoto() from @/shared/hooks/convex for uploading photos
 */

// Photo capture service
export {
  capturePhoto,
  pickPhotoFromLibrary,
  requestCameraPermissions,
  formatGpsCoordinates,
  getCategoryLabel,
  getCategoryIcon,
  type PhotoCategory,
  type PhotoMetadata,
  type CaptureResult,
} from './services/photoService';

// Upload service utilities
export {
  type PhotoUpload,
  type UploadProgress,
  requestCameraPermissions as requestCameraPerms,
  requestMediaLibraryPermissions,
  takePhoto,
  pickPhoto,
  formatFileSize,
  getPhotoCategoryLabel,
  MAX_FILE_SIZE,
  isValidFileSize,
} from './services/uploadService';

// Components
export {
  CaptureButton,
  FloatingCaptureButton,
  MiniCaptureButton,
} from './components/CaptureButton';

export { PhotoPreview } from './components/PhotoPreview';

export {
  CategorySelector,
  CategoryPill,
} from './components/CategorySelector';

export {
  PhotoGallery,
  PhotoGallerySummary,
} from './components/PhotoGallery';
