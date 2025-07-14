import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ImageModal } from "@/components/gallery/ImageModal";
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
  return <section className="py-8 md:py-12 lg:py-16 bg-gradient-card shadow-elegant hover:shadow-glow transition-all duration-200 rounded-lg mx-4 sm:mx-6 lg:mx-8 my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-6">
            Our Gallery Showcase
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the artistry and elegance of Soul Train's catering through our finest moments captured at weddings, corporate events, and special celebrations.
          </p>
        </div>

        <div className="relative">
          <Carousel opts={{
          align: "start",
          loop: true
        }} plugins={[Autoplay({
          delay: 4000
        })]} className="w-full">
            <CarouselContent className="-ml-1 gap-2">
              {highQualityImages.map((image, index) => <CarouselItem key={index} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4">
                  <div className="shadow-elegant hover:shadow-glow bg-gradient-card border-2 border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer group rounded-lg overflow-hidden" onClick={() => handleImageClick(index)}>
                    <div className="relative aspect-[3/4]">
                      <img src={image.src} alt={image.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" decoding="async" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end">
                        <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <h3 className="font-elegant font-semibold text-white">{image.title}</h3>
                          <p className="text-sm text-white/90">{image.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>)}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        <div className="text-center mt-12 lg:mt-16">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <Button asChild variant="cta" size="responsive-lg" className="w-3/5 sm:w-auto">
              <Link to="/gallery">
                View Full Gallery
              </Link>
            </Button>
            <Button asChild variant="cta-outline" size="responsive-lg" className="w-3/5 sm:w-auto">
              <Link to="/request-quote">
                Request Quote
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <ImageModal 
        images={highQualityImages}
        selectedIndex={selectedImageIndex} 
        onClose={handleCloseModal} 
      />
    </section>;
};