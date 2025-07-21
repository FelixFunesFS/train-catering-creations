import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ImageModal } from "@/components/gallery/ImageModal";
import { OptimizedFloatingImage } from "@/components/ui/optimized-floating-image";
import Autoplay from "embla-carousel-autoplay";

const highQualityImages = [{
  src: "/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png",
  title: "Rustic Wedding Venue",
  description: "Beautiful rustic venue with elegant lighting",
  category: "wedding"
}, {
  src: "/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png",
  title: "Wedding Venue Dining",
  description: "Elegant dining setup for wedding reception",
  category: "wedding"
}, {
  src: "/lovable-uploads/26d2d500-6017-41a2-99b2-b7050cefedba.png",
  title: "Elegant Outdoor Wedding Tent",
  description: "Sophisticated tent setup for outdoor celebrations",
  category: "wedding"
}, {
  src: "/lovable-uploads/9ea8f6b7-e1cd-4f55-a434-1ffedf0b96dc.png",
  title: "Military Formal Ceremony",
  description: "Professional formal ceremony with decorative arch",
  category: "formal"
}, {
  src: "/lovable-uploads/531de58a-4283-4d7c-882c-a78b6cdc97c0.png",
  title: "Professional Patriotic Buffet",
  description: "Elegant patriotic-themed buffet display",
  category: "buffet"
}, {
  src: "/lovable-uploads/82c332e5-a941-4e79-bd7d-3aebfc9b230b.png",
  title: "Chicken and Waffles with Berries",
  description: "Gourmet chicken and waffles presentation",
  category: "signature"
}, {
  src: "/lovable-uploads/f3ddc698-c228-4106-a756-bc31aeb3f7d4.png",
  title: "French Toast with Fresh Berries",
  description: "Artfully plated French toast with seasonal berries",
  category: "signature"
}, {
  src: "/lovable-uploads/9f908ab3-500f-481a-b35b-3fe663708efe.png",
  title: "Fresh Berry Tart Display",
  description: "Elegant berry tart presentation",
  category: "dessert"
}, {
  src: "/lovable-uploads/7f22e72c-441b-4b6c-9525-56748107fdd5.png",
  title: "Salmon and Creamy Casserole",
  description: "Gourmet salmon and creamy casserole dishes with artistic edible flower presentation",
  category: "signature"
}, {
  src: "/lovable-uploads/84e8a135-2a5b-45ec-a57b-913b0540e56e.png",
  title: "Roasted Vegetables and Chicken",
  description: "Perfectly seasoned roasted vegetables and chicken with colorful floral garnish",
  category: "signature"
}];

export const InteractiveGallerySection = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };
  
  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  return (
    <section className="bg-gradient-card/20 border-t border-border/10">
      {/* Desktop Full-Width Card */}
      <div className="hidden lg:block">
        <div className="neumorphic-card-4 mx-4 xl:mx-8 rounded-2xl overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 xl:px-12 py-12 xl:py-16">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant text-foreground mb-4 text-fade-up">
                Our Gallery Showcase
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto text-fade-up-delay-1">See how we turn food into an experience! Our gallery highlights the beauty, flavor, and joy behind every event we cater.</p>
            </div>

            <div className="relative">
              <Carousel opts={{
                align: "start",
                loop: true
              }} plugins={[Autoplay({
                delay: 4000
              })]} className="w-full">
                <CarouselContent className="-ml-1 gap-2">
                  {highQualityImages.map((image, index) => (
                    <CarouselItem key={index} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4">
                      <OptimizedFloatingImage 
                        src={image.src} 
                        alt={image.title} 
                        title={image.title} 
                        description={image.description} 
                        aspectRatio="aspect-[3/4]" 
                        variant="medium" 
                        priority={index < 4} 
                        onImageClick={() => handleImageClick(index)} 
                        className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-elegant hover:shadow-elevated" 
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </div>

            <div className="text-center mt-12 lg:mt-16">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
                <Button asChild variant="cta" size="responsive-lg" className="w-3/5 sm:w-auto sm:min-w-[14rem]">
                  <Link to="/gallery#page-header">
                    View Full Gallery
                  </Link>
                </Button>
                <Button asChild variant="cta-outline" size="responsive-lg" className="w-3/5 sm:w-auto sm:min-w-[14rem]">
                  <Link to="/request-quote#page-header">
                    Request Quote
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="block lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant text-foreground mb-4 text-fade-up">
              Our Gallery Showcase
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto text-fade-up-delay-1">See how we turn food into an experience! Our gallery highlights the beauty, flavor, and joy behind every event we cater.</p>
          </div>

          <div className="relative">
            <Carousel opts={{
              align: "start",
              loop: true
            }} plugins={[Autoplay({
              delay: 4000
            })]} className="w-full">
              <CarouselContent className="-ml-1 gap-2">
                {highQualityImages.map((image, index) => (
                  <CarouselItem key={index} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4">
                    <OptimizedFloatingImage 
                      src={image.src} 
                      alt={image.title} 
                      title={image.title} 
                      description={image.description} 
                      aspectRatio="aspect-[3/4]" 
                      variant="medium" 
                      priority={index < 4} 
                      onImageClick={() => handleImageClick(index)} 
                      className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-elegant hover:shadow-elevated" 
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>

          <div className="text-center mt-12 lg:mt-16">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              <Button asChild variant="cta" size="responsive-lg" className="w-3/5 sm:w-auto sm:min-w-[14rem]">
                <Link to="/gallery#page-header">
                  View Full Gallery
                </Link>
              </Button>
              <Button asChild variant="cta-outline" size="responsive-lg" className="w-3/5 sm:w-auto sm:min-w-[14rem]">
                <Link to="/request-quote#page-header">
                  Request Quote
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ImageModal images={highQualityImages} selectedIndex={selectedImageIndex} onClose={handleCloseModal} />
    </section>
  );
};
