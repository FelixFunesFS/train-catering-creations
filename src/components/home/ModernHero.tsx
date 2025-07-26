import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, ChevronDown, Heart, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface HeroImage {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
}

export const ModernHero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0 
  });

  const animationClass = useAnimationClass('ios-spring', isVisible);

  const heroImages: HeroImage[] = [
    {
      src: "/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png",
      alt: "Rustic wedding venue with elegant dining setup",
      title: "108 W Main Featured Venue",
      subtitle: "Where Elegance Meets Southern Charm",
      category: "featured",
      description: "Experience the magic of your special day in this stunning rustic venue with chandeliers, string lights, and our exquisite catering services."
    },
    {
      src: "/lovable-uploads/f074b356-438e-43f1-9802-a5738a9944e0.png",
      alt: "Elegant outdoor wedding tent setup",
      title: "Unforgettable Celebrations",
      subtitle: "Crafted with Soul, Seasoned with Love",
      category: "wedding",
      description: "From intimate gatherings to grand celebrations, Soul Train's Eatery brings exceptional flavors and impeccable service to every occasion."
    },
    {
      src: "/lovable-uploads/c6c2df94-6625-460e-a5a1-b75dd8c362ab.png",
      alt: "Beautiful outdoor wedding buffet",
      title: "Award-Winning Catering",
      subtitle: "20+ Years of Culinary Excellence",
      category: "service",
      description: "Chef Train and Tanya Ward combine decades of experience with family traditions to create memorable dining experiences."
    },
    {
      src: "/lovable-uploads/02486e12-54f5-4b94-8d6e-f150546c6983.png",
      alt: "Elegant grazing board display",
      title: "Artisan Creations",
      subtitle: "Every Detail Matters",
      category: "culinary",
      description: "From our signature charcuterie boards to custom wedding cakes, each dish is crafted with precision and passion."
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, heroImages.length]);

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
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleScrollToDiscover = () => {
    const nextSection = document.querySelector('#featured-venue');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      featured: { label: "Featured Venue", variant: "default" as const },
      wedding: { label: "Wedding Excellence", variant: "secondary" as const },
      service: { label: "Professional Service", variant: "outline" as const },
      culinary: { label: "Culinary Artistry", variant: "default" as const }
    };
    return badges[category as keyof typeof badges] || badges.featured;
  };

  const currentImage = heroImages[currentIndex];
  const badge = getCategoryBadge(currentImage.category);

  if (isMobile) {
    return (
      <section 
        ref={ref}
        className="relative h-screen overflow-hidden bg-background"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Progress Indicators */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {heroImages.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === currentIndex 
                  ? 'w-8 bg-gradient-ruby-primary' 
                  : 'w-3 bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Image Section - 70vh */}
        <div className="relative h-[70vh] overflow-hidden">
          <OptimizedImage
            src={currentImage.src}
            alt={currentImage.alt}
            className="w-full h-full object-cover transition-transform duration-700"
            priority
          />
          
          {/* Controls */}
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/30"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>

          {/* Brand Badge */}
          <div className="absolute top-4 left-4 z-20">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-white fill-ruby" />
              <span className="text-white font-script text-lg">Soul Train's</span>
            </div>
          </div>
        </div>

        {/* Content Card - 30vh */}
        <Card className={`relative h-[30vh] rounded-t-3xl -mt-8 z-10 p-4 bg-white/95 backdrop-blur-lg border-0 ${animationClass}`}>
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={badge.variant} className="text-sm">
                  {badge.label}
                </Badge>
                {currentImage.category === "featured" && (
                  <Star className="h-4 w-4 text-gold fill-gold" />
                )}
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-elegant font-bold text-foreground leading-tight">
                  {currentImage.title}
                </h1>
                <p className="text-base font-script text-ruby font-medium">
                  {currentImage.subtitle}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentImage.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-2 pt-2">
              <Button 
                size="lg"
                className="w-full bg-gradient-ruby-primary hover:bg-gradient-ruby-accent text-white font-semibold min-h-[44px]"
                asChild
              >
                <a href="/request-quote#page-header">Request Quote</a>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="w-full border-ruby text-ruby hover:bg-ruby hover:text-white min-h-[44px]"
                asChild
              >
                <a href="/gallery">View Gallery</a>
              </Button>
            </div>
          </div>
        </Card>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleScrollToDiscover}
            className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 animate-bounce"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </section>
    );
  }

  // Desktop Layout
  return (
    <section 
      ref={ref}
      className="relative h-screen overflow-hidden bg-background"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <OptimizedImage
          src={currentImage.src}
          alt={currentImage.alt}
          className="w-full h-full object-cover transition-all duration-1000"
          priority
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Heart className="h-6 w-6 text-white fill-ruby" />
            <span className="text-white font-script text-2xl">Soul Train's Eatery</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Progress Indicators */}
            <div className="flex space-x-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-500 hover:scale-110 ${
                    index === currentIndex 
                      ? 'w-12 bg-gradient-ruby-primary' 
                      : 'w-4 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/30"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Panel - Bottom Left */}
      <Card className={`absolute bottom-8 left-8 w-96 p-6 bg-white/95 backdrop-blur-lg border-0 shadow-2xl ${animationClass}`}>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Badge variant={badge.variant} className="text-sm">
              {badge.label}
            </Badge>
            {currentImage.category === "featured" && (
              <Star className="h-5 w-5 text-gold fill-gold" />
            )}
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-elegant font-bold text-foreground leading-tight">
              {currentImage.title}
            </h1>
            <p className="text-lg font-script text-ruby font-medium">
              {currentImage.subtitle}
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              {currentImage.description}
            </p>
          </div>

          <div className="flex space-x-3">
            <Button 
              size="lg"
              className="flex-1 bg-gradient-ruby-primary hover:bg-gradient-ruby-accent text-white font-semibold min-h-[44px]"
              asChild
            >
              <a href="/request-quote#page-header">Request Quote</a>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-ruby text-ruby hover:bg-ruby hover:text-white min-h-[44px]"
              asChild
            >
              <a href="/gallery">View Gallery</a>
            </Button>
          </div>
        </div>
      </Card>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleScrollToDiscover}
          className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 animate-bounce"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};