import { useState } from "react";
import { galleryImages } from "@/data/galleryImages";
import { ImmersiveMobileHero } from "@/components/gallery/ImmersiveMobileHero";
import { DiscoveryCategoryNav } from "@/components/gallery/DiscoveryCategoryNav";
import { StoryGalleryViewer } from "@/components/gallery/StoryGalleryViewer";
import { InteractiveImageGrid } from "@/components/gallery/InteractiveImageGrid";
import { GallerySearchInterface } from "@/components/gallery/GallerySearchInterface";
import { EnhancedImageModal } from "@/components/gallery/EnhancedImageModal";
import { GalleryCTA } from "@/components/gallery/GalleryCTA";
import { PageSection } from "@/components/ui/page-section";
import { ServiceMarquee } from "@/components/home/ServiceMarquee";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";

const AlternativeGallery = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'story' | 'grid' | 'search'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [qualityFilter, setQualityFilter] = useState(0);
  
  const isMobile = useIsMobile();
  
  const { ref: heroRef, isVisible: heroVisible, variant: heroVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'ios-spring', delay: 0 },
    desktop: { variant: 'elastic', delay: 0 }
  });
  
  const { ref: navRef, isVisible: navVisible, variant: navVariant } = useScrollAnimation({ 
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

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setViewMode('grid');
  };

  const handleStoryModeSelect = (category: string) => {
    setSelectedCategory(category);
    setViewMode('story');
  };

  const handleSearchModeSelect = () => {
    setViewMode('search');
  };

  // Filter images based on selection
  const getFilteredImages = () => {
    let filtered = galleryImages;
    
    if (selectedCategory) {
      filtered = filtered.filter(img => img.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(img => 
        img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (qualityFilter > 0) {
      filtered = filtered.filter(img => img.quality >= qualityFilter);
    }
    
    return filtered;
  };

  const filteredImages = getFilteredImages();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Service Marquee - Above Hero */}
      <ServiceMarquee />
      
      {/* Mobile-First Hero Section */}
      <PageSection pattern="a" skipToContentId="gallery-hero" className="py-0">
        <div ref={heroRef} className={useAnimationClass(heroVariant, heroVisible)}>
          <ImmersiveMobileHero 
            onScrollToGallery={() => {
              const gallerySection = document.querySelector('[data-section="discovery"]');
              gallerySection?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      </PageSection>
      
      {/* Brand Intro - Family Story */}
      <PageSection pattern="b" className="py-8 sm:py-12">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold mb-4">
            From Our Family Kitchen to Your Special Event
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            As a family-run catering company rooted in authentic Southern cooking, we take pride in bringing 
            people together around exceptional food. Every event we cater receives the same love and attention 
            we put into feeding our own family.
          </p>
        </div>
      </PageSection>
      
      {/* Discovery Navigation */}
      <PageSection pattern="a" withBorder>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div ref={navRef} className={useAnimationClass(navVariant, navVisible)}>
            <DiscoveryCategoryNav 
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              onStoryModeSelect={handleStoryModeSelect}
              onSearchModeSelect={handleSearchModeSelect}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>
        </div>
      </PageSection>
      
      {/* Dynamic Content Based on View Mode */}
      <PageSection pattern="c" withBorder>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div ref={contentRef} className={useAnimationClass(contentVariant, contentVisible)}>
            {viewMode === 'search' && (
              <GallerySearchInterface 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                qualityFilter={qualityFilter}
                setQualityFilter={setQualityFilter}
                images={filteredImages}
                onImageClick={handleImageClick}
              />
            )}
            
            {viewMode === 'story' && selectedCategory && (
              <StoryGalleryViewer 
                images={filteredImages}
                category={selectedCategory}
                onImageClick={handleImageClick}
                onCategoryChange={setSelectedCategory}
              />
            )}
            
            {viewMode === 'grid' && (
              <InteractiveImageGrid 
                images={filteredImages}
                onImageClick={handleImageClick}
                category={selectedCategory}
              />
            )}
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