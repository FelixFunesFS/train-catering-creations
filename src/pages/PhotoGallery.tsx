
import { useState } from "react";
import { galleryImages } from "@/data/galleryImages";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { MobileGallerySection } from "@/components/gallery/MobileGallerySection";
import { EnhancedImageModal } from "@/components/gallery/EnhancedImageModal";
import { GalleryCTA } from "@/components/gallery/GalleryCTA";
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
  const dessertImages = galleryImages.filter(img => img.category === "desserts").sort((a, b) => b.quality - a.quality);
  const grazingImages = galleryImages.filter(img => img.category === "grazing").sort((a, b) => b.quality - a.quality);
  const teamImages = galleryImages.filter(img => img.category === "team").sort((a, b) => b.quality - a.quality);
  
  // Combine desserts and appetizers/grazing for one section
  const dessertsAndAppetizers = [...dessertImages, ...grazingImages].sort((a, b) => b.quality - a.quality);
  
  const allImages = [...weddingImages, ...formalImages, ...dessertsAndAppetizers, ...teamImages];
  
  const handleImageClick = (imageSrc: string) => {
    const index = allImages.findIndex(img => img.src === imageSrc);
    setSelectedImageIndex(index);
  };
  
  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };
  
  return (
    <div className="min-h-screen bg-gradient-hero">
      <section className="py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div ref={headerRef} className={useAnimationClass(headerVariant, headerVisible)}>
            <GalleryHeader />
          </div>
        </div>
      </section>
      
      <section className="py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div ref={sectionsRef} className={useAnimationClass(sectionsVariant, sectionsVisible)}>
            <div className="space-y-8 sm:space-y-10 lg:space-y-12">
              
              {/* Wedding Celebrations */}
              {weddingImages.length > 0 && (
                <MobileGallerySection
                  title="Where Love Meets Celebration"
                  description="From the Charleston Lowcountry to your heart's desire, we transform wedding dreams into culinary reality. With over 20 years of Southern hospitality, Chef 'Train' Ward and our family-run team create unforgettable moments where every bite tells your love story."
                  images={weddingImages}
                  onImageClick={handleImageClick}
                />
              )}
              
              {/* Formal & Military Events */}
              {formalImages.length > 0 && (
                <MobileGallerySection
                  title="Honoring Service with Excellence"
                  description="We take pride in serving those who serve. From military ceremonies to corporate galas, our professional team delivers with the respect and precision that formal occasions demand. Every detail honored, every guest celebrated."
                  images={formalImages}
                  onImageClick={handleImageClick}
                />
              )}
              
              {/* Desserts & Appetizers */}
              {dessertsAndAppetizers.length > 0 && (
                <MobileGallerySection
                  title="Sweet Endings, Perfect Beginnings"
                  description="Tanya Ward's artistry shines in every dessert creation and appetizer display. From custom wedding cakes to elegant grazing boards, we craft the sweet moments that bring people together and make celebrations complete."
                  images={dessertsAndAppetizers}
                  onImageClick={handleImageClick}
                />
              )}
              
              {/* Our Team */}
              {teamImages.length > 0 && (
                <MobileGallerySection
                  title="The Heart Behind Every Meal"
                  description="Meet the Soul Train family—a dedicated team that brings Southern warmth to every event. Led by Chef 'Train' Ward, our professional staff treats every gathering as if it were our own family celebration, serving with genuine care and pride."
                  images={teamImages}
                  onImageClick={handleImageClick}
                />
              )}
              
            </div>
          </div>
        </div>
      </section>
      
      <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
        <div ref={ctaRef} className={useAnimationClass(ctaVariant, ctaVisible)}>
          <GalleryCTA />
        </div>
      </div>
      
      <EnhancedImageModal images={allImages} selectedIndex={selectedImageIndex} onClose={handleCloseModal} />
    </div>
  );
};

export default PhotoGallery;
