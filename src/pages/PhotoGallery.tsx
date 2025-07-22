
import { useState } from "react";
import { galleryImages } from "@/data/galleryImages";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { GallerySection } from "@/components/gallery/GallerySection";
import { ImageModal } from "@/components/gallery/ImageModal";
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
  
  // Organize images by category and select best quality images
  const weddingImages = galleryImages.filter(img => img.category === "wedding").sort((a, b) => b.quality - a.quality);
  const formalImages = galleryImages.filter(img => img.category === "formal").sort((a, b) => b.quality - a.quality);
  const dessertImages = galleryImages.filter(img => img.category === "desserts").sort((a, b) => b.quality - a.quality);
  const buffetImages = galleryImages.filter(img => img.category === "buffet").sort((a, b) => b.quality - a.quality);
  
  // All images for modal navigation
  const allImages = [...weddingImages, ...formalImages, ...dessertImages, ...buffetImages];
  
  const handleImageClick = (imageSrc: string) => {
    const index = allImages.findIndex(img => img.src === imageSrc);
    setSelectedImageIndex(index);
  };
  
  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };
  
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header Section */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={headerRef} className={useAnimationClass(headerVariant, headerVisible)}>
            <GalleryHeader />
          </div>
        </div>
      </section>
      
      {/* Gallery Sections */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={sectionsRef} className={useAnimationClass(sectionsVariant, sectionsVisible)}>
            
            {/* Wedding Section */}
            {weddingImages.length > 0 && (
              <GallerySection
                title="Wedding Celebrations"
                description="From intimate ceremonies to grand receptions, we create unforgettable wedding experiences with elegant cuisine and impeccable service that makes your special day truly magical."
                heroImage={weddingImages[0]}
                images={weddingImages.slice(1)}
                onImageClick={handleImageClick}
              />
            )}
            
            {/* Formal Events Section */}
            {formalImages.length > 0 && (
              <GallerySection
                title="Formal & Black Tie Events"
                description="Sophisticated catering for corporate galas, military ceremonies, and upscale gatherings. Our refined presentation and premium service elevate every formal occasion."
                heroImage={formalImages[0]}
                images={formalImages.slice(1)}
                onImageClick={handleImageClick}
              />
            )}
            
            {/* Desserts Section */}
            {dessertImages.length > 0 && (
              <GallerySection
                title="Artisan Desserts & Sweet Treats"
                description="Exquisite dessert displays featuring custom cakes, elegant pastries, and beautifully crafted sweet treats that provide the perfect finale to any celebration."
                heroImage={dessertImages[0]}
                images={dessertImages.slice(1)}
                onImageClick={handleImageClick}
              />
            )}
            
            {/* Buffet Service Section */}
            {buffetImages.length > 0 && (
              <GallerySection
                title="Buffet Service & Large Events"
                description="Professional buffet service for large gatherings, featuring diverse menu options, elegant presentation, and seamless service that keeps your guests satisfied."
                heroImage={buffetImages[0]}
                images={buffetImages.slice(1)}
                onImageClick={handleImageClick}
              />
            )}
            
          </div>
        </div>
      </section>
      
      <div ref={ctaRef} className={useAnimationClass(ctaVariant, ctaVisible)}>
        <GalleryCTA />
      </div>
      
      <ImageModal images={allImages} selectedIndex={selectedImageIndex} onClose={handleCloseModal} />
    </div>
  );
};

export default PhotoGallery;
