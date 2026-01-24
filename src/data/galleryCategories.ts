
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
    previewImage: "/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png"
  },
  { 
    id: "desserts", 
    name: "Artisan Desserts",
    description: "Custom cakes, pastries, and beautifully crafted sweet treats",
    previewImage: "/lovable-uploads/84e8a135-2a5b-45ec-a57b-913b0540e56e.png"
  },
  { 
    id: "buffet", 
    name: "Buffet Service",
    description: "Professional buffet service for large events and gatherings",
    previewImage: "/lovable-uploads/531de58a-4283-4d7c-882c-a78b6cdc97c0.png"
  }
];
