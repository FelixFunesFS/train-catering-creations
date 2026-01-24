import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, ChevronDown, Heart, Star, Phone, Calendar, ArrowLeft, ArrowRight, Award } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useHeroVisibility } from "@/contexts/HeroVisibilityContext";
import { Link } from "react-router-dom";
interface HeroImage {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
}
export const SplitHero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const {
    setIsHeroVisible
  } = useHeroVisibility();
  const heroSentinelRef = useRef<HTMLDivElement>(null);
  const {
    ref: visualRef,
    isVisible: visualVisible
  } = useScrollAnimation({
    variant: 'scale-fade',
    delay: 0
  });
  const {
    ref: contentRef,
    isVisible: contentVisible
  } = useScrollAnimation({
    variant: 'fade-up',
    delay: 300
  });
  const visualAnimationClass = useAnimationClass('scale-fade', visualVisible);
  const contentAnimationClass = useAnimationClass('fade-up', contentVisible);

  // Intersection observer for hero visibility (controls MobileActionBar)
  useEffect(() => {
    const sentinel = heroSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsHeroVisible(entry.isIntersecting);
    }, {
      threshold: 0,
      rootMargin: '0px'
    });
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      // Reset to not visible when unmounting (leaving home page)
      setIsHeroVisible(false);
    };
  }, [setIsHeroVisible]);
  const heroImages: HeroImage[] = [{
    src: "/lovable-uploads/eb77404f-369f-484f-a9ce-786b7f1ddc94.png",
    alt: "Professional catering setup with chafing dishes and elegant floral arrangements",
    title: "Artisan Creations",
    subtitle: "Every Detail Matters",
    category: "culinary",
    description: "From our signature charcuterie boards to custom wedding cakes, each dish is crafted with precision and passion."
  }, {
    src: "/lovable-uploads/c6c2df94-6625-460e-a5a1-b75dd8c362ab.png",
    alt: "Elegant appetizer spread with tiered displays",
    title: "Award-Winning Catering",
    subtitle: "20+ Years of Culinary Excellence",
    category: "service",
    description: "Chef Train and Tanya Ward combine decades of experience with family traditions to create memorable dining experiences."
  }, {
    src: "/lovable-uploads/e3c0d1ae-fb6a-4700-8007-a8c8c8136e57.png",
    alt: "Elegant event space with formal dining setup",
    title: "Unforgettable Celebrations",
    subtitle: "Crafted with Soul, Seasoned with Love",
    category: "wedding",
    description: "Since 2017, Charleston's Lowcountry families have trusted Soul Train's Eatery to bring authentic Southern flavors to their most cherished moments."
  }];

  // Auto-advance carousel
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, heroImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'Escape':
          setIsPlaying(false);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }
  };
  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % heroImages.length);
  };
  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + heroImages.length) % heroImages.length);
  };
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  const handleScrollToDiscover = () => {
    const nextSection = document.querySelector('#featured-venue');
    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  const getCategoryBadge = (category: string) => {
    const badges = {
      featured: {
        label: "Featured Venue",
        variant: "default" as const
      },
      wedding: {
        label: "Wedding Excellence",
        variant: "secondary" as const
      },
      service: {
        label: "Professional Service",
        variant: "outline" as const
      },
      culinary: {
        label: "Culinary Artistry",
        variant: "default" as const
      }
    };
    return badges[category as keyof typeof badges] || badges.featured;
  };
  const currentImage = heroImages[currentIndex];
  const badge = getCategoryBadge(currentImage.category);

  // Dynamic object positioning based on image index
  const getImageObjectPosition = (index: number) => {
    // For the Award-Winning Catering image (index 1), show more of the center-left
    if (index === 1) {
      return "object-left-center";
    }
    return "object-center";
  };

  // Mobile/Tablet Layout (Overlay content on image)
  if (isMobile) {
    return <section className="relative h-screen overflow-hidden bg-black" role="main" aria-label="Hero section with image carousel">
        {/* Full Screen Visual Area */}
        <div ref={visualRef} className={`relative h-full overflow-hidden ${visualAnimationClass}`} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} role="region" aria-label="Image carousel">
          {/* Progress Indicators - Centered at top */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-1">
            {heroImages.map((_, index) => <button key={index} onClick={() => setCurrentIndex(index)} className="min-w-[24px] min-h-[24px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20" aria-label={`Go to slide ${index + 1} of ${heroImages.length}`} aria-current={index === currentIndex ? 'true' : 'false'}>
                <span className={`h-1 rounded-full transition-all duration-500 ${index === currentIndex ? 'w-8 bg-white' : 'w-3 bg-white/40'}`} />
              </button>)}
          </div>

          {/* Compact Trust Marquee */}
          <div className="absolute top-12 left-0 right-0 z-20 overflow-hidden">
            <div className="flex items-center justify-center gap-4 px-4 py-2 bg-black/40 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-xs text-white/90">
                <Star className="h-3 w-3 text-gold fill-gold" />
                <span>500+ Events</span>
              </div>
              <span className="text-white/40">•</span>
              <div className="flex items-center gap-1.5 text-xs text-white/90">
                <Award className="h-3 w-3 text-gold" />
                <span>5-Star Rated</span>
              </div>
              <span className="text-white/40">•</span>
              <div className="flex items-center gap-1.5 text-xs text-white/90">
                <Heart className="h-3 w-3 text-gold" />
                <span>Family-Owned</span>
              </div>
            </div>
          </div>

          {/* Full Screen Background Image */}
          <OptimizedImage src={currentImage.src} alt={currentImage.alt} className={`w-full h-full object-cover ${getImageObjectPosition(currentIndex)} transition-transform duration-700`} containerClassName="h-full" priority />
          
          {/* Gradient Overlay for Content Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Content Overlay - Positioned Up 20% */}
        <div ref={contentRef} className={`absolute inset-x-0 bottom-[20%] z-20 p-4 sm:p-6 ${contentAnimationClass}`} role="region" aria-label="Content section">
          <div className="max-w-md mx-auto w-full space-y-3 sm:space-y-4">
            {/* Category Badge */}
            <Badge variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/30 text-sm">
              {badge.label}
            </Badge>
            
            {/* Title & Description */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-elegant font-bold text-white leading-tight">
                {currentImage.title}
              </h1>
              <p className="text-lg sm:text-xl font-script text-gold-light font-medium">
                {currentImage.subtitle}
              </p>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed line-clamp-3">
                {currentImage.description}
              </p>
            </div>

            {/* CTA Buttons - High Contrast */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button size="lg" className="w-full sm:flex-1 bg-gradient-ruby-primary hover:opacity-90 text-white font-semibold min-h-[48px] shadow-lg" asChild>
                <Link to="/request-quote#page-header" className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Request Quote</span>
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:flex-1 border-2 border-white text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 min-h-[48px] shadow-lg" asChild>
                <a href="tel:8439700265" className="flex items-center justify-center gap-2 text-primary">
                  <Phone className="h-4 w-4" />
                  <span>Call Now</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Hero Sentinel - triggers MobileActionBar visibility */}
        <div ref={heroSentinelRef} id="hero-sentinel" aria-hidden="true" className="absolute bottom-0 left-0 w-full h-1 pointer-events-none" />
      </section>;
  }

  // Desktop Layout (True 60/40 Split)
  return <section className="relative h-screen overflow-hidden bg-background flex pb-8 lg:pb-16" role="main" aria-label="Hero section with image carousel">
      {/* Visual Area - 60% */}
      <div ref={visualRef} className={`relative w-3/5 h-full overflow-hidden ${visualAnimationClass}`} role="region" aria-label="Image carousel">
        {/* Main Image with cinematic aspect ratio */}
        <OptimizedImage src={currentImage.src} alt={currentImage.alt} aspectRatio="aspect-video" className={`w-full h-full object-cover ${getImageObjectPosition(currentIndex)} transition-all duration-1000`} containerClassName="h-full" priority />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />

        {/* Progress Indicators */}
        <div className="absolute top-6 left-6 z-20 flex space-x-1">
          {heroImages.map((_, index) => <button key={index} onClick={() => setCurrentIndex(index)} className="min-w-[24px] min-h-[24px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20 hover:scale-110 transition-transform" aria-label={`Go to slide ${index + 1} of ${heroImages.length}`} aria-current={index === currentIndex ? 'true' : 'false'}>
              <span className={`h-2 rounded-full transition-all duration-500 ${index === currentIndex ? 'w-12 bg-gradient-ruby-primary' : 'w-4 bg-white/50 hover:bg-white/70'}`} />
            </button>)}
        </div>


        {/* Brand Badge with Logo */}
        <div className="absolute bottom-6 left-6 z-20">
          <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl">
            <img src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" alt="Soul Train's Eatery Logo" className="h-12 w-12 object-contain" />
            <span className="text-white font-script text-2xl">Soul Train's Eatery</span>
          </div>
        </div>
      </div>

      {/* Content Area - 40% */}
      <div ref={contentRef} className={`relative w-2/5 h-full bg-background p-6 md:p-8 lg:p-12 flex flex-col justify-center ${contentAnimationClass}`} role="region" aria-label="Content section">
        {/* Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" alt="" aria-hidden="true" className="w-72 h-72 object-contain opacity-[0.04]" />
        </div>
        <div className="max-w-lg space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant={badge.variant} className="text-sm">
              {badge.label}
            </Badge>
            {currentImage.category === "featured" && <Star className="h-5 w-5 text-gold fill-gold" />}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-elegant font-bold text-foreground leading-tight">
              {currentImage.title}
            </h1>
            <p className="text-xl lg:text-2xl font-script text-ruby font-medium">
              {currentImage.subtitle}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {currentImage.description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
              <Button size="lg" className="flex-1 bg-gradient-ruby-primary hover:bg-gradient-ruby-accent text-white font-semibold min-h-[48px]" asChild>
                <a href="/request-quote#page-header" className="flex items-center justify-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Request Quote</span>
                </a>
              </Button>
              <Button variant="outline" size="lg" className="flex-1 border-ruby text-ruby hover:bg-ruby hover:text-white min-h-[48px]" asChild>
                <a href="tel:+1234567890" className="flex items-center justify-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Call Now</span>
                </a>
              </Button>
            </div>
            
            {/* Trust Indicator */}
            <div className="pt-4 border-t border-border">
              <p className="text-muted-foreground text-sm leading-relaxed">
                ✨ Over 500 successful events • 5-star rated • Fully licensed & insured
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>;
};