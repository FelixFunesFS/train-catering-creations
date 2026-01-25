import { GalleryImage } from './gallery/types';
import { buffetImages } from './gallery/buffetImages';
import { weddingImages } from './gallery/weddingImages';
import { formalImages } from './gallery/formalImages';
import { dessertImages } from './gallery/dessertImages';

// Import specific images for curated showcase
import militaryCateringService from '@/assets/military-catering-service.jpg';
import dessertParfaitDisplay from '@/assets/gallery/dessert-parfait-display.jpg';
import formalGoldReception from '@/assets/gallery/formal-gold-reception.jpg';
import foodMacCheese from '@/assets/gallery/food-mac-cheese.jpg';

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

// Curated images for home page showcase - order is fixed, no duplicates
export const showcaseImages: GalleryImage[] = [
  {
    src: "/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png",
    category: "wedding",
    title: "Garden Wedding Dining",
    description: "Breathtaking venue with cascading florals and crystal-clear place settings",
    quality: 9
  },
  {
    src: "/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png",
    category: "wedding",
    title: "Enchanted Barn Reception",
    description: "A dreamy rustic venue glowing with chandeliers and twinkling string lights",
    quality: 9
  },
  {
    src: dessertParfaitDisplay,
    category: "desserts",
    title: "Strawberry & Cookies 'n Cream Parfaits",
    description: "Elegant tiered display of fresh strawberry shortcake and Oreo cream parfaits",
    quality: 9
  },
  {
    src: formalGoldReception,
    category: "formal",
    title: "Gold & White Reception Hall",
    description: "Elegant gold-sashed chairs and sparkling fairy lights for a stunning formal event",
    quality: 9
  },
  {
    src: foodMacCheese,
    category: "buffet",
    title: "Golden Baked Mac & Cheese",
    description: "Creamy, bubbly mac and cheese with a perfectly golden herbed crust",
    quality: 9
  },
  {
    src: militaryCateringService,
    category: "buffet",
    title: "Military Base Catering",
    description: "Proud to serve our armed forces with authentic Southern comfort food",
    quality: 10
  }
];
