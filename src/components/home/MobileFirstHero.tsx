import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { UtensilsCrossed, Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const heroImages = [
  {
    src: "/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png",
    alt: "Rustic wedding venue with chandeliers and elegant dining setup",
    title: "Wedding Excellence"
  },
  {
    src: "/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png", 
    alt: "Elegant venue setup with floral arrangements",
    title: "Formal Events"
  },
  {
    src: "/lovable-uploads/531de58a-4283-4d7c-882c-a78b6cdc97c0.png",
    alt: "Professional patriotic buffet with chafing dishes",
    title: "Corporate Catering"
  },
  {
    src: "/lovable-uploads/a68ac24e-cf0d-4941-9059-568c9b92bebf.png",
    alt: "Grand banquet hall with gold accents and formal table settings",
    title: "Luxury Events"
  }
];

export const MobileFirstHero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageLoadStatus, setImageLoadStatus] = useState<boolean[]>(new Array(heroImages.length).fill(false));
  const [announceSlideChange, setAnnounceSlideChange] = useState("");
  const isMobile = useIsMobile();

  // Handle image load status for performance optimization
  const handleImageLoad = useCallback((index: number) => {
    setImageLoadStatus(prev => {
      const newStatus = [...prev];
      newStatus[index] = true;
      return newStatus;
    });
  }, []);

  // Auto-advance carousel with accessibility announcements
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const newIndex = (prev + 1) % heroImages.length;
        setAnnounceSlideChange(`Now showing ${heroImages[newIndex].title}`);
        return newIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Clear announcement after screen reader reads it
  useEffect(() => {
    if (announceSlideChange) {
      const timer = setTimeout(() => setAnnounceSlideChange(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [announceSlideChange]);

  const goToSlide = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setIsAutoPlaying(false);
    setAnnounceSlideChange(`Switched to ${heroImages[index].title}`);
    // Resume auto-play after user interaction
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  const nextSlide = useCallback(() => {
    const newIndex = (currentImageIndex + 1) % heroImages.length;
    setCurrentImageIndex(newIndex);
    setIsAutoPlaying(false);
    setAnnounceSlideChange(`Next slide: ${heroImages[newIndex].title}`);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [currentImageIndex]);

  const prevSlide = useCallback(() => {
    const newIndex = (currentImageIndex - 1 + heroImages.length) % heroImages.length;
    setCurrentImageIndex(newIndex);
    setIsAutoPlaying(false);
    setAnnounceSlideChange(`Previous slide: ${heroImages[newIndex].title}`);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [currentImageIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextSlide();
      } else if (event.key === ' ' || event.key === 'Escape') {
        event.preventDefault();
        setIsAutoPlaying(!isAutoPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isAutoPlaying]);

  return (
    <section 
      className="relative min-h-screen w-full overflow-hidden"
      role="banner"
      aria-label="Hero section with catering gallery"
    >
      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announceSlideChange}
      </div>

      {/* Auto-play status indicator for screen readers */}
      <div className="sr-only" aria-live="polite">
        Carousel is {isAutoPlaying ? 'auto-playing' : 'paused'}. Press spacebar to toggle auto-play.
      </div>

      {/* Full Width Hero Background */}
      <div className="relative h-screen w-full">
        {/* Background Image Carousel */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={index !== currentImageIndex}
          >
            <OptimizedImage
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              priority={index === 0}
              containerClassName="absolute inset-0"
              onImageLoad={() => handleImageLoad(index)}
            />
          </div>
        ))}
        
        {/* Enhanced Gradient Overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        
        {/* Navigation Arrows - Visible on all screen sizes */}
        <button
          onClick={prevSlide}
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 p-3 lg:p-4 min-w-[44px] min-h-[44px] rounded-full bg-black/40 border-2 border-white/40 text-white hover:bg-black/60 hover:border-white/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          aria-label={`Previous image: ${heroImages[(currentImageIndex - 1 + heroImages.length) % heroImages.length].title}`}
          type="button"
        >
          <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" aria-hidden="true" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 p-3 lg:p-4 min-w-[44px] min-h-[44px] rounded-full bg-black/40 border-2 border-white/40 text-white hover:bg-black/60 hover:border-white/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          aria-label={`Next image: ${heroImages[(currentImageIndex + 1) % heroImages.length].title}`}
          type="button"
        >
          <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" aria-hidden="true" />
        </button>

        {/* Centered Content */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Brand Icons - Mobile and Tablet */}
            <div className="flex items-center justify-center gap-4 mb-6 lg:mb-8 lg:hidden">
              <div className="p-3 rounded-full bg-white/15 border border-white/25">
                <UtensilsCrossed className="h-5 w-5 text-white" aria-hidden="true" />
                <span className="sr-only">Quality catering</span>
              </div>
              <div className="p-3 rounded-full bg-white/15 border border-white/25">
                <Heart className="h-5 w-5 text-white" aria-hidden="true" />
                <span className="sr-only">Made with love</span>
              </div>
              <div className="p-3 rounded-full bg-white/15 border border-white/25">
                <Star className="h-5 w-5 text-white" aria-hidden="true" />
                <span className="sr-only">Excellence</span>
              </div>
            </div>

            {/* Logo - Desktop Only */}
            <div className="hidden lg:flex justify-center mb-8">
              <OptimizedImage
                src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png"
                alt="Soul Train's Eatery Logo"
                className="w-16 h-16 xl:w-20 xl:h-20 object-contain hover:scale-110 transition-transform duration-300"
                priority={true}
                aspectRatio="aspect-square"
              />
            </div>

            {/* Main Content */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl border border-white/25 max-w-5xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-elegant font-bold text-white leading-tight mb-4 lg:mb-6">
                Exquisite Catering Excellence
              </h1>
              
              <div className="w-20 sm:w-24 lg:w-32 h-0.5 lg:h-1 bg-gradient-to-r from-white via-white/80 to-white mx-auto mb-4 lg:mb-6 rounded-full" />
              
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-white/95 font-clean leading-relaxed mb-6 lg:mb-8 max-w-3xl mx-auto">
                Where culinary artistry meets Southern hospitality in Charleston's most distinguished catering experience
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 lg:gap-6 max-w-md mx-auto">
                <Button 
                  asChild 
                  size="lg"
                  className="w-full sm:min-w-[180px] bg-primary hover:bg-primary/90 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  <Link to="/request-quote#page-header">
                    Request Quote
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:min-w-[180px] cta-white-high-contrast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  <Link to="/gallery#page-header">
                    View Gallery
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dot Indicators - Bottom Center */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div 
            className="flex justify-center space-x-2"
            role="tablist"
            aria-label="Image navigation"
          >
            {heroImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                  index === currentImageIndex 
                    ? 'bg-white/20 rounded-full' 
                    : 'bg-transparent'
                }`}
                role="tab"
                aria-selected={index === currentImageIndex}
                aria-label={`View ${image.title}`}
                type="button"
              >
                <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-white w-6 lg:w-8' 
                    : 'bg-white/50 hover:bg-white/70'
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Scroll Indicator - Desktop Only */}
        <div className="hidden lg:block absolute bottom-8 right-8 z-20">
          <div className="flex flex-col items-center text-white/70 animate-bounce">
            <span className="text-sm font-clean mb-2">Scroll</span>
            <div className="w-0.5 h-8 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};