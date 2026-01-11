/**
 * Evidence Feature Exports
 * Photo capture and upload functionality for detention evidence
 */

// Services
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

export {
  uploadPhoto,
  uploadPhotos,
  deletePhoto,
  getPhotosForEvent,
  type UploadProgress,
  type UploadResult,
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
