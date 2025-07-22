
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface Image {
  src: string;
  title: string;
  description: string;
  category: string;
}

interface EnhancedImageModalProps {
  images: Image[];
  selectedIndex: number | null;
  onClose: () => void;
}

export const EnhancedImageModal = ({
  images,
  selectedIndex,
  onClose
}: EnhancedImageModalProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    if (selectedIndex !== null) {
      setCurrentIndex(selectedIndex);
      setIsZoomed(false);
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (selectedIndex === null) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          setIsZoomed(true);
          break;
        case '-':
          setIsZoomed(false);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedIndex, currentIndex]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.targetTouches[0].clientX;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    touchEndX.current = event.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      handleNext();
    }
    if (isRightSwipe && images.length > 1) {
      handlePrevious();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => prev === 0 ? images.length - 1 : prev - 1);
    setIsZoomed(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev === images.length - 1 ? 0 : prev + 1);
    setIsZoomed(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const currentImage = images[currentIndex];

  return (
    <Dialog open={selectedIndex !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl p-0 bg-black/95 border-0 [&>button]:hidden">
        <DialogTitle className="sr-only">Gallery Image</DialogTitle>
        <DialogDescription className="sr-only">Full size view of gallery image</DialogDescription>
        
        <div className="relative">
          {/* Desktop Controls */}
          <div className="hidden lg:flex absolute top-4 right-4 gap-2 z-20">
            <Button 
              variant="ghost" 
              size="icon" 
              className="!text-white hover:!text-white bg-black/70 hover:bg-black/90 border border-white/20"
              onClick={() => setIsZoomed(!isZoomed)}
              aria-label={isZoomed ? "Zoom out" : "Zoom in"}
            >
              {isZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="!text-white hover:!text-white bg-black/70 hover:bg-black/90 border border-white/20"
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="!text-white hover:!text-white bg-black/70 hover:bg-black/90 border border-white/20"
              onClick={onClose}
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Close Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden absolute -top-12 right-0 !text-white hover:!text-white z-20 bg-black/90 hover:bg-black/95 border border-white/40 min-h-touch min-w-touch rounded-xl shadow-xl"
            onClick={onClose}
            aria-label="Close gallery"
          >
            <X className="h-6 w-6" />
          </Button>
          
          {/* Image counter */}
          <div className="absolute -top-12 lg:top-4 left-0 lg:left-4 text-white text-sm z-20 bg-black/70 px-3 py-2 rounded-lg border border-white/20">
            {currentIndex + 1} of {images.length}
          </div>
          
          {/* Navigation buttons */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 !text-white hover:!text-white z-10 bg-black/70 hover:bg-black/90 border border-white/20 min-h-touch min-w-touch rounded-xl shadow-xl"
            onClick={handlePrevious}
            disabled={images.length <= 1}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 !text-white hover:!text-white z-10 bg-black/70 hover:bg-black/90 border border-white/20 min-h-touch min-w-touch rounded-xl shadow-xl"
            onClick={handleNext}
            disabled={images.length <= 1}
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Thumbnail Strip for Desktop */}
          <div className="hidden lg:block absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex gap-2 bg-black/70 p-2 rounded-lg border border-white/20 max-w-md overflow-x-auto">
              {images.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((image, index) => {
                const actualIndex = Math.max(0, currentIndex - 3) + index;
                return (
                  <button
                    key={actualIndex}
                    className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                      actualIndex === currentIndex 
                        ? 'border-white' 
                        : 'border-transparent hover:border-white/50'
                    }`}
                    onClick={() => setCurrentIndex(actualIndex)}
                  >
                    <img 
                      src={image.src} 
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {currentImage && (
            <div 
              className="transition-opacity duration-200"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img 
                src={currentImage.src} 
                alt={currentImage.title} 
                className={`w-full h-auto max-h-[80vh] object-contain rounded-xl transition-transform duration-300 ${
                  isZoomed ? 'scale-150 cursor-move' : 'cursor-pointer'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
              
              {/* Image Info */}
              <div className="absolute bottom-2 sm:bottom-4 lg:bottom-20 left-2 sm:left-4 right-2 sm:right-4 text-white bg-black/70 rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary/80 text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                    {currentImage.category}
                  </span>
                  <span className="text-xs text-white/70">
                    Press 'F' for fullscreen, '+/-' to zoom
                  </span>
                </div>
                <h3 className="font-elegant font-semibold text-sm sm:text-base md:text-lg mb-1">
                  {currentImage.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {currentImage.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
