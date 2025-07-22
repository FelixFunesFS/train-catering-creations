
export interface GalleryCategory {
  id: string;
  name: string;
  description: string;
}

export const galleryCategories: GalleryCategory[] = [
  { 
    id: "wedding", 
    name: "Wedding Celebrations",
    description: "Elegant wedding receptions and ceremonies with impeccable service"
  },
  { 
    id: "formal", 
    name: "Formal & Black Tie Events",
    description: "Sophisticated catering for corporate galas and upscale gatherings"
  },
  { 
    id: "desserts", 
    name: "Artisan Desserts",
    description: "Custom cakes, pastries, and beautifully crafted sweet treats"
  },
  { 
    id: "buffet", 
    name: "Buffet Service",
    description: "Professional buffet service for large events and gatherings"
  }
];
