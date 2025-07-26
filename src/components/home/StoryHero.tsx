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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
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
    {
      src: "/lovable-uploads/72e4931b-da81-474f-bd3c-a38945df3999.png",
      alt: "Outdoor buffet catering",
      title: "Outdoor Event Catering",
      category: "outdoor",
      description: "Professional outdoor catering with fresh presentation and quality service"
    }
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

  // Enhanced touch handlers with swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left - next image
        setCurrentIndex(prev => (prev + 1) % heroImages.length);
      } else {
        // Swipe right - previous image
        setCurrentIndex(prev => prev > 0 ? prev - 1 : heroImages.length - 1);
      }
    }
    
    setTouchStart(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setCurrentIndex(prev => prev > 0 ? prev - 1 : heroImages.length - 1);
    } else if (e.key === 'ArrowRight') {
      setCurrentIndex(prev => (prev + 1) % heroImages.length);
    } else if (e.key === ' ') {
      e.preventDefault();
      togglePlayPause();
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

  // Mobile first layout
  if (isMobile) {
    return (
      <div 
        className="relative min-h-[100dvh] bg-gradient-primary overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Hero carousel"
        aria-live="polite"
      >
        {/* Progress Indicators */}
        <div className="absolute top-4 left-4 right-4 z-30">
          <div className="flex gap-1">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={`Go to story ${index + 1}`}
              >
                <div
                  className={`h-full bg-white transition-all duration-500 ${
                    index === currentIndex 
                      ? 'w-full' 
                      : index < currentIndex 
                        ? 'w-full opacity-100' 
                        : 'w-0'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Image Container - Top Section */}
        <div className="relative h-[60vh] overflow-hidden">
          <OptimizedImage
            src={currentImage.src}
            alt={currentImage.alt}
            className="w-full h-full object-cover transition-all duration-700 ease-out"
            containerClassName="w-full h-full"
            priority
          />
          
          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
          
          {/* Controls Overlay */}
          <div className="absolute top-6 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayPause}
              className="bg-black/20 text-white border border-white/20 backdrop-blur-md hover:bg-black/30 focus:ring-2 focus:ring-white/50"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>

          {/* Brand Icons */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
              <UtensilsCrossed className="h-4 w-4 text-white" aria-hidden="true" />
              <Heart className="h-4 w-4 text-white" aria-hidden="true" />
              <Star className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Content Card - Bottom Section */}
        <div 
          ref={overlayRef}
          className={`relative h-[40vh] flex flex-col justify-center px-4 ${useAnimationClass(overlayVariant, overlayVisible)}`}
        >
          {/* Glassmorphic Content Card */}
          <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-elegant mx-2">
            {/* Category Badge */}
            <div className="mb-4">
              <Badge className={`${getCategoryBadge(currentImage.category).variant} backdrop-blur-sm border`}>
                <Sparkles className="h-3 w-3 mr-1" />
                {getCategoryBadge(currentImage.category).label}
              </Badge>
            </div>

            {/* Typewriter Title */}
            <h1 className="text-2xl font-elegant font-bold text-foreground leading-tight mb-2">
              {typewriterText}
              <span className="animate-pulse text-primary">|</span>
            </h1>
            
            <div className="text-lg font-script bg-gradient-ruby-primary bg-clip-text text-transparent mb-4">
              Catering Experience
            </div>
            
            <div className="w-16 h-1 bg-gradient-ruby-primary mb-4 rounded-full" />

            {/* Story Title */}
            <h2 className="text-xl font-elegant font-semibold text-foreground mb-2">
              {currentImage.title}
            </h2>
            
            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {currentImage.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="min-h-[48px] text-base font-semibold">
                <Link to="/request-quote#page-header" className="flex items-center justify-center gap-2">
                  Request Quote
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                size="lg"
                className="min-h-[48px] text-base font-semibold bg-card/50 backdrop-blur-sm"
              >
                <Link to="/gallery#page-header" className="flex items-center justify-center gap-2">
                  View Gallery
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleScrollToDiscover}
              className="text-muted-foreground hover:text-foreground animate-bounce focus:ring-2 focus:ring-primary/50"
              aria-label="Scroll to next section"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div 
      className="relative h-screen overflow-hidden bg-gradient-primary"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Hero carousel"
      aria-live="polite"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <OptimizedImage
          src={currentImage.src}
          alt={currentImage.alt}
          className="w-full h-full object-cover transition-all duration-700 ease-out"
          containerClassName="w-full h-full"
          priority
        />
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
      </div>

      {/* Desktop Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-8">
        {/* Logo */}
        <div className="h-16 w-16">
          <img 
            src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
            alt="Soul Train's Eatery Logo" 
            className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" 
          />
        </div>

        {/* Progress Indicators */}
        <div className="flex gap-2 flex-1 max-w-md mx-8">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={`Go to story ${index + 1}`}
            >
              <div
                className={`h-full bg-white transition-all duration-500 ${
                  index === currentIndex 
                    ? 'w-full' 
                    : index < currentIndex 
                      ? 'w-full opacity-100' 
                      : 'w-0'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlayPause}
          className="bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/20 focus:ring-2 focus:ring-white/50"
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>

      {/* Desktop Content - Floating Card */}
      <div 
        ref={overlayRef}
        className={`absolute bottom-12 left-12 z-20 max-w-2xl ${useAnimationClass(overlayVariant, overlayVisible)}`}
      >
        <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-elevated">
          {/* Category Badge */}
          <div className="mb-6">
            <Badge className={`${getCategoryBadge(currentImage.category).variant} backdrop-blur-sm border text-sm`}>
              <Sparkles className="h-4 w-4 mr-2" />
              {getCategoryBadge(currentImage.category).label}
            </Badge>
          </div>

          {/* Typewriter Title */}
          <h1 className="text-4xl xl:text-5xl font-elegant font-bold text-foreground leading-tight mb-3">
            {typewriterText}
            <span className="animate-pulse text-primary">|</span>
          </h1>
          
          <div className="text-2xl xl:text-3xl font-script bg-gradient-ruby-primary bg-clip-text text-transparent mb-6">
            Catering Experience
          </div>
          
          <div className="w-24 h-1 bg-gradient-ruby-primary mb-6 rounded-full" />

          {/* Story Title */}
          <h2 className="text-xl xl:text-2xl font-elegant font-semibold text-foreground mb-3">
            {currentImage.title}
          </h2>
          
          {/* Description */}
          <p className="text-muted-foreground text-base xl:text-lg leading-relaxed mb-8 max-w-lg">
            {currentImage.description}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button asChild size="lg" className="min-h-[48px] text-base font-semibold">
              <Link to="/request-quote#page-header" className="flex items-center gap-2">
                Request Quote
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-h-[48px] text-base font-semibold bg-card/50 backdrop-blur-sm"
            >
              <Link to="/gallery#page-header" className="flex items-center gap-2">
                View Gallery
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleScrollToDiscover}
          className="text-white/60 hover:text-white animate-bounce focus:ring-2 focus:ring-white/50"
          aria-label="Scroll to next section"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};