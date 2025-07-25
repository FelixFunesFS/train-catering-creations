import { useState } from "react";
import { galleryImages } from "@/data/galleryImages";
import { ImmersiveMobileHero } from "@/components/gallery/ImmersiveMobileHero";
import { DiscoveryCategoryNav } from "@/components/gallery/DiscoveryCategoryNav";
import { StoryGalleryViewer } from "@/components/gallery/StoryGalleryViewer";
import { InteractiveImageGrid } from "@/components/gallery/InteractiveImageGrid";
import { GallerySearchInterface } from "@/components/gallery/GallerySearchInterface";
import { EnhancedImageModal } from "@/components/gallery/EnhancedImageModal";
import { PageSection } from "@/components/ui/page-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";

const AlternativeGallery = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'story' | 'grid' | 'search'>('story');
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
      {/* Mobile-First Hero Section */}
      <PageSection pattern="a" skipToContentId="gallery-hero" className="py-0">
        <div ref={heroRef} className={useAnimationClass(heroVariant, heroVisible)}>
          <ImmersiveMobileHero 
            images={galleryImages}
            onImageClick={handleImageClick}
            onCategorySelect={handleStoryModeSelect}
          />
        </div>
      </PageSection>
      
      {/* Discovery Navigation */}
      <PageSection pattern="b" withBorder>
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
      
      <EnhancedImageModal 
        images={galleryImages} 
        selectedIndex={selectedImageIndex} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default AlternativeGallery;