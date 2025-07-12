import { useState } from "react";
import { galleryImages } from "@/data/galleryImages";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { CategoryFilter } from "@/components/gallery/CategoryFilter";
import { ImageGrid } from "@/components/gallery/ImageGrid";
import { ImageModal } from "@/components/gallery/ImageModal";
import { GalleryCTA } from "@/components/gallery/GalleryCTA";

const PhotoGallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredImages = selectedCategory === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-16 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GalleryHeader />
        
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <ImageGrid 
          images={filteredImages}
          onImageClick={handleImageClick}
        />
        
        <GalleryCTA />
        
        <ImageModal 
          selectedImage={selectedImage}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default PhotoGallery;