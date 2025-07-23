
import { useState } from "react";
import { galleryImages } from "@/data/galleryImages";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { EnhancedImageModal } from "@/components/gallery/EnhancedImageModal";
import { GalleryCTA } from "@/components/gallery/GalleryCTA";
import { PageSection } from "@/components/ui/page-section";
import { SectionedGallery } from "@/components/gallery/SectionedGallery";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

const PhotoGallery = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'fade-up', delay: 0 },
    desktop: { variant: 'ios-spring', delay: 0 }
  });
  
  const { ref: contentRef, isVisible: contentVisible, variant: contentVariant } = useScrollAnimation({ 
    delay: 200, 
    variant: 'ios-spring',
    mobile: { variant: 'medium', delay: 100 },
    desktop: { variant: 'ios-spring', delay: 200 }
  });
  
  const { ref: ctaRef, isVisible: ctaVisible, variant: ctaVariant } = useScrollAnimation({ 
    delay: 400, 
    variant: 'elastic',
    mobile: { variant: 'medium', delay: 250 },
    desktop: { variant: 'elastic', delay: 400 }
  });

  const handleImageClick = (imageSrc: string) => {
    const index = galleryImages.findIndex(img => img.src === imageSrc);
    setSelectedImageIndex(index);
  };
  
  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  // Enhanced category stats with quality filtering
  const qualityImages = galleryImages.filter(img => img.quality >= 6);
  const premiumImages = galleryImages.filter(img => img.quality >= 8);
  const categoryStats = {
    totalImages: qualityImages.length,
    premiumImages: premiumImages.length,
    categories: new Set(galleryImages.map(img => img.category)).size,
    averageQuality: Math.round(galleryImages.reduce((sum, img) => sum + img.quality, 0) / galleryImages.length)
  };
  
  return (
    <div className="min-h-screen bg-gradient-hero">
      <PageSection pattern="a" skipToContentId="page-header" className="py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div ref={headerRef} className={useAnimationClass(headerVariant, headerVisible)}>
            <GalleryHeader />
          </div>
        </div>
      </PageSection>
      
      <PageSection pattern="b" withBorder>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div ref={contentRef} className={useAnimationClass(contentVariant, contentVisible)}>
            {/* Enhanced Gallery Overview Stats */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-primary mb-1">
                    {categoryStats.totalImages}+
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground">
                    Quality Images
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-primary mb-1">
                    {categoryStats.premiumImages}
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground">
                    Premium Collection
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-primary mb-1">
                    {categoryStats.categories}
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground">
                    Event Categories
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-primary mb-1">
                    {categoryStats.averageQuality}/10
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground">
                    Quality Rating
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Sectioned Gallery */}
            <SectionedGallery
              images={galleryImages}
              onImageClick={handleImageClick}
            />
          </div>
        </div>
      </PageSection>
      
      <PageSection pattern="c" withBorder>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div ref={ctaRef} className={useAnimationClass(ctaVariant, ctaVisible)}>
            <GalleryCTA />
          </div>
        </div>
      </PageSection>
      
      <EnhancedImageModal 
        images={galleryImages} 
        selectedIndex={selectedImageIndex} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default PhotoGallery;
