
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
  
  // Organize images by category and quality
  const weddingImages = galleryImages.filter(img => img.category === "wedding").sort((a, b) => b.quality - a.quality);
  const formalImages = galleryImages.filter(img => img.category === "formal").sort((a, b) => b.quality - a.quality);
  const dessertImages = galleryImages.filter(img => img.category === "desserts").sort((a, b) => b.quality - a.quality);
  const buffetImages = galleryImages.filter(img => img.category === "buffet").sort((a, b) => b.quality - a.quality);
  const teamImages = galleryImages.filter(img => img.category === "team").sort((a, b) => b.quality - a.quality);
  const signatureDishesImages = galleryImages.filter(img => img.category === "signature").sort((a, b) => b.quality - a.quality);
  const grazingImages = galleryImages.filter(img => img.category === "grazing").sort((a, b) => b.quality - a.quality);
  const bbqImages = galleryImages.filter(img => img.category === "bbq").sort((a, b) => b.quality - a.quality);
  const familyImages = galleryImages.filter(img => img.category === "family").sort((a, b) => b.quality - a.quality);
  
  const allImages = [...weddingImages, ...formalImages, ...dessertImages, ...buffetImages, ...teamImages, ...signatureDishesImages, ...grazingImages, ...bbqImages, ...familyImages];
  
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
                  title="Wedding Celebrations"
                  description="From intimate ceremonies to grand receptions, we create unforgettable wedding experiences with elegant cuisine and impeccable service that makes your special day truly magical."
                  images={weddingImages}
                  onImageClick={handleImageClick}
                />
              )}
              
              {/* Corporate & Formal Events */}
              {formalImages.length > 0 && (
                <MobileGallerySection
                  title="Corporate & Formal Events"
                  description="Sophisticated catering for business galas, military ceremonies, and upscale gatherings. Our refined presentation and premium service elevate every formal occasion."
                  images={formalImages}
                  onImageClick={handleImageClick}
                />
              )}
              
              {/* Desserts & Sweet Creations */}
              {dessertImages.length > 0 && (
                <MobileGallerySection
                  title="Desserts & Sweet Creations"
                  description="Exquisite dessert displays featuring custom cakes, elegant pastries, and beautifully crafted sweet treats that provide the perfect finale to any celebration."
                  images={dessertImages}
                  onImageClick={handleImageClick}
                />
              )}
              
              {/* Buffet & Large Event Service */}
              {buffetImages.length > 0 && (
                <MobileGallerySection
                  title="Buffet & Large Event Service"
                  description="Professional buffet service for large gatherings, featuring diverse menu options, elegant presentation, and seamless service that keeps your guests satisfied."
                  images={buffetImages}
                  onImageClick={handleImageClick}
                />
              )}
              
              {/* Our Team in Action */}
              {teamImages.length > 0 && (
                <MobileGallerySection
                  title="Our Team in Action"
                  description="Meet our professional catering team in action. From setup to service, our skilled staff ensures every event runs smoothly with attention to detail and exceptional hospitality."
                  images={teamImages}
                  onImageClick={handleImageClick}
                />
              )}
              
              {/* Signature Dishes & Culinary Art */}
              {signatureDishesImages.length > 0 && (
                <MobileGallerySection
                  title="Signature Dishes & Culinary Art"
                  description="Discover our most celebrated culinary creations. Each dish is crafted with premium ingredients and artistic presentation that showcases our commitment to culinary excellence."
                  images={signatureDishesImages}
                  onImageClick={handleImageClick}
                />
              )}
              
              {/* BBQ & Outdoor Events */}
              {bbqImages.length > 0 && (
                <MobileGallerySection
                  title="BBQ & Outdoor Events"
                  description="Casual outdoor catering featuring authentic BBQ flavors and rustic presentation. Perfect for outdoor gatherings, family reunions, and relaxed celebrations."
                  images={bbqImages}
                  onImageClick={handleImageClick}
                />
              )}
              
              {/* Grazing Tables & Appetizers */}
              {grazingImages.length > 0 && (
                <MobileGallerySection
                  title="Grazing Tables & Appetizers"
                  description="Elegant grazing displays and sophisticated appetizer presentations that create memorable first impressions and encourage social interaction among your guests."
                  images={grazingImages}
                  onImageClick={handleImageClick}
                />
              )}
              
              {/* Family Celebrations */}
              {familyImages.length > 0 && (
                <MobileGallerySection
                  title="Family Celebrations"
                  description="Intimate family gatherings and milestone celebrations. We understand the importance of family traditions and create warm, welcoming environments for your special moments."
                  images={familyImages}
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
