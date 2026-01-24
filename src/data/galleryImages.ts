
import { GalleryImage } from './gallery/types';
import { buffetImages } from './gallery/buffetImages';
import { weddingImages } from './gallery/weddingImages';
import { formalImages } from './gallery/formalImages';
import { teamImages } from './gallery/teamImages';
import { signatureDishesImages } from './gallery/signatureDishesImages';
import { corporateImages } from './gallery/corporateImages';
import { dessertImages } from './gallery/dessertImages';
import { grazingImages } from './gallery/grazingImages';
import { bbqImages } from './gallery/bbqImages';
import { familyImages } from './gallery/familyImages';
import { militaryImages } from './gallery/militaryImages';
import { privateImages } from './gallery/privateImages';

// Re-export the interface for backward compatibility
export type { GalleryImage } from './gallery/types';

// Combine all gallery images from different categories
const allImages: GalleryImage[] = [
  ...buffetImages,
  ...weddingImages,
  ...formalImages,
  ...teamImages,
  ...signatureDishesImages,
  ...corporateImages,
  ...dessertImages,
  ...grazingImages,
  ...bbqImages,
  ...familyImages,
  ...militaryImages,
  ...privateImages
];

export const galleryImages: GalleryImage[] = allImages;
