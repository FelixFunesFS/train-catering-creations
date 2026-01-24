import { GalleryImage } from './types';
import bbqWholePig from '@/assets/gallery/bbq-whole-pig-pineapple.jpg';
import bbqOutdoorCarving from '@/assets/gallery/bbq-outdoor-carving.jpg';

export const bbqImages: GalleryImage[] = [
  {
    src: bbqWholePig,
    category: "bbq",
    title: "Tropical Whole Hog Roast",
    description: "Slow-smoked whole pig garnished with fresh pineapple and kale for a stunning presentation",
    quality: 9
  },
  {
    src: bbqOutdoorCarving,
    category: "bbq",
    title: "Live Carving Station",
    description: "Fresh-off-the-smoker BBQ being carved to order at an outdoor celebration",
    quality: 8
  }
];
