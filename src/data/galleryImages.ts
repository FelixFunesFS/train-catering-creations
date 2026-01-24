import { GalleryImage } from './gallery/types';
import { buffetImages } from './gallery/buffetImages';
import { weddingImages } from './gallery/weddingImages';
import { formalImages } from './gallery/formalImages';
import { dessertImages } from './gallery/dessertImages';

// Re-export the interface for backward compatibility
export type { GalleryImage } from './gallery/types';

// Combine gallery images from the 3 main categories
const allImages: GalleryImage[] = [
  ...buffetImages,
  ...weddingImages,
  ...formalImages,
  ...dessertImages
];

export const galleryImages: GalleryImage[] = allImages;
