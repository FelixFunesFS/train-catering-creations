
import { useState, useEffect } from "react";
import { GalleryImage } from "@/data/gallery/types";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

interface MobileGalleryCarouselProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
  autoPlay?: boolean;
  autoPlayDelay?: number;
}

export const MobileGalleryCarousel = ({ 
  images, 
  onImageClick,
  autoPlay = true,
  autoPlayDelay = 4000
}: MobileGalleryCarouselProps) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { label: string; color: string }> = {
      wedding: { label: "Wedding", color: "bg-pink-500/90" },
      formal: { label: "Formal", color: "bg-purple-500/90" },
      corporate: { label: "Corporate", color: "bg-blue-500/90" },
      desserts: { label: "Desserts", color: "bg-orange-500/90" },
      grazing: { label: "Appetizers", color: "bg-green-500/90" },
      team: { label: "Our Team", color: "bg-indigo-500/90" },
      buffet: { label: "Buffet", color: "bg-red-500/90" },
    };
    return categoryMap[category] || { label: category, color: "bg-gray-500/90" };
  };

  const autoplayPlugin = Autoplay({
    delay: autoPlayDelay,
    stopOnInteraction: true,
    stopOnMouseEnter: true,
  });

  useEffect(() => {
    if (isPlaying) {
      autoplayPlugin.play();
    } else {
      autoplayPlugin.stop();
    }
  }, [isPlaying, autoplayPlugin]);

  return (
    <div className="w-full space-y-4">
      {/* Carousel Controls */}
      <div className="flex justify-center items-center gap-2 sm:gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-1 min-h-[44px]"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span className="hidden sm:inline">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Play</span>
            </>
          )}
        </Button>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>{currentIndex + 1}</span>
          <span>/</span>
          <span>{images.length}</span>
        </div>
      </div>

      {/* Carousel */}
      <Carousel 
        opts={{
          align: "center",
          loop: true,
          dragFree: true
        }} 
        plugins={isPlaying ? [autoplayPlugin] : []}
        className="w-full"
        onSelect={(emblaApi) => {
          if (emblaApi) {
            setCurrentIndex(emblaApi.selectedScrollSnap());
          }
        }}
      >
        <CarouselContent className="-ml-2 sm:-ml-4">
          {images.map((image, index) => {
            const categoryBadge = getCategoryBadge(image.category);
            
            return (
              <CarouselItem 
                key={index} 
                className="pl-2 sm:pl-4 basis-[90%] sm:basis-[80%] md:basis-[70%]"
              >
                <div
                  className="group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => onImageClick(image.src)}
                >
                  <div className="relative rounded-xl overflow-hidden bg-card border border-border/20 p-2 sm:p-3">
                    <div className="relative aspect-[4/3] sm:aspect-[3/2] rounded-lg overflow-hidden">
                      <OptimizedImage
                        src={image.src}
                        alt={image.title}
                        aspectRatio="aspect-[4/3]"
                        className="group-hover:scale-105 transition-transform duration-300"
                        priority={index < 3}
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute top-3 left-3">
                          <Badge className={`${categoryBadge.color} text-white text-xs`}>
                            {categoryBadge.label}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-white font-elegant font-semibold text-sm sm:text-base mb-1 leading-tight">
                            {image.title}
                          </h3>
                          <p className="text-white/90 text-xs sm:text-sm leading-tight line-clamp-2">
                            {image.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2 h-10 w-10 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 min-h-[44px] min-w-[44px]" />
        <CarouselNext className="right-2 h-10 w-10 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 min-h-[44px] min-w-[44px]" />
      </Carousel>

      {/* Progress Indicator */}
      <div className="flex justify-center">
        <div className="flex gap-1 sm:gap-2">
          {images.slice(0, Math.min(images.length, 10)).map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex % Math.min(images.length, 10)
                  ? "bg-primary w-6"
                  : "bg-primary/30 w-1"
              }`}
            />
          ))}
          {images.length > 10 && (
            <div className="text-xs text-muted-foreground ml-2">
              +{images.length - 10} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
