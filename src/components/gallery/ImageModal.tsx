import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Share2, Heart, Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { GalleryImage } from "@/data/gallery/types";

// Sample testimonials for different categories
const testimonials: Record<string, string[]> = {
  wedding: [
    "The presentation was absolutely stunning! Our guests couldn't stop talking about how beautiful everything looked.",
    "Soul Train's Eatery made our special day perfect with their incredible attention to detail.",
    "The food was as beautiful as it was delicious. They truly understand how to make memories."
  ],
  corporate: [
    "Professional service that impressed all our clients. The quality speaks for itself.",
    "Their catering elevated our corporate event to something truly memorable.",
    "Exceptional presentation that perfectly matched our brand standards."
  ],
  formal: [
    "Elegant and sophisticated - exactly what we needed for our gala.",
    "The attention to detail in every dish was remarkable.",
    "They transformed our venue into something magical."
  ],
  family: [
    "Made our family gathering extra special with their warm, personal touch.",
    "The kids and adults all loved everything! Perfect for our reunion.",
    "Felt like home cooking, but elevated to restaurant quality."
  ],
  buffet: [
    "Amazing variety and everything stayed fresh throughout the entire event.",
    "The buffet setup was both beautiful and functional for our large group.",
    "Quality remained consistent from the first guest to the last."
  ],
  desserts: [
    "The desserts were almost too beautiful to eat - almost!",
    "Sweet perfection that ended our event on the highest note.",
    "Every bite was a little piece of heaven."
  ]
};

interface ImageModalProps {
  images: GalleryImage[];
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
  const [isLiked, setIsLiked] = useState(false);
  
  // Get a random testimonial for the current image category
  const getTestimonial = (category: string) => {
    const categoryTestimonials = testimonials[category] || testimonials.wedding;
    return categoryTestimonials[Math.floor(Math.random() * categoryTestimonials.length)];
  };

  const handleShare = async () => {
    if (navigator.share && currentImage) {
      try {
        await navigator.share({
          title: currentImage.title,
          text: currentImage.description,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
    }
  };

  return (
    <Dialog open={selectedIndex !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 bg-black/95 border-0 [&>button]:hidden overflow-hidden">
        <DialogTitle className="sr-only">Gallery Image</DialogTitle>
        <DialogDescription className="sr-only">Full size view of gallery image</DialogDescription>
        
        <div className="relative h-full">
          {/* Enhanced header bar */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-white">
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  {currentIndex + 1} of {images.length}
                </span>
                {currentImage?.quality && currentImage.quality >= 8 && (
                  <span className="text-xs bg-gradient-primary text-primary-foreground px-2 py-1 rounded-full font-semibold">
                    ✨ Featured
                  </span>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 rounded-full"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current text-red-400' : ''}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 rounded-full"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 rounded-full"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Navigation buttons */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-20 bg-black/30 hover:bg-black/50 min-h-touch min-w-touch rounded-full transition-all duration-200 hover:scale-110"
            onClick={handlePrevious}
            disabled={images.length <= 1}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-20 bg-black/30 hover:bg-black/50 min-h-touch min-w-touch rounded-full transition-all duration-200 hover:scale-110"
            onClick={handleNext}
            disabled={images.length <= 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {currentImage && (
            <div className="h-full flex flex-col lg:flex-row">
              {/* Image section */}
              <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <img 
                  src={currentImage.src} 
                  alt={currentImage.title} 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-opacity duration-300"
                />
              </div>
              
              {/* Enhanced info panel */}
              <div className="lg:w-80 xl:w-96 bg-gradient-to-t lg:bg-gradient-to-r from-black/90 to-black/70 backdrop-blur-sm p-6 sm:p-8 text-white flex flex-col justify-end lg:justify-center space-y-6">
                {/* Category badge */}
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {currentImage.category.replace('-', ' ')}
                  </span>
                </div>
                
                {/* Title and description */}
                <div className="space-y-3">
                  <h3 className="font-bold text-xl sm:text-2xl leading-tight">
                    {currentImage.title}
                  </h3>
                  <p className="text-white/90 text-base leading-relaxed">
                    {currentImage.description}
                  </p>
                </div>
                
                {/* Customer testimonial */}
                <div className="border-l-2 border-primary/50 pl-4 space-y-2">
                  <p className="text-white/80 italic text-sm leading-relaxed">
                    "{getTestimonial(currentImage.category)}"
                  </p>
                  <p className="text-white/60 text-xs">— Happy Client</p>
                </div>
                
                {/* CTA */}
                <div className="pt-4">
                  <a 
                    href="/request-quote" 
                    className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-6 py-3 rounded-full font-semibold text-sm hover:shadow-glow transition-all duration-300 hover:scale-105"
                    onClick={onClose}
                  >
                    Create Your Event
                    <Heart className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};