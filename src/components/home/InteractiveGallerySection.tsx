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
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant text-foreground mb-6 text-fade-up">
            Our Gallery Showcase
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto text-fade-up-delay-1">
            Experience the artistry and elegance of Soul Train's catering through our finest moments captured at weddings, corporate events, and special celebrations.
          </p>
        </div>

        <div className="relative px-4 sm:px-8">
          <Carousel opts={{
          align: "start",
          loop: true
        }} plugins={[Autoplay({
          delay: 4000
        })]} className="w-full">
            <CarouselContent className="-ml-1 gap-6 sm:gap-8">
              {highQualityImages.map((image, index) => <CarouselItem key={index} className="pl-1 basis-4/5 sm:basis-2/3 md:basis-1/2 lg:basis-1/3">
                  <Card className="group cursor-pointer bg-gradient-card/90 backdrop-blur-sm border-0 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-6 hover:rotate-2 transform-gpu rounded-2xl" onClick={() => handleImageClick(index)}>
                    <CardContent className="p-0 relative overflow-hidden rounded-2xl">
                      <div className="relative aspect-[4/5]">
                        <img src={image.src} alt={image.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 rounded-2xl" loading="lazy" decoding="async" />
                        
                        {/* Floating overlay with category badge */}
                        <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          {image.category}
                        </div>
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                            <h3 className="font-elegant text-lg font-semibold text-white mb-2 drop-shadow-lg">{image.title}</h3>
                            <p className="text-sm text-white/90 leading-relaxed drop-shadow-sm">{image.description}</p>
                          </div>
                        </div>
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>)}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-6 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground shadow-lg" />
            <CarouselNext className="hidden md:flex -right-6 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground shadow-lg" />
          </Carousel>
        </div>

        <div className="text-center mt-16 lg:mt-20">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <Button asChild variant="cta" size="responsive-lg" className="w-3/5 sm:w-auto sm:min-w-[14rem] hover-float">
              <Link to="/gallery#page-header">
                View Full Gallery
              </Link>
            </Button>
            <Button asChild variant="cta-outline" size="responsive-lg" className="w-3/5 sm:w-auto sm:min-w-[14rem] hover-float">
              <Link to="/request-quote#page-header">
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