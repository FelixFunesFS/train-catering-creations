import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ArrowRight, Play, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";
import { EnhancedImageModal } from "@/components/gallery/EnhancedImageModal";
import { galleryImages } from "@/data/galleryImages";
import militaryCateringService from "@/assets/military-catering-service.jpg";

interface GalleryItem {
  src: string;
  alt: string;
  category: string;
  title: string;
  isPopular?: boolean;
}

export const InteractiveGalleryPreview = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0 
  });

  const animationClass = useAnimationClass('ios-spring', isVisible);

  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 100 
  });
  const gridAnimationClass = useAnimationClass('fade-up', gridVisible);

  const galleryItems: GalleryItem[] = [
    {
      src: "/lovable-uploads/e61537fa-d421-490b-932f-402236a093aa.png",
      alt: "Elegant outdoor wedding buffet setup",
      category: "Wedding",
      title: "Outdoor Buffet Excellence",
      isPopular: true
    },
    {
      src: "/lovable-uploads/02486e12-54f5-4b94-8d6e-f150546c6983.png",
      alt: "Artisan charcuterie and grazing board",
      category: "Appetizers",
      title: "Artisan Grazing Boards"
    },
    {
      src: "/lovable-uploads/d6dabca7-8f7b-45c8-bb6c-ef86311e92bd.png",
      alt: "Colorful side dishes and comfort food",
      category: "Sides",
      title: "Southern Comfort Sides"
    },
    {
      src: "/lovable-uploads/1cd54e2e-3991-4795-ad2a-6e8c18fb530f.png",
      alt: "Custom wedding cake creation",
      category: "Desserts",
      title: "Tanya's Custom Cakes",
      isPopular: true
    },
    {
      src: "/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png",
      alt: "Elegant wedding venue dining setup",
      category: "Formal",
      title: "Formal Event Elegance"
    },
    {
      src: militaryCateringService,
      alt: "Soul Train's Eatery serving Air Force personnel at military base",
      category: "Military",
      title: "Military Base Catering"
    }
  ];

  // Auto-advance story on mobile
  useEffect(() => {
    if (!isMobile || !isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentStoryIndex((prev) => 
        prev === galleryItems.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    
    return () => clearInterval(timer);
  }, [isAutoPlaying, isMobile, galleryItems.length]);

  // High-contrast badge colors for WCAG AA compliance
  const getCategoryColor = (category: string) => {
    const colors = {
      Wedding: "bg-ruby text-white border-ruby",
      Appetizers: "bg-gold text-navy border-gold",
      Sides: "bg-navy text-white border-navy",
      Desserts: "bg-primary text-white border-primary",
      Formal: "bg-platinum text-navy border-platinum",
      Military: "bg-navy text-white border-navy"
    };
    return colors[category as keyof typeof colors] || "bg-muted text-foreground border-border";
  };

  const handlePreviousStory = () => {
    setCurrentStoryIndex((prev) => 
      prev === 0 ? galleryItems.length - 1 : prev - 1
    );
  };

  const handleNextStory = () => {
    setCurrentStoryIndex((prev) => 
      prev === galleryItems.length - 1 ? 0 : prev + 1
    );
  };

  const handleImageClick = (imageSrc: string) => {
    const index = galleryImages.findIndex(img => img.src === imageSrc);
    // If image not found in full gallery, open at beginning
    setSelectedImageIndex(index >= 0 ? index : 0);
  };

  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  const handleStoryTouch = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isMobile) return;
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const relativeX = x - rect.left;
    const centerX = rect.width / 2;
    
    if (relativeX < centerX / 2) {
      handlePreviousStory();
    } else if (relativeX > centerX + centerX / 2) {
      handleNextStory();
    } else {
      // Center tap opens modal
      handleImageClick(galleryItems[currentStoryIndex].src);
    }
  };

  // Format gallery images for modal
  const modalImages = galleryImages.map(img => ({
    src: img.src,
    title: img.title,
    description: img.description,
    category: img.category
  }));

  return (
    <>
      <section 
        ref={ref}
        className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-background via-ruby/[0.02] to-background overflow-hidden"
      >
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className={`text-center mb-6 lg:mb-10 space-y-3 ${animationClass}`}>
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Play className="h-5 w-5 text-ruby" />
              <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
                Visual Story
              </Badge>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground">
              A Gallery of Flavor & Style
            </h2>
            <p className="text-xl sm:text-2xl font-script text-ruby font-medium">
              Every Event Tells a Story
            </p>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Witness 20+ years of Charleston catering mastery. Each photo captures the Ward family's commitment 
              to bringing authentic Southern hospitality to the Holy City's most treasured moments.
            </p>
          </div>

          {/* Mobile Story Format */}
          {isMobile ? (
            <div className="mb-6">
              {/* Story Progress Dots */}
              <div className="flex justify-center space-x-2 mb-4">
                {galleryItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStoryIndex(index)}
                    className="min-w-[24px] min-h-[24px] flex items-center justify-center"
                    aria-label={`Go to slide ${index + 1} of ${galleryItems.length}`}
                    aria-current={index === currentStoryIndex ? 'true' : undefined}
                  >
                    <span className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStoryIndex 
                        ? 'bg-ruby w-6' 
                        : 'bg-ruby/30 w-2'
                    }`} />
                  </button>
                ))}
              </div>

              {/* Story Container */}
              <div className="relative">
                <Card className="relative overflow-hidden border-2 border-ruby/20">
                  <div 
                    className="relative h-[65vh] min-h-[400px] max-h-[600px] overflow-hidden cursor-pointer"
                    onTouchStart={handleStoryTouch}
                    onClick={handleStoryTouch}
                  >
                    <OptimizedImage
                      src={galleryItems[currentStoryIndex].src}
                      alt={galleryItems[currentStoryIndex].alt}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Navigation Areas (Visual Indicators) */}
                    <div className="absolute inset-0 flex">
                      <div className="flex-1 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity">
                        <ChevronLeft className="h-8 w-8 text-white/80" />
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-white/80">
                          {isAutoPlaying ? (
                            <div className="w-3 h-3 bg-white/80 rounded-full animate-pulse" />
                          ) : (
                            <Play className="h-6 w-6" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity">
                        <ChevronRight className="h-8 w-8 text-white/80" />
                      </div>
                    </div>

                    {/* Top Content */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <Badge className={`text-xs ${getCategoryColor(galleryItems[currentStoryIndex].category)}`}>
                        {galleryItems[currentStoryIndex].category}
                      </Badge>
                      
                      {galleryItems[currentStoryIndex].isPopular && (
                        <Badge className="bg-gradient-ruby-primary text-white border-0">
                          <Heart className="h-3 w-3 mr-1 fill-white" />
                          Popular
                        </Badge>
                      )}
                    </div>

                    {/* Bottom Content */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4">
                        <h3 className="font-elegant font-semibold text-foreground text-lg mb-2">
                          {galleryItems[currentStoryIndex].title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {galleryItems[currentStoryIndex].alt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-ruby font-medium">
                            {currentStoryIndex + 1} of {galleryItems.length}
                          </span>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-ruby text-ruby hover:bg-ruby hover:text-white"
                            asChild
                          >
                            <a href="/gallery">View in Gallery</a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            /* Desktop Grid Format */
            <div 
              ref={gridRef}
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6 ${gridAnimationClass}`}
            >
              {galleryItems.map((item, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden cursor-pointer border-2 border-transparent hover:border-ruby/30 transition-all duration-500"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handleImageClick(item.src)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <OptimizedImage
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    
                    {/* Ruby Gradient Overlay on Hover */}
                    <div className={`absolute inset-0 bg-gradient-ruby-subtle transition-opacity duration-300 ${
                      hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                    }`} />

                    {/* Popular Badge */}
                    {item.isPopular && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-ruby-primary text-white border-0">
                          <Heart className="h-3 w-3 mr-1 fill-white" />
                          Popular
                        </Badge>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </Badge>
                    </div>

                    {/* Content Overlay */}
                    <div className={`absolute inset-0 flex items-end p-4 transition-all duration-300 ${
                      hoveredIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}>
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 w-full">
                        <h3 className="font-elegant font-semibold text-foreground text-base mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Click to view gallery →
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className={`text-center ${animationClass}`}>
            <Button 
              size="lg"
              className="bg-gradient-ruby-primary hover:bg-gradient-ruby-accent text-white font-semibold group"
              asChild
            >
              <a href="/gallery" className="flex items-center space-x-2">
                <span>Explore Full Gallery</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Full Gallery Modal */}
      <EnhancedImageModal 
        images={modalImages} 
        selectedIndex={selectedImageIndex} 
        onClose={handleCloseModal} 
      />
    </>
  );
};
