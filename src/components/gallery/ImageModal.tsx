import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

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
          {/* Image counter */}
          <div className="absolute -top-12 left-0 text-white text-sm z-10">
            {currentIndex + 1} of {images.length}
          </div>
          
          {/* Navigation buttons */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/20 hover:bg-black/40"
            onClick={handlePrevious}
            disabled={images.length <= 1}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/20 hover:bg-black/40"
            onClick={handleNext}
            disabled={images.length <= 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {currentImage && (
            <div className="transition-opacity duration-200">
              <img 
                src={currentImage.src} 
                alt={currentImage.title} 
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <div className="absolute bottom-4 left-4 right-4 text-white bg-black/50 rounded-lg p-3">
                <h3 className="font-semibold text-lg">{currentImage.title}</h3>
                <p className="text-sm text-white/90">{currentImage.description}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};