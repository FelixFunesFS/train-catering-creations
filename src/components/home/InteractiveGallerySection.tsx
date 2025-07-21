
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { GalleryCarousel } from "@/components/gallery/GalleryCarousel";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";
import { ImageModal } from "@/components/gallery/ImageModal";
import { useState } from "react";
import { galleryImages } from "@/data/galleryImages";

export const InteractiveGallerySection = () => {
  const isMobile = useIsMobile();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const handleImageClick = (imageSrc: string) => {
    const index = galleryImages.findIndex(img => img.src === imageSrc);
    setSelectedImageIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  return (
    <>
      <section className="bg-gradient-card/30 border-t border-border/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-10 lg:py-12 xl:py-16">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10 xl:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-3 sm:mb-4 leading-tight">
              Gallery Showcase
            </h2>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explore our portfolio of beautifully catered events, from intimate gatherings to grand celebrations. Each image tells a story of culinary excellence and impeccable service.
            </p>
          </div>

          {isMobile ? (
            <GalleryCarousel 
              images={galleryImages} 
              onImageClick={handleImageClick}
            />
          ) : (
            <MasonryGrid 
              images={galleryImages.slice(0, 12)} 
              onImageClick={handleImageClick}
            />
          )}

          <div className="text-center mt-8 sm:mt-10 lg:mt-12">
            <Link to="/gallery#page-header">
              <Button variant="cta" size="responsive-md" className="w-4/5 sm:w-auto">
                View Full Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <ImageModal 
        images={galleryImages} 
        selectedIndex={selectedImageIndex} 
        onClose={handleCloseModal} 
      />
    </>
  );
};
