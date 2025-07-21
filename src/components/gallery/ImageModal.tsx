
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

interface ImageModalProps {
  images: Image[];
  selectedIndex: number | null;
  onClose: () => void;
}

export const ImageModal = ({
  images,
  selectedIndex,
  onClose
}: ImageModalProps) => {
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
      
      if (event.key === 'ArrowLeft') {
        handlePrevious();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedIndex, currentIndex]);

  // Touch event handlers for swipe navigation
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

    // Reset touch positions
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
      <DialogContent className="max-w-4xl p-0 bg-transparent border-0 [&>button]:hidden">
        <DialogTitle className="sr-only">Gallery Image</DialogTitle>
        <DialogDescription className="sr-only">Full size view of gallery image</DialogDescription>
        <div className="relative">
          {/* Close button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute -top-12 right-0 text-white hover:text-white z-20 bg-red-600/80 hover:bg-red-700/90 border border-red-300/50 min-h-touch min-w-touch rounded-xl shadow-lg"
            onClick={onClose}
            aria-label="Close gallery"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
          </Button>
          
          {/* Image counter */}
          <div className="absolute -top-12 left-0 text-white text-sm z-10 bg-black/50 px-2 py-1 rounded">
            {currentIndex + 1} of {images.length}
          </div>
          
          {/* Navigation buttons */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:text-white z-10 backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/40 min-h-touch min-w-touch rounded-xl shadow-lg"
            onClick={handlePrevious}
            disabled={images.length <= 1}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:text-white z-10 backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/40 min-h-touch min-w-touch rounded-xl shadow-lg"
            onClick={handleNext}
            disabled={images.length <= 1}
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
          </Button>

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
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
              />
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 text-white bg-black/60 rounded-xl p-2 sm:p-3">
                <h3 className="font-elegant font-semibold text-sm sm:text-base md:text-lg">{currentImage.title}</h3>
                <p className="text-xs sm:text-sm text-white/90">{currentImage.description}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
