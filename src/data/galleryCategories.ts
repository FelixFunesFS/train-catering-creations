export interface GalleryCategory {
  id: string;
  name: string;
}

export const galleryCategories: GalleryCategory[] = [
  { id: "all", name: "All Photos" },
  { id: "wedding", name: "Weddings" },
  { id: "formal", name: "Formal Events" },
  { id: "grazing", name: "Grazing Boards" },
  { id: "buffet", name: "Buffet Service" },
  { id: "desserts", name: "Desserts" },
  { id: "signature-dishes", name: "Signature Dishes" },
  { id: "team", name: "Team" },
  { id: "bbq", name: "BBQ & Outdoor" },
  { id: "corporate", name: "Corporate Events" },
  { id: "family", name: "Family Events" }
];