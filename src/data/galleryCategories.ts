export interface GalleryCategory {
  id: string;
  name: string;
}

export const galleryCategories: GalleryCategory[] = [
  { id: "all", name: "All Photos" },
  { id: "wedding", name: "Weddings" },
  { id: "formal", name: "Formal Events" },
  { id: "buffet", name: "Buffet Service" },
  { id: "signature-dishes", name: "Signature Dishes" },
  { id: "desserts", name: "Desserts" }
];