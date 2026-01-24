import { GalleryImage } from './types';
import teamFounders from '@/assets/gallery/team-founders.jpg';
import teamStaffServing from '@/assets/gallery/team-staff-serving.jpg';

export const teamImages: GalleryImage[] = [
  {
    src: teamFounders,
    category: "team",
    title: "The Heart of Soul Train's Eatery",
    description: "Our founders bringing Southern hospitality and passion to every event we cater",
    quality: 9
  },
  {
    src: teamStaffServing,
    category: "team",
    title: "Professional Service Excellence",
    description: "Our dedicated team presenting beautifully crafted dishes with pride",
    quality: 8
  }
];
