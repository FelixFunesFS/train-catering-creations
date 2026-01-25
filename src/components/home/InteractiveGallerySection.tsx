
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EnhancedImageModal } from "@/components/gallery/EnhancedImageModal";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { galleryImages, showcaseImages } from "@/data/galleryImages";
import { Camera, Heart, Star, Eye } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

export const InteractiveGallerySection = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();
  
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ delay: 0, variant: 'fade-up' });
  const { ref: gridRef, isVisible: gridVisible, variant: gridVariant } = useScrollAnimation({ delay: 200, variant: 'ios-spring' });
  const { ref: ctaRef, isVisible: ctaVisible, variant: ctaVariant } = useScrollAnimation({ delay: 400, variant: 'elastic' });
  
  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);
  const gridAnimationClass = useAnimationClass(gridVariant, gridVisible);
  const ctaAnimationClass = useAnimationClass(ctaVariant, ctaVisible);

  const handleImageClick = (imageSrc: string) => {
    const index = galleryImages.findIndex(img => img.src === imageSrc);
    setSelectedImageIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  // showcaseImages is now imported from galleryImages.ts with fixed curated order

  const renderImageCard = (image: any, index: number) => {
    return (
      <div
        key={index}
        className="neumorphic-card-2 hover:neumorphic-card-3 rounded-xl p-3 sm:p-4 bg-card transition-all duration-300 cursor-pointer group hover:scale-[1.02] transform"
        onClick={() => handleImageClick(image.src)}
      >
        <div className="relative rounded-lg overflow-hidden aspect-[4/3] sm:aspect-square lg:aspect-[4/3]">
          <OptimizedImage
            src={image.src}
            alt={image.title}
            containerClassName="w-full h-full"
            className="group-hover:scale-105 transition-transform duration-300 w-full h-full object-cover"
            priority={index < 3}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-card/30 border-t border-border/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div ref={headerRef} className={`text-center mb-8 sm:mb-10 lg:mb-12 ${headerAnimationClass}`}>
            <div className="flex justify-center items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-primary" />
              <Heart className="w-4 h-4 text-primary" />
              <Star className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-3 sm:mb-4 leading-tight">
              Gallery Showcase
            </h2>
            <div className="w-16 h-1 bg-gradient-primary mx-auto mb-4 sm:mb-6 rounded-full" />
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore our portfolio of beautifully catered events, from intimate gatherings to grand celebrations. 
              Each image captures the essence of culinary excellence and impeccable service.
            </p>
          </div>

          {/* Mobile Carousel / Desktop Grid */}
          <div ref={gridRef} className={gridAnimationClass}>
            {isMobile ? (
              /* Mobile Carousel */
              <div className="mb-8 sm:mb-10 lg:mb-12">
                <Carousel 
                  opts={{
                    align: "start",
                    loop: true,
                    dragFree: true
                  }} 
                  plugins={[Autoplay({
                    delay: 4000,
                    stopOnInteraction: true
                  })]} 
                  className="w-full"
                >
                  <CarouselContent className="-ml-2">
                    {showcaseImages.map((image, index) => (
                      <CarouselItem 
                        key={index} 
                        className="pl-2 basis-[85%]"
                      >
                        {renderImageCard(image, index)}
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2 h-8 w-8 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90" />
                  <CarouselNext className="right-2 h-8 w-8 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90" />
                </Carousel>
              </div>
            ) : (
              /* Desktop/Tablet Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
                {showcaseImages.map((image, index) => renderImageCard(image, index))}
              </div>
            )}
          </div>

          <div ref={ctaRef} className={`text-center ${ctaAnimationClass}`}>
            <div className="neumorphic-card-2 hover:neumorphic-card-3 rounded-2xl p-6 sm:p-8 bg-gradient-card/50 transition-all duration-300">
              <div className="flex justify-center mb-4">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-elegant font-bold text-foreground mb-3">
                Ready to Create Your Perfect Event?
              </h3>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base max-w-2xl mx-auto">
                Let our portfolio inspire your next celebration. View our complete gallery or start planning your event today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/gallery">
                  <Button variant="cta" size="responsive-md" className="w-full sm:w-auto">
                    View Full Gallery
                  </Button>
                </Link>
                <Link to="/request-quote#page-header">
                  <Button variant="outline" size="responsive-md" className="w-full sm:w-auto">
                    Get Quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EnhancedImageModal 
        images={galleryImages} 
        selectedIndex={selectedImageIndex} 
        onClose={handleCloseModal} 
      />
    </>
  );
};
