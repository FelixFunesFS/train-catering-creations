import { useState } from "react";
import { Camera } from "lucide-react";
import { galleryImages } from "@/data/galleryImages";
import { galleryCategories } from "@/data/galleryCategories";
import { ImmersiveMobileHero } from "@/components/gallery/ImmersiveMobileHero";
import { CategoryCards } from "@/components/gallery/CategoryCards";
import { InteractiveImageGrid } from "@/components/gallery/InteractiveImageGrid";
import { EnhancedImageModal } from "@/components/gallery/EnhancedImageModal";
import { GalleryCTA } from "@/components/gallery/GalleryCTA";
import { PageSection } from "@/components/ui/page-section";
import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

const AlternativeGallery = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { ref: heroRef, isVisible: heroVisible, variant: heroVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'ios-spring', delay: 0 },
    desktop: { variant: 'elastic', delay: 0 }
  });
  
  const { ref: introRef, isVisible: introVisible, variant: introVariant } = useScrollAnimation({ 
    delay: 100, 
    variant: 'slide-up',
    mobile: { variant: 'medium', delay: 50 },
    desktop: { variant: 'ios-spring', delay: 100 }
  });
  
  const { ref: contentRef, isVisible: contentVisible, variant: contentVariant } = useScrollAnimation({ 
    delay: 200, 
    variant: 'ios-spring',
    mobile: { variant: 'medium', delay: 100 },
    desktop: { variant: 'elastic', delay: 200 }
  });

  const handleImageClick = (imageSrc: string) => {
    const index = galleryImages.findIndex(img => img.src === imageSrc);
    setSelectedImageIndex(index);
  };
  
  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  // Filter images based on selected category
  const getFilteredImages = () => {
    if (!selectedCategory) {
      return galleryImages;
    }
    
    // Find the category config
    const categoryConfig = galleryCategories.find(cat => cat.id === selectedCategory);
    
    if (categoryConfig?.filterIds) {
      // Combined category - filter by multiple IDs
      return galleryImages.filter(img => categoryConfig.filterIds!.includes(img.category));
    }
    
    // Single category - filter by exact match
    return galleryImages.filter(img => img.category === selectedCategory);
  };

  const filteredImages = getFilteredImages();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Mobile-First Hero Section - Full bleed, no wrapper padding */}
      <div id="gallery-hero" ref={heroRef} className={useAnimationClass(heroVariant, heroVisible)}>
        <ImmersiveMobileHero 
          onScrollToGallery={() => {
            const gallerySection = document.querySelector('[data-section="gallery-grid"]');
            gallerySection?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>
      
      {/* COMBINED: Brand Intro + Category Cards + Image Grid */}
      <PageSection pattern="b" className="py-8 sm:py-12" data-section="gallery-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Intro text - centered */}
          <div 
            ref={introRef}
            className={`max-w-3xl mx-auto text-center mb-8 sm:mb-10 lg:mb-12 ${useAnimationClass(introVariant, introVisible)}`}
          >
            {/* Badge + Icon */}
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Camera className="h-5 w-5 text-ruby" />
              <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
                Our Gallery
              </Badge>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold mb-3">
              From Our Family Kitchen to Your Special Event
            </h2>
            
            {/* Script subtitle */}
            <p className="text-xl sm:text-2xl font-script text-ruby font-medium mb-3">
              Memories in Every Bite
            </p>
            
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              As a family-run catering company rooted in authentic Southern cooking, we take pride in bringing 
              people together around exceptional food. Every event we cater receives the same love and attention 
              we put into feeding our own family.
            </p>
          </div>
          
          {/* Category Cards */}
          <CategoryCards 
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
          
          {/* Image Grid - embedded directly below cards */}
          <div ref={contentRef} className={`mt-8 sm:mt-10 lg:mt-12 ${useAnimationClass(contentVariant, contentVisible)}`}>
            <InteractiveImageGrid 
              images={filteredImages}
              onImageClick={handleImageClick}
              category={selectedCategory}
              showDiscoverHeader={false}
            />
          </div>
        </div>
      </PageSection>
      
      {/* CTA Section */}
      <GalleryCTA />
      
      <EnhancedImageModal 
        images={galleryImages} 
        selectedIndex={selectedImageIndex} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default AlternativeGallery;
