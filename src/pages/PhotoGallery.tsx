
import { useState } from "react";
import { galleryImages } from "@/data/galleryImages";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { GallerySection } from "@/components/gallery/GallerySection";
import { EnhancedImageModal } from "@/components/gallery/EnhancedImageModal";
import { GalleryCTA } from "@/components/gallery/GalleryCTA";
import { PageSection } from "@/components/ui/page-section";
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
  
  const { ref: sectionsRef, isVisible: sectionsVisible, variant: sectionsVariant } = useScrollAnimation({ 
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
  
  // Organize images by category and quality - focused on 4 key sections
  const weddingImages = galleryImages.filter(img => img.category === "wedding").sort((a, b) => b.quality - a.quality);
  const formalImages = galleryImages.filter(img => img.category === "formal").sort((a, b) => b.quality - a.quality);
  const corporateImages = galleryImages.filter(img => img.category === "corporate").sort((a, b) => b.quality - a.quality);
  const dessertImages = galleryImages.filter(img => img.category === "desserts").sort((a, b) => b.quality - a.quality);
  const grazingImages = galleryImages.filter(img => img.category === "grazing").sort((a, b) => b.quality - a.quality);
  const teamImages = galleryImages.filter(img => img.category === "team").sort((a, b) => b.quality - a.quality);
  const buffetImages = galleryImages.filter(img => img.category === "buffet").sort((a, b) => b.quality - a.quality);
  
  // Combine celebrations and ceremonies (weddings + formal + corporate)
  const celebrationImages = [...weddingImages, ...formalImages, ...corporateImages].sort((a, b) => b.quality - a.quality);
  
  // Create theme/ambiance section from buffet and venue setup images
  const themeImages = [...buffetImages].sort((a, b) => b.quality - a.quality);
  
  // Combine desserts and appetizers/grazing for one section
  const dessertsAndAppetizers = [...dessertImages, ...grazingImages].sort((a, b) => b.quality - a.quality);
  
  const allImages = [...celebrationImages, ...themeImages, ...dessertsAndAppetizers, ...teamImages];
  
  const handleImageClick = (imageSrc: string) => {
    const index = allImages.findIndex(img => img.src === imageSrc);
    setSelectedImageIndex(index);
  };
  
  const handleCloseModal = () => {
    setSelectedImageIndex(null);
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
      
      <div ref={sectionsRef} className={useAnimationClass(sectionsVariant, sectionsVisible)}>
        {/* Celebrations & Ceremonies - Pattern A (Deep, dramatic) */}
        {celebrationImages.length > 0 && (
          <PageSection pattern="a" withBorder>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
              <GallerySection
                title="Where Every Moment Becomes a Memory"
                description="From intimate wedding receptions to distinguished military ceremonies and corporate galas, we bring Charleston's finest hospitality to life's most important celebrations. With over 20 years of experience, Chef 'Train' Ward and our professional team ensure every detail honors the significance of your special day."
                images={celebrationImages}
                onImageClick={handleImageClick}
              />
            </div>
          </PageSection>
        )}
        
        {/* Event Themes & Settings - Pattern B (Light, showcasing) */}
        {themeImages.length > 0 && (
          <PageSection pattern="b" withBorder>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
              <GallerySection
                title="Transforming Spaces, Creating Magic"
                description="Every venue tells a story, and we're here to help you tell yours. From elegant buffet presentations to atmospheric lighting and thoughtful table settings, we transform any space into the perfect backdrop for your celebration, creating the ambiance that makes moments unforgettable."
                images={themeImages}
                onImageClick={handleImageClick}
              />
            </div>
          </PageSection>
        )}
        
        {/* Sweet Endings & Appetizers - Pattern C (Elevated, visual) */}
        {dessertsAndAppetizers.length > 0 && (
          <PageSection pattern="c" withBorder>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
              <GallerySection
                title="The Art of First Impressions & Sweet Farewells"
                description="Tanya Ward's culinary artistry shines in every dessert creation and appetizer display. From custom wedding cakes that capture your love story to elegant grazing boards that welcome your guests, we craft the sweet moments and savory beginnings that make celebrations complete."
                images={dessertsAndAppetizers}
                onImageClick={handleImageClick}
              />
            </div>
          </PageSection>
        )}
        
        {/* Our Team - Pattern D (Soft, personal) */}
        {teamImages.length > 0 && (
          <PageSection pattern="d" withBorder>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
              <GallerySection
                title="The Soul Behind Every Celebration"
                description="Meet the heart of Soul Train's Eatery—a dedicated family-run team that brings authentic Southern warmth to every event. Led by Chef 'Train' Ward, our professional staff treats every gathering as if it were our own family celebration, serving with genuine care, pride, and the hospitality that makes the Lowcountry special."
                images={teamImages}
                onImageClick={handleImageClick}
              />
            </div>
          </PageSection>
        )}
      </div>
      
      <PageSection withBorder>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div ref={ctaRef} className={useAnimationClass(ctaVariant, ctaVisible)}>
            <GalleryCTA />
          </div>
        </div>
      </PageSection>
      
      <EnhancedImageModal images={allImages} selectedIndex={selectedImageIndex} onClose={handleCloseModal} />
    </div>
  );
};

export default PhotoGallery;
