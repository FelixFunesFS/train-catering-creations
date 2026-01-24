
export interface GalleryCategory {
  id: string;
  name: string;
  description: string;
  // For combined categories, filter by multiple IDs
  filterIds?: string[];
}

export const galleryCategories: GalleryCategory[] = [
  { 
    id: "weddings-formal", 
    name: "Weddings & Black Tie",
    description: "Elegant weddings, receptions, and sophisticated formal gatherings",
    filterIds: ["wedding", "formal"]
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
