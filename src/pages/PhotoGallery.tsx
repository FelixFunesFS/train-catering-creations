
import { useState, useMemo } from "react";
import { galleryImages } from "@/data/galleryImages";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { EnhancedImageModal } from "@/components/gallery/EnhancedImageModal";
import { GalleryCTA } from "@/components/gallery/GalleryCTA";
import { PageSection } from "@/components/ui/page-section";
import { EnhancedGalleryGrid } from "@/components/gallery/EnhancedGalleryGrid";
import { GalleryFilterBar } from "@/components/gallery/GalleryFilterBar";
import { MobileGalleryCarousel } from "@/components/gallery/MobileGalleryCarousel";
import { GalleryLoadingState } from "@/components/gallery/GalleryLoadingState";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";

const PhotoGallery = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "masonry" | "featured" | "carousel">("masonry");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  
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

  // Process and filter images
  const { filteredImages, categories } = useMemo(() => {
    // Create categories with counts
    const categoryMap = new Map<string, number>();
    galleryImages.forEach(image => {
      categoryMap.set(image.category, (categoryMap.get(image.category) || 0) + 1);
    });

    const categories = [
      { id: "all", name: "All", count: galleryImages.length },
      ...Array.from(categoryMap.entries()).map(([id, count]) => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        count
      }))
    ];

    // Filter images
    let filtered = galleryImages;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(image => image.category === selectedCategory);
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(image => 
        image.title.toLowerCase().includes(search) ||
        image.description.toLowerCase().includes(search) ||
        image.category.toLowerCase().includes(search)
      );
    }

    // Sort by quality for better visual hierarchy
    filtered.sort((a, b) => b.quality - a.quality);

    return { filteredImages: filtered, categories };
  }, [selectedCategory, searchTerm]);
  
  const handleImageClick = (imageSrc: string) => {
    const index = filteredImages.findIndex(img => img.src === imageSrc);
    setSelectedImageIndex(index);
  };
  
  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
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
            {/* Filter Bar */}
            <GalleryFilterBar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              onSearchChange={handleSearchChange}
              searchTerm={searchTerm}
            />

            {/* Results Info */}
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-sm sm:text-base text-muted-foreground">
                {searchTerm ? (
                  <>
                    Showing {filteredImages.length} result{filteredImages.length !== 1 ? 's' : ''} for "{searchTerm}"
                    {selectedCategory !== "all" && ` in ${selectedCategory}`}
                  </>
                ) : selectedCategory !== "all" ? (
                  <>Showing {filteredImages.length} {selectedCategory} image{filteredImages.length !== 1 ? 's' : ''}</>
                ) : (
                  <>Showing all {filteredImages.length} images</>
                )}
              </p>
            </div>

            {/* Gallery Content */}
            {isLoading ? (
              <GalleryLoadingState viewMode={viewMode} />
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <p className="text-lg text-muted-foreground mb-4">No images found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <>
                {/* Mobile Carousel View */}
                {isMobile && viewMode === "carousel" ? (
                  <MobileGalleryCarousel
                    images={filteredImages}
                    onImageClick={handleImageClick}
                  />
                ) : (
                  /* Enhanced Grid View */
                  <EnhancedGalleryGrid
                    images={filteredImages}
                    onImageClick={handleImageClick}
                    viewMode={viewMode}
                    itemsPerPage={isMobile ? 8 : 12}
                  />
                )}
              </>
            )}
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
        images={filteredImages} 
        selectedIndex={selectedImageIndex} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default PhotoGallery;
