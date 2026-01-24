import { useState, useEffect } from "react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { ChevronDown, Play, Pause, Sparkles, Grid } from "lucide-react";
import { heroImages } from "@/data/heroImages";

interface ImmersiveMobileHeroProps {
  onScrollToGallery: () => void;
}

export const ImmersiveMobileHero = ({ 
  onScrollToGallery 
}: ImmersiveMobileHeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  
  const isMobile = useIsMobile();
  const currentImage = heroImages[currentIndex];
  
  const { ref: overlayRef, isVisible: overlayVisible, variant: overlayVariant } = useScrollAnimation({ 
    delay: 300, 
    variant: 'fade-up',
    mobile: { variant: 'slide-up', delay: 200 },
    desktop: { variant: 'fade-up', delay: 300 }
  });

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { label: string; variant: string }> = {
      'wedding': { label: 'Weddings', variant: 'bg-primary/10 text-primary border-primary/20' },
      'formal': { label: 'Formal Events', variant: 'bg-gold/10 text-gold-dark border-gold/20' },
      'corporate': { label: 'Corporate', variant: 'bg-navy/10 text-navy border-navy/20' },
      'desserts': { label: 'Desserts', variant: 'bg-platinum/10 text-platinum-dark border-platinum/30' },
      'buffet': { label: 'Buffet Service', variant: 'bg-accent/10 text-accent-foreground border-accent/20' },
      'family': { label: 'Family Events', variant: 'bg-cream/10 text-cream-foreground border-cream/20' },
    };
    return categoryMap[category] || { label: category, variant: 'bg-muted/10 text-muted-foreground border-muted/20' };
  };

  // Auto-advance story with 5-second intervals for better absorption
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % heroImages.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Touch handlers for mobile story progression
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const screenWidth = window.innerWidth;
    const tapX = touch.clientX;
    
    if (tapX < screenWidth / 3) {
      // Left third - previous image
      setCurrentIndex(prev => prev > 0 ? prev - 1 : heroImages.length - 1);
    } else if (tapX > (screenWidth * 2) / 3) {
      // Right third - next image
      setCurrentIndex(prev => (prev + 1) % heroImages.length);
    } else {
      // Center third - toggle details
      setShowDetails(prev => !prev);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  if (!currentImage) return null;

  return (
    <div className="relative h-[85vh] lg:h-screen overflow-hidden bg-gradient-primary">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0">
        <OptimizedImage
          src={currentImage.src}
          alt={currentImage.title}
          className="w-full h-full object-cover scale-105 transition-transform duration-700"
          containerClassName="w-full h-full"
          priority
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-navy-dark/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/60 via-transparent to-navy-dark/40" />
      </div>

      {/* Story Progress Indicators */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex gap-1">
          {heroImages.map((_, index) => (
            <div
              key={index}
              className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden"
            >
              <div
                className={`h-full bg-white transition-all duration-200 ${
                  index === currentIndex 
                    ? 'w-full' 
                    : index < currentIndex 
                      ? 'w-full' 
                      : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Touch Areas for Mobile Navigation */}
      {isMobile && (
        <div className="absolute inset-0 z-10 flex">
          <div className="flex-1" onTouchStart={handleTouchStart} />
          <div className="flex-1" onTouchStart={handleTouchStart} />
          <div className="flex-1" onTouchStart={handleTouchStart} />
        </div>
      )}

      {/* Play/Pause Control */}
      <div className="absolute top-6 right-4 z-20">
        <Button
          variant="glass-white"
          size="sm"
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>

      {/* Content Overlay */}
      <div 
        ref={overlayRef}
        className={`absolute inset-0 z-15 flex flex-col justify-end p-4 sm:p-6 lg:p-8 ${useAnimationClass(overlayVariant, overlayVisible)}`}
      >
        {/* Category Badge */}
        <div className="mb-4">
          <Badge className={`${getCategoryBadge(currentImage.category).variant} backdrop-blur-sm`}>
            <Sparkles className="h-3 w-3 mr-1" />
            {getCategoryBadge(currentImage.category).label}
          </Badge>
        </div>

        {/* Title and Description */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-white mb-2">
            {currentImage.title}
          </h1>
          <p className="text-white/80 text-sm sm:text-base lg:text-lg max-w-lg">
            {currentImage.description}
          </p>
        </div>

        {/* Action Button - Single CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onScrollToGallery}
            className="bg-primary text-white hover:bg-primary-dark shadow-lg gap-2"
          >
            <Grid className="h-4 w-4" />
            Browse Gallery
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onScrollToGallery}
            className="text-white/60 hover:text-white animate-bounce"
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Touch Instruction Overlay (shown briefly on mobile) */}
      {isMobile && showDetails && (
        <div className="absolute inset-0 z-30 bg-navy-dark/50 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center text-white">
            <h3 className="font-elegant text-lg mb-2">Story Navigation</h3>
            <p className="text-sm text-white/80 mb-4">
              Tap left/right to navigate • Tap center for details
            </p>
            <Button
              size="sm"
              variant="glass-white"
              onClick={() => setShowDetails(false)}
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};