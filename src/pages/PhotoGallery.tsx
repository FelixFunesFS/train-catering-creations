import { useState } from "react";
import { galleryImages } from "@/data/galleryImages";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { CategoryFilter } from "@/components/gallery/CategoryFilter";
import { ViewToggle } from "@/components/gallery/ViewToggle";
import { ImageGrid } from "@/components/gallery/ImageGrid";
import { FeaturedImageGrid } from "@/components/gallery/FeaturedImageGrid";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";
import { GalleryCarousel } from "@/components/gallery/GalleryCarousel";
import { ImageModal } from "@/components/gallery/ImageModal";
import { GalleryCTA } from "@/components/gallery/GalleryCTA";
import { SectionCard } from "@/components/ui/section-card";
const PhotoGallery = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "carousel" | "featured" | "masonry">("masonry");
  const filteredImages = selectedCategory === "all" ? galleryImages : galleryImages.filter(img => img.category === selectedCategory);
  const handleImageClick = (imageSrc: string) => {
    const index = filteredImages.findIndex(img => img.src === imageSrc);
    setSelectedImageIndex(index);
  };
  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleViewChange = (view: "grid" | "carousel" | "featured" | "masonry") => {
    setViewMode(view);
  };
  return <div className="min-h-screen bg-gradient-hero">
        <SectionCard className="py-px">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <GalleryHeader />
          </div>
        </SectionCard>
        
        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
            
            <ViewToggle viewMode={viewMode} onViewChange={handleViewChange} />
            
            {viewMode === "grid" && (
              <ImageGrid images={filteredImages} onImageClick={handleImageClick} />
            )}
            
            {viewMode === "featured" && (
              <FeaturedImageGrid images={filteredImages} onImageClick={handleImageClick} />
            )}
            
            {viewMode === "masonry" && (
              <MasonryGrid images={filteredImages} onImageClick={handleImageClick} />
            )}
            
            {viewMode === "carousel" && (
              <GalleryCarousel images={filteredImages} onImageClick={handleImageClick} />
            )}
          </div>
        </SectionCard>
        
        <GalleryCTA />
        
        <ImageModal images={filteredImages} selectedIndex={selectedImageIndex} onClose={handleCloseModal} />
    </div>;
};
export default PhotoGallery;