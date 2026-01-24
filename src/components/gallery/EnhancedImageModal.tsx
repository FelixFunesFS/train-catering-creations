import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    if (selectedIndex !== null) {
      setCurrentIndex(selectedIndex);
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
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev === images.length - 1 ? 0 : prev + 1);
  };

  const currentImage = images[currentIndex];

  return (
    <Dialog open={selectedIndex !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-4 sm:p-6 bg-black/95 border-0 [&>button]:hidden flex flex-col max-h-[95vh]">
        <DialogTitle className="sr-only">Gallery Image</DialogTitle>
        <DialogDescription className="sr-only">Full size view of gallery image</DialogDescription>
        
        {/* Top bar: counter + close */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-white/80 text-sm sm:text-base font-medium">
            {currentIndex + 1} of {images.length}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-white hover:bg-white/10 h-10 w-10 p-0"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Image with nav arrows */}
        {currentImage && (
          <div 
            className="relative flex-1 flex items-center justify-center min-h-0"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Previous button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12 p-0 rounded-full"
              onClick={handlePrevious}
              disabled={images.length <= 1}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
            </Button>

            {/* Image */}
            <img 
              src={currentImage.src} 
              alt={currentImage.title} 
              className="max-w-full max-h-[60vh] sm:max-h-[65vh] object-contain rounded-lg"
            />

            {/* Next button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12 p-0 rounded-full"
              onClick={handleNext}
              disabled={images.length <= 1}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
            </Button>
          </div>
        )}

        {/* Info below image */}
        {currentImage && (
          <div className="mt-4 text-center px-2 sm:px-8">
            <h3 className="font-elegant font-semibold text-white text-base sm:text-lg mb-1">
              {currentImage.title}
            </h3>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed line-clamp-2">
              {currentImage.description}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
