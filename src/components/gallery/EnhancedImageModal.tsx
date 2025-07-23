
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2, Share2, Download, Info } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (selectedIndex !== null) {
      setCurrentIndex(selectedIndex);
      setIsZoomed(false);
      setZoomLevel(1);
      setShowInfo(false);
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
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'i':
        case 'I':
          setShowInfo(!showInfo);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedIndex, currentIndex, isZoomed, zoomLevel, showInfo]);

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
    setZoomLevel(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev === images.length - 1 ? 0 : prev + 1);
    setIsZoomed(false);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    const newZoomLevel = Math.max(zoomLevel - 0.5, 1);
    setZoomLevel(newZoomLevel);
    if (newZoomLevel === 1) {
      setIsZoomed(false);
    }
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentImage.title,
          text: currentImage.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage.src;
    link.download = `${currentImage.title}.jpg`;
    link.click();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      wedding: "bg-pink-500/90",
      formal: "bg-purple-500/90",
      corporate: "bg-blue-500/90",
      desserts: "bg-orange-500/90",
      grazing: "bg-green-500/90",
      team: "bg-indigo-500/90",
      buffet: "bg-red-500/90",
    };
    return colors[category] || "bg-gray-500/90";
  };

  const currentImage = images[currentIndex];

  return (
    <Dialog open={selectedIndex !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl p-0 bg-black/95 border-0 [&>button]:hidden">
        <DialogTitle className="sr-only">Gallery Image</DialogTitle>
        <DialogDescription className="sr-only">Full size view of gallery image</DialogDescription>
        
        <div className="relative">
          {/* Mobile Controls */}
          <div className="lg:hidden absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="!text-white hover:!text-white bg-black/70 hover:bg-black/90 border border-white/20 min-h-[44px]"
                onClick={() => setShowInfo(!showInfo)}
              >
                <Info className="h-4 w-4" />
              </Button>
              <div className="text-white text-sm bg-black/70 px-3 py-2 rounded-lg border border-white/20">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="!text-white hover:!text-white bg-black/70 hover:bg-black/90 border border-white/20 min-h-[44px]"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="!text-white hover:!text-white bg-black/70 hover:bg-black/90 border border-white/20 min-h-[44px]"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden lg:flex absolute top-4 right-4 gap-2 z-20">
            <Button 
              variant="ghost" 
              size="sm" 
              className="!text-white hover:!text-white bg-black/70 hover:bg-black/90 border border-white/20"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="!text-white hover:!text-white bg-black/70 hover:bg-black/90 border border-white/20"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="!text-white hover:!text-white bg-black/70 hover:bg-black/90 border border-white/20"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="!text-white hover:!text-white bg-black/70 hover:bg-black/90 border border-white/20"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="!text-white hover:!text-white bg-black/70 hover:bg-black/90 border border-white/20"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="!text-white hover:!text-white bg-black/70 hover:bg-black/90 border border-white/20"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop Image Counter */}
          <div className="hidden lg:block absolute top-4 left-4 text-white text-sm z-20 bg-black/70 px-3 py-2 rounded-lg border border-white/20">
            {currentIndex + 1} of {images.length}
          </div>
          
          {/* Navigation buttons */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 !text-white hover:!text-white z-10 bg-black/70 hover:bg-black/90 border border-white/20 min-h-[44px] min-w-[44px] rounded-xl"
            onClick={handlePrevious}
            disabled={images.length <= 1}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 !text-white hover:!text-white z-10 bg-black/70 hover:bg-black/90 border border-white/20 min-h-[44px] min-w-[44px] rounded-xl"
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
                    className={`w-12 h-12 rounded overflow-hidden border-2 transition-all min-w-[48px] ${
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
                  isZoomed ? `scale-[${zoomLevel}] cursor-move` : 'cursor-pointer'
                }`}
                onClick={() => isMobile ? setShowInfo(!showInfo) : setIsZoomed(!isZoomed)}
              />
              
              {/* Image Info */}
              <div className={`absolute bottom-2 sm:bottom-4 lg:bottom-20 left-2 sm:left-4 right-2 sm:right-4 text-white bg-black/70 rounded-xl p-3 sm:p-4 border border-white/20 transition-all duration-300 ${
                showInfo || !isMobile ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getCategoryColor(currentImage.category)} text-white text-xs`}>
                    {currentImage.category}
                  </Badge>
                  <div className="hidden sm:flex items-center gap-2 text-xs text-white/70">
                    <span>Press 'F' for fullscreen</span>
                    <span>•</span>
                    <span>'+/-' to zoom</span>
                    <span>•</span>
                    <span>Arrow keys to navigate</span>
                  </div>
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
