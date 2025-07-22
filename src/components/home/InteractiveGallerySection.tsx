
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { GalleryCarousel } from "@/components/gallery/GalleryCarousel";
import { DesktopGalleryGrid } from "@/components/gallery/DesktopGalleryGrid";
import { TabletGalleryGrid } from "@/components/gallery/TabletGalleryGrid";
import { EnhancedImageModal } from "@/components/gallery/EnhancedImageModal";
import { useState, useEffect } from "react";
import { galleryImages } from "@/data/galleryImages";

export const InteractiveGallerySection = () => {
  const isMobile = useIsMobile();
  const [isTablet, setIsTablet] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleImageClick = (imageSrc: string) => {
    const index = galleryImages.findIndex(img => img.src === imageSrc);
    setSelectedImageIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  // Select images for different views - desktop shows sets of 5
  const displayImages = isMobile 
    ? galleryImages.slice(0, 12) 
    : isTablet 
    ? galleryImages.slice(0, 19)
    : galleryImages.slice(0, 15); // Desktop: 3 sets of 5 images

  return (
    <>
      <section className="bg-gradient-card/30 border-t border-border/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8 lg:py-12 xl:py-16">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12 xl:mb-16">
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-elegant font-bold text-foreground mb-3 sm:mb-4 leading-tight">
              Gallery Showcase
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              Explore our portfolio of beautifully catered events, from intimate gatherings to grand celebrations. Each image tells a story of culinary excellence and impeccable service that elevates every occasion.
            </p>
          </div>

          {/* Mobile View */}
          {isMobile && (
            <GalleryCarousel 
              images={displayImages} 
              onImageClick={handleImageClick}
            />
          )}

          {/* Tablet View */}
          {isTablet && (
            <TabletGalleryGrid 
              images={displayImages} 
              onImageClick={handleImageClick}
            />
          )}

          {/* Desktop View - Limited to 5 images at a time */}
          {!isMobile && !isTablet && (
            <DesktopGalleryGrid 
              images={displayImages} 
              onImageClick={handleImageClick}
            />
          )}

          <div className="text-center mt-8 sm:mt-10 lg:mt-12 px-2 sm:px-0">
            <Link to="/gallery#page-header">
              <Button variant="cta" size="responsive-md" className="w-full sm:w-auto">
                View Full Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EnhancedImageModal 
        images={galleryImages} 
        selectedIndex={selectedImageIndex} 
        onClose={handleCloseModal} 
      />
    </>
  );
};
