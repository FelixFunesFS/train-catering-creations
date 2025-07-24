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

      {/* Mobile-First Carousel (< 768px) */}
      <div className="md:hidden">
        {/* Image Carousel */}
        <div 
          className="relative h-screen w-full"
          role="region"
          aria-label="Image carousel"
          aria-describedby="carousel-instructions"
        >
          <div id="carousel-instructions" className="sr-only">
            Use arrow keys to navigate between images, spacebar to pause auto-play
          </div>
          
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
          
          {/* Touch-friendly Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-3 min-w-[44px] min-h-[44px] rounded-full bg-black/40 border-2 border-white/40 text-white hover:bg-black/60 hover:border-white/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label={`Previous image: ${heroImages[(currentImageIndex - 1 + heroImages.length) % heroImages.length].title}`}
            type="button"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-3 min-w-[44px] min-h-[44px] rounded-full bg-black/40 border-2 border-white/40 text-white hover:bg-black/60 hover:border-white/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label={`Next image: ${heroImages[(currentImageIndex + 1) % heroImages.length].title}`}
            type="button"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Content Overlay */}
          <div className="absolute inset-0 z-10 flex flex-col">
            {/* Top Brand Section */}
            <div className="flex-none pt-6 sm:pt-8">
              <div className="px-4 sm:px-6">
                {/* Mobile Icons */}
                <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
                  <div className="p-2 sm:p-3 rounded-full bg-white/15 border border-white/25">
                    <UtensilsCrossed className="h-4 w-4 sm:h-5 sm:w-5 text-white" aria-hidden="true" />
                    <span className="sr-only">Quality catering</span>
                  </div>
                  <div className="p-2 sm:p-3 rounded-full bg-white/15 border border-white/25">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white" aria-hidden="true" />
                    <span className="sr-only">Made with love</span>
                  </div>
                  <div className="p-2 sm:p-3 rounded-full bg-white/15 border border-white/25">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-white" aria-hidden="true" />
                    <span className="sr-only">Excellence</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Centered */}
            <div className="flex-1 flex items-center">
              <div className="px-4 sm:px-6 w-full">
                <div className="text-center max-w-sm sm:max-w-lg mx-auto">
                  {/* Content Card */}
                  <div className="bg-black/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/25">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-clean font-bold text-white leading-tight mb-3 sm:mb-4">
                      Charleston's Premier Catering Experience
                    </h1>
                    
                    <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-white via-white/80 to-white mx-auto mb-3 sm:mb-4 rounded-full" />
                    
                    <p className="text-base sm:text-lg text-white/95 font-clean leading-relaxed mb-4 sm:mb-6">
                      Where every bite is made with love and served with soul!
                    </p>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                      <Button 
                        asChild 
                        className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-primary hover:bg-primary/90 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                      >
                        <Link to="/request-quote#page-header">
                          Get Your Quote
                        </Link>
                      </Button>
                      
                      <Button 
                        asChild 
                        variant="outline" 
                        className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold cta-white-high-contrast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                      >
                        <Link to="/gallery#page-header">
                          View Gallery
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dot Indicators */}
            <div className="flex-none pb-6 sm:pb-8">
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
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-white w-6' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet Layout (768px-1024px) */}
      <div className="hidden md:block lg:hidden">
        <div className="relative h-screen w-full grid grid-cols-2" role="region" aria-label="Tablet hero layout">
          {/* Left Side - Main Image */}
          <div className="relative">
            <OptimizedImage
              src={heroImages[currentImageIndex].src}
              alt={heroImages[currentImageIndex].alt}
              className="w-full h-full object-cover"
              priority={true}
              containerClassName="absolute inset-0"
              onImageLoad={() => handleImageLoad(currentImageIndex)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-black/40" />
          </div>

          {/* Right Side - Content */}
          <div className="relative bg-gradient-to-b from-black/70 to-black/85 flex items-center">
            <div className="p-6 xl:p-8 w-full">
              <div className="text-center">
                <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-clean font-bold text-white leading-tight mb-4 xl:mb-6">
                  Charleston's Premier Catering Experience
                </h1>
                
                <div className="w-20 xl:w-24 h-0.5 xl:h-1 bg-gradient-to-r from-white via-white/80 to-white mx-auto mb-4 xl:mb-6 rounded-full" />
                
                <p className="text-lg xl:text-xl text-white/95 font-clean leading-relaxed mb-6 xl:mb-8">
                  Where every bite is made with love and served with soul!
                </p>

                <div className="flex flex-col gap-3 xl:gap-4">
                  <Button 
                    asChild 
                    size="lg" 
                    className="w-full bg-primary hover:bg-primary/90 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    <Link to="/request-quote#page-header">
                      Request Quote
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="w-full cta-white-high-contrast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    <Link to="/gallery#page-header">
                      View Gallery
                    </Link>
                  </Button>
                </div>

                {/* Image Navigation */}
                <div 
                  className="flex justify-center space-x-2 mt-6 xl:mt-8"
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
                      <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white w-8' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout (> 1024px) */}
      <div className="hidden lg:block">
        <div className="relative h-screen w-full" role="region" aria-label="Desktop hero layout">
          {/* Background Image */}
          <OptimizedImage
            src={heroImages[currentImageIndex].src}
            alt={heroImages[currentImageIndex].alt}
            className="w-full h-full object-cover"
            priority={true}
            containerClassName="absolute inset-0"
            onImageLoad={() => handleImageLoad(currentImageIndex)}
          />
          
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35" />

          <div className="relative z-10 h-full flex">
            {/* Left Content */}
            <div className="flex-1 flex items-center">
              <div className="max-w-2xl mx-auto px-8 xl:px-12">
                <div className="bg-black/25 backdrop-blur-sm rounded-3xl p-8 xl:p-12 shadow-2xl border border-white/25">
                  <div className="flex justify-center mb-6">
                    <OptimizedImage
                      src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png"
                      alt="Soul Train's Eatery Logo"
                      className="w-14 h-14 xl:w-16 xl:h-16 object-contain hover:scale-110 transition-transform duration-300"
                      priority={true}
                      aspectRatio="aspect-square"
                    />
                  </div>

                  <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-clean font-bold text-white leading-tight mb-4 xl:mb-6 text-center">
                    Charleston's Premier Catering Experience
                  </h1>
                  
                  <div className="w-24 xl:w-32 h-0.5 xl:h-1 bg-gradient-to-r from-white via-white/80 to-white mx-auto mb-4 xl:mb-6 rounded-full" />
                  
                  <p className="text-xl xl:text-2xl 2xl:text-3xl text-white/95 font-clean leading-relaxed mb-6 xl:mb-8 text-center">
                    Where every bite is made with love and served with soul!
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center gap-4 xl:gap-6">
                    <Button 
                      asChild 
                      size="lg" 
                      className="min-w-[160px] xl:min-w-[180px] bg-primary hover:bg-primary/90 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    >
                      <Link to="/request-quote#page-header">
                        Request Quote
                      </Link>
                    </Button>
                    
                    <Button 
                      asChild 
                      variant="outline" 
                      size="lg" 
                      className="min-w-[160px] xl:min-w-[180px] cta-white-high-contrast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    >
                      <Link to="/gallery#page-header">
                        View Gallery
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image Gallery */}
            <div className="w-72 xl:w-80 2xl:w-96 p-6 xl:p-8 flex items-center">
              <div className="w-full">
                <div className="grid grid-cols-2 gap-3 xl:gap-4">
                  {heroImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`relative group overflow-hidden rounded-lg xl:rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                        index === currentImageIndex 
                          ? 'ring-2 ring-white scale-105' 
                          : 'hover:scale-105 hover:ring-1 hover:ring-white/50'
                      }`}
                      aria-label={`View ${image.title}`}
                      type="button"
                    >
                      <OptimizedImage
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-28 xl:h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                        aspectRatio="aspect-[4/3]"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs xl:text-sm font-medium truncate">
                          {image.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Navigation Dots */}
                <div 
                  className="flex justify-center space-x-2 mt-4 xl:mt-6"
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
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white w-6' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};