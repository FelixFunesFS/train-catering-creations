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
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

const PhotoGallery = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "carousel" | "featured" | "masonry">("masonry");
  
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'fade-up', delay: 0 },
    desktop: { variant: 'ios-spring', delay: 0 }
  });
  
  const { ref: filterRef, isVisible: filterVisible, variant: filterVariant } = useScrollAnimation({ 
    delay: 100, 
    variant: 'scale-fade',
    mobile: { variant: 'subtle', delay: 100 },
    desktop: { variant: 'scale-fade', delay: 100 }
  });
  
  const { ref: toggleRef, isVisible: toggleVisible, variant: toggleVariant } = useScrollAnimation({ 
    delay: 200, 
    variant: 'scale-fade',
    mobile: { variant: 'subtle', delay: 150 },
    desktop: { variant: 'scale-fade', delay: 200 }
  });
  
  const { ref: galleryRef, isVisible: galleryVisible, variant: galleryVariant } = useScrollAnimation({ 
    delay: 300, 
    variant: 'ios-spring',
    mobile: { variant: 'medium', delay: 200 },
    desktop: { variant: 'ios-spring', delay: 300 }
  });
  
  const { ref: ctaRef, isVisible: ctaVisible, variant: ctaVariant } = useScrollAnimation({ 
    delay: 400, 
    variant: 'elastic',
    mobile: { variant: 'medium', delay: 250 },
    desktop: { variant: 'elastic', delay: 400 }
  });
  
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
  
  return (
    <div className="min-h-screen bg-gradient-hero">
      <SectionCard className="py-px">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={headerRef} className={useAnimationClass(headerVariant, headerVisible)}>
            <GalleryHeader />
          </div>
        </div>
      </SectionCard>
      
      <SectionCard>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={filterRef} className={useAnimationClass(filterVariant, filterVisible)}>
            <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
          </div>
          
          <div ref={toggleRef} className={useAnimationClass(toggleVariant, toggleVisible)}>
            <ViewToggle viewMode={viewMode} onViewChange={handleViewChange} />
          </div>
          
          <div ref={galleryRef} className={useAnimationClass(galleryVariant, galleryVisible)}>
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
        </div>
      </SectionCard>
      
      <div ref={ctaRef} className={useAnimationClass(ctaVariant, ctaVisible)}>
        <GalleryCTA />
      </div>
      
      <ImageModal images={filteredImages} selectedIndex={selectedImageIndex} onClose={handleCloseModal} />
    </div>
  );
};

export default PhotoGallery;