import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { ChevronDown, Play, Pause, Sparkles, ChevronRight, UtensilsCrossed, Heart, Star } from "lucide-react";

export const StoryHero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const [typewriterText, setTypewriterText] = useState("");
  
  const isMobile = useIsMobile();
  const fullText = "Charleston's Most Cherished";

  const { ref: overlayRef, isVisible: overlayVisible, variant: overlayVariant } = useScrollAnimation({ 
    delay: 300, 
    variant: 'fade-up',
    mobile: { variant: 'slide-up', delay: 200 },
    desktop: { variant: 'fade-up', delay: 300 }
  });

  const heroImages = [
    {
      src: "/lovable-uploads/adfb4ea8-c62c-4f6d-b7dd-b562466c2c31.png",
      alt: "Elegant tiered dessert display",
      title: "Elegant Dessert Presentations",
      category: "desserts",
      description: "Artisanal desserts and tiered displays that create unforgettable moments"
    },
    {
      src: "/lovable-uploads/ce12a76f-20cf-449f-8755-4d84cbf1688a.png",
      alt: "Artisanal grazing board",
      title: "Gourmet Grazing Tables",
      category: "grazing",
      description: "Beautifully curated grazing boards featuring the finest local ingredients"
    },
    {
      src: "/lovable-uploads/f6f0cdc2-cd71-4392-984e-ed9609103e42.png",
      alt: "Wedding reception venue",
      title: "Wedding Receptions",
      category: "wedding",
      description: "Creating magical moments for your special day with elegant catering"
    },
    {
      src: "/lovable-uploads/92c3b6c8-61dc-4c37-afa8-a0a4db04c551.png",
      alt: "Professional buffet setup",
      title: "Corporate Events",
      category: "corporate",
      description: "Professional catering services that impress clients and colleagues"
    },
    {
      src: "/lovable-uploads/a9bff788-a96d-499b-8882-930193b96b07.png",
      alt: "Elegant event setup with gold accents",
      title: "Luxury Event Dining",
      category: "formal",
      description: "Sophisticated table settings with premium linens and elegant chair covers"
    },
    {
      src: "/lovable-uploads/4ede73c0-f23a-4ae6-86f7-35f8961ddc83.png",
      alt: "Beautiful indoor buffet setup",
      title: "Elegant Indoor Receptions",
      category: "formal",
      description: "Stunning venue transformations with fresh florals and premium presentation"
    },
    {
      src: "/lovable-uploads/598d7763-6faf-4a2c-9735-a4b3a594aad5.png",
      alt: "Wedding cake and dessert display",
      title: "Custom Wedding Celebrations",
      category: "wedding",
      description: "Personalized wedding cake displays and elegant dessert presentations"
    },
    {
      src: "/lovable-uploads/804371da-dff9-48f4-af43-4316adbe52d1.png",
      alt: "Military catering event",
      title: "Military & Special Events",
      category: "military",
      description: "Honored to serve our military with exceptional catering experiences"
    },
  ];

  const currentImage = heroImages[currentIndex];

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { label: string; variant: string }> = {
      'wedding': { label: 'Weddings', variant: 'bg-primary/10 text-primary border-primary/20' },
      'corporate': { label: 'Corporate', variant: 'bg-accent/10 text-accent-foreground border-accent/20' },
      'desserts': { label: 'Desserts', variant: 'bg-secondary/10 text-secondary-foreground border-secondary/20' },
      'grazing': { label: 'Grazing Tables', variant: 'bg-muted/10 text-muted-foreground border-muted/20' },
      'formal': { label: 'Formal Events', variant: 'bg-primary/10 text-primary border-primary/20' },
      'military': { label: 'Military Events', variant: 'bg-accent/10 text-accent-foreground border-accent/20' },
      'outdoor': { label: 'Outdoor Events', variant: 'bg-secondary/10 text-secondary-foreground border-secondary/20' },
    };
    return categoryMap[category] || { label: category, variant: 'bg-muted/10 text-muted-foreground border-muted/20' };
  };

  // Typewriter effect
  useEffect(() => {
    if (overlayVisible) {
      let index = 0;
      const timer = setInterval(() => {
        setTypewriterText(fullText.slice(0, index));
        index++;
        if (index > fullText.length) {
          clearInterval(timer);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [overlayVisible]);

  // Auto-advance story
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % heroImages.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [isPlaying, heroImages.length]);

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
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const handleScrollToDiscover = () => {
    const nextSection = document.querySelector('section:nth-of-type(2)');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-primary ${isMobile ? 'h-auto flex items-center justify-center min-h-screen py-8' : 'h-screen'}`}>
      {/* Background Image with Parallax Effect */}
      <div className={`${isMobile ? 'relative aspect-[5/4] w-full max-w-sm mx-auto' : 'absolute inset-0'}`}>
        <OptimizedImage
          src={currentImage.src}
          alt={currentImage.alt}
          className="w-full h-full object-cover transition-transform duration-700"
          containerClassName="w-full h-full"
          aspectRatio={isMobile ? "aspect-[5/4]" : undefined}
          priority
        />
        
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
        <div className="absolute inset-0 z-10 flex max-w-sm mx-auto">
          <div className="flex-1" onTouchStart={handleTouchStart} />
          <div className="flex-1" onTouchStart={handleTouchStart} />
          <div className="flex-1" onTouchStart={handleTouchStart} />
        </div>
      )}

      {/* Play/Pause Control */}
      <div className="absolute top-6 right-4 z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlayPause}
          className="bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/20"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>

      {/* Brand Icons - Mobile */}
      {isMobile && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <UtensilsCrossed className="h-4 w-4 text-white" aria-label="Quality catering" />
            <Heart className="h-4 w-4 text-white" aria-label="Made with love" />
            <Star className="h-4 w-4 text-white" aria-label="Excellence" />
          </div>
        </div>
      )}

      {/* Desktop Logo */}
      {!isMobile && (
        <div className="absolute top-8 left-8 z-20">
          <div className="h-16 w-16 relative">
            <img 
              src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
              alt="Soul Train's Eatery Logo" 
              className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" 
            />
          </div>
        </div>
      )}

      {/* Content Overlay */}
      <div 
        ref={overlayRef}
        className={`${isMobile ? 'relative mt-6 px-4' : 'absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8'} z-15 ${useAnimationClass(overlayVariant, overlayVisible)}`}
      >
        {/* Category Badge */}
        <div className="mb-4">
          <Badge className={`${getCategoryBadge(currentImage.category).variant} backdrop-blur-sm`}>
            <Sparkles className="h-3 w-3 mr-1" />
            {getCategoryBadge(currentImage.category).label}
          </Badge>
        </div>

        {/* Main Heading */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-elegant font-bold text-white leading-tight mb-2" style={{ textShadow: '0 4px 8px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.6), 0 1px 2px rgba(0, 0, 0, 0.4)' }}>
            {typewriterText}
            <span className="animate-pulse">|</span>
          </h1>
          
          <div className="text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-script bg-gradient-ruby-primary bg-clip-text text-transparent mb-4" style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))' }}>
            Catering Experience
          </div>
          
          <div className="w-16 lg:w-24 h-1 bg-gradient-ruby-primary mb-4 rounded-full" />
          
          <h2 className="text-lg sm:text-xl lg:text-2xl font-elegant font-semibold text-white mb-2" style={{ textShadow: '0 3px 6px rgba(0, 0, 0, 0.7), 0 1px 3px rgba(0, 0, 0, 0.5)' }}>
            {currentImage.title}
          </h2>
          
          <p className="text-white/80 text-sm sm:text-base lg:text-lg max-w-lg" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.6), 0 1px 2px rgba(0, 0, 0, 0.4)' }}>
            {currentImage.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button asChild size="lg" className="min-h-[48px] text-base font-semibold">
            <Link to="/request-quote#page-header" className="flex items-center justify-center gap-2">
              Request Quote
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="min-h-[48px] text-base font-semibold"
          >
            <Link to="/gallery#page-header" className="flex items-center justify-center gap-2">
              View Gallery
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleScrollToDiscover}
            className="text-white/60 hover:text-white animate-bounce"
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      </div>

    </div>
  );
};