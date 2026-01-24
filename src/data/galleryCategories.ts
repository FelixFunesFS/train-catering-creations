
export interface GalleryCategory {
  id: string;
  name: string;
  description: string;
  // For combined categories, filter by multiple IDs
  filterIds?: string[];
  // Fixed preview image for category cards
  previewImage: string;
}

export const galleryCategories: GalleryCategory[] = [
  { 
    id: "weddings-formal", 
    name: "Weddings & Black Tie",
    description: "Elegant weddings, receptions, and sophisticated formal gatherings",
    filterIds: ["wedding", "formal"],
    previewImage: "/lovable-uploads/wedding-card-preview.jpg"
  },
  { 
    id: "desserts", 
    name: "Artisan Desserts",
    description: "Custom cakes, pastries, and beautifully crafted sweet treats",
    previewImage: "/lovable-uploads/desserts-card-preview.jpg"
  },
  { 
    id: "buffet", 
    name: "Buffet Service",
    description: "Professional buffet service for large events and gatherings",
    previewImage: "/lovable-uploads/buffet-card-preview.png"
  }
];
