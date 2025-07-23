
import { useState, useEffect, useCallback } from "react";
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedFloatingImage } from "@/components/ui/optimized-floating-image";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, Grid3X3, LayoutGrid, Columns3, Play } from "lucide-react";

interface EnhancedGalleryGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
  viewMode?: "grid" | "masonry" | "featured" | "carousel";
  itemsPerPage?: number;
}

export const EnhancedGalleryGrid = ({ 
  images, 
  onImageClick, 
  viewMode = "masonry",
  itemsPerPage = 12
}: EnhancedGalleryGridProps) => {
  const [displayedImages, setDisplayedImages] = useState<GalleryImage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedView, setSelectedView] = useState(viewMode);
  const isMobile = useIsMobile();

  const loadMoreImages = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newImages = images.slice(startIndex, endIndex);
      
      setDisplayedImages(prev => [...prev, ...newImages]);
      setCurrentPage(prev => prev + 1);
      setIsLoading(false);
    }, 300);
  }, [currentPage, images, itemsPerPage, isLoading]);

  useEffect(() => {
    setDisplayedImages([]);
    setCurrentPage(1);
    setTimeout(() => {
      const initialImages = images.slice(0, itemsPerPage);
      setDisplayedImages(initialImages);
      setCurrentPage(2);
    }, 100);
  }, [images, itemsPerPage]);

  const getAspectRatio = (index: number): "aspect-square" | "aspect-[4/3]" | "aspect-[3/4]" | "aspect-[5/4]" | "aspect-[4/5]" => {
    const patterns: ("aspect-square" | "aspect-[4/3]" | "aspect-[3/4]" | "aspect-[5/4]" | "aspect-[4/5]")[] = [
      "aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[5/4]", "aspect-[4/3]"
    ];
    return patterns[index % patterns.length];
  };

  const getGridClasses = () => {
    switch (selectedView) {
      case "grid":
        return "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5";
      case "featured":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6";
      case "masonry":
        return "columns-1 xs:columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 sm:gap-4 md:gap-5 space-y-3 sm:space-y-4 md:space-y-5";
      default:
        return "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5";
    }
  };

  const ViewToggle = () => (
    <div className="flex justify-center gap-1 sm:gap-2 mb-6 sm:mb-8 flex-wrap">
      <Button
        variant={selectedView === "grid" ? "default" : "outline"}
        size="sm"
        onClick={() => setSelectedView("grid")}
        className="flex items-center gap-1 sm:gap-2 font-medium min-h-[44px] min-w-[44px]"
      >
        <Grid3X3 className="w-4 h-4" />
        <span className="hidden sm:inline">Grid</span>
      </Button>
      <Button
        variant={selectedView === "featured" ? "default" : "outline"}
        size="sm"
        onClick={() => setSelectedView("featured")}
        className="flex items-center gap-1 sm:gap-2 font-medium min-h-[44px] min-w-[44px]"
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">Featured</span>
      </Button>
      <Button
        variant={selectedView === "masonry" ? "default" : "outline"}
        size="sm"
        onClick={() => setSelectedView("masonry")}
        className="flex items-center gap-1 sm:gap-2 font-medium min-h-[44px] min-w-[44px]"
      >
        <Columns3 className="w-4 h-4" />
        <span className="hidden sm:inline">Masonry</span>
      </Button>
    </div>
  );

  const renderMasonryGrid = () => (
    <div className={getGridClasses()}>
      {displayedImages.map((image, index) => (
        <div 
          key={`masonry-${index}`}
          className="break-inside-avoid mb-3 sm:mb-4 md:mb-5"
        >
          <OptimizedFloatingImage
            src={image.src}
            alt={image.title}
            title={image.title}
            description={image.description}
            aspectRatio={getAspectRatio(index)}
            variant="medium"
            priority={index < 6}
            onImageClick={() => onImageClick(image.src)}
            className="w-full transform transition-all duration-300 hover:scale-[1.02]"
          />
        </div>
      ))}
    </div>
  );

  const renderRegularGrid = () => (
    <div className={getGridClasses()}>
      {displayedImages.map((image, index) => {
        const isFeatured = selectedView === "featured" && index % 7 === 0 && image.quality >= 8;
        
        return (
          <div 
            key={`grid-${index}`}
            className={isFeatured ? "sm:col-span-2 lg:col-span-1" : ""}
          >
            <OptimizedFloatingImage
              src={image.src}
              alt={image.title}
              title={image.title}
              description={image.description}
              aspectRatio={isFeatured ? "aspect-[4/3]" : getAspectRatio(index)}
              variant="medium"
              priority={index < 6}
              onImageClick={() => onImageClick(image.src)}
              className="w-full transform transition-all duration-300 hover:scale-[1.02]"
            />
          </div>
        );
      })}
    </div>
  );

  const hasMoreImages = displayedImages.length < images.length;

  return (
    <div className="w-full">
      <ViewToggle />
      
      {selectedView === "masonry" ? renderMasonryGrid() : renderRegularGrid()}

      {hasMoreImages && (
        <div className="text-center mt-8 sm:mt-10 lg:mt-12">
          <Button 
            variant="outline" 
            size="lg"
            onClick={loadMoreImages}
            disabled={isLoading}
            className="min-h-[44px] px-6 sm:px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              `Load More (${images.length - displayedImages.length} remaining)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
