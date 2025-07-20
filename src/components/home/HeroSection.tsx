
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ImageModal } from "@/components/gallery/ImageModal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export const HeroSection = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Featured images for the grid display - taking the first 3 images for initial display
  const heroImages = [{
    src: "/lovable-uploads/0703365f-22eb-4c4d-b258-4a2c8a23b63a.png",
    alt: "Rustic venue buffet setup with chafing dishes and atmospheric lighting",
    title: "Formal Events",
    description: "Rustic venue buffet setup with chafing dishes and atmospheric lighting",
    category: "formal"
  }, {
    src: "/lovable-uploads/1dcbc1ee-eb25-4d89-8722-cb4904d1ba69.png",
    alt: "Elegant wedding dessert table with tiered cake, neon signage, and gourmet treats",
    title: "Wedding Reception",
    description: "Elegant wedding dessert table with tiered cake, neon signage, and gourmet treats",
    category: "wedding"
  }, {
    src: "/lovable-uploads/d2ed2f6e-a667-4bf2-9e28-30029d377f94.png",
    alt: "Elegant formal event display with tiered appetizers and beverage service",
    title: "Brunch Events",
    description: "Elegant formal event display with tiered appetizers and beverage service",
    category: "brunch"
  }];

  const additionalImages = [{
    src: "/lovable-uploads/5dd8930c-34cc-4b9e-84a6-beeeb540d35e.png",
    alt: "Wedding dessert table with custom neon sign and tiered cake",
    title: "Dessert Display",
    description: "Wedding dessert table with custom neon sign and tiered cake",
    category: "dessert"
  }, {
    src: "/lovable-uploads/bd4e5565-94d9-4973-bf7b-3deeedbfbe21.png",
    alt: "Elegant appetizer display with beverage service and professional presentation",
    title: "Appetizer Service",
    description: "Elegant appetizer display with beverage service and professional presentation",
    category: "appetizer"
  }];

  // New images for the carousel
  const newCarouselImages = [{
    src: "/lovable-uploads/07027d9a-2f11-458f-ba01-5293e3b9ea99.png",
    alt: "Elegant buffet setup with chafing dishes and floral arrangements",
    title: "Buffet Service",
    description: "Professional buffet setup with chafing dishes and beautiful floral arrangements",
    category: "buffet"
  }, {
    src: "/lovable-uploads/396a0e19-f59d-4114-9cf2-e859757c2064.png",
    alt: "Formal military event dining setup with professional service",
    title: "Corporate Events",
    description: "Formal military event dining setup with professional service",
    category: "corporate"
  }, {
    src: "/lovable-uploads/905958ee-1978-4419-9caa-de23adaf453f.png",
    alt: "Professional chafing dish setup with elegant presentation",
    title: "Catering Setup",
    description: "Professional chafing dish setup with elegant presentation and fresh flowers",
    category: "catering"
  }, {
    src: "/lovable-uploads/97f874a8-d6b5-43d9-913b-11f84e614841.png",
    alt: "Family gathering with delicious buffet spread in home kitchen",
    title: "Family Events",
    description: "Family gathering with delicious buffet spread in beautiful home kitchen",
    category: "family"
  }, {
    src: "/lovable-uploads/ad076245-ec29-4017-90f8-5e048ebae73e.png",
    alt: "Elegant formal dining setup with round tables and floral centerpieces",
    title: "Wedding Reception",
    description: "Elegant formal dining setup with round tables and beautiful floral centerpieces",
    category: "wedding"
  }, {
    src: "/lovable-uploads/78888ca5-52f3-42fc-aa30-28cdd5a027dc.png",
    alt: "Rustic barn venue with chandelier lighting and buffet service",
    title: "Rustic Events",
    description: "Rustic barn venue with chandelier lighting and professional buffet service",
    category: "rustic"
  }, {
    src: "/lovable-uploads/ee29b26a-7421-47bb-94c9-e40e0c4442b7.png",
    alt: "Creative themed dessert display with Nike sneaker decorations",
    title: "Themed Events",
    description: "Creative themed dessert display with custom decorations and cupcakes",
    category: "themed"
  }, {
    src: "/lovable-uploads/dcdc2d94-7b58-4259-8830-94aacec1dce7.png",
    alt: "Elegant appetizer station with tiered displays and fresh flowers",
    title: "Appetizer Station",
    description: "Elegant appetizer station with tiered displays, fresh fruits and beautiful presentation",
    category: "appetizers"
  }, {
    src: "/lovable-uploads/7a467ee0-8a78-4a35-8d30-f6cdcc507d01.png",
    alt: "Beautiful cupcake display with white flowers and elegant decorations",
    title: "Cupcake Display",
    description: "Beautiful cupcake display with white flowers and elegant decorative elements",
    category: "desserts"
  }, {
    src: "/lovable-uploads/b82c916f-28ca-4fb1-95ce-748a678f7e53.png",
    alt: "Outdoor catering setup with chafing dishes and blue ribbon decorations",
    title: "Outdoor Catering",
    description: "Professional outdoor catering setup with chafing dishes and elegant decorations",
    category: "outdoor"
  }, {
    src: "/lovable-uploads/bdc2ea92-a392-4b94-abc0-21399ee77228.png",
    alt: "Outdoor red table setup with chafing dishes and floral garland",
    title: "Garden Party",
    description: "Elegant outdoor red table setup with chafing dishes and beautiful floral garland",
    category: "garden"
  }, {
    src: "/lovable-uploads/ffacec3c-7f69-441c-aaaa-6c418edaf0cd.png",
    alt: "Large scale buffet line setup for formal event",
    title: "Formal Buffet",
    description: "Large scale buffet line setup with multiple chafing dishes for formal events",
    category: "formal"
  }, {
    src: "/lovable-uploads/8e93d858-5343-462c-9f0f-c71306d2fc2c.png",
    alt: "Professional catering station with Soul Train's Eatery branding",
    title: "Branded Service",
    description: "Professional catering station featuring Soul Train's Eatery branded setup",
    category: "branded"
  }];
  
  const allImages = [...heroImages, ...additionalImages, ...newCarouselImages];
  
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };
  
  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  // Get the hero image (first image)
  const heroImage = heroImages[0];
  // Use new carousel images for the carousel section
  const carouselImages = newCarouselImages;

  return (
    <>
      {/* Hero Section */}
      <section className="mb-8 sm:mb-12 md:mb-16 mt-8 sm:mt-12 md:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col">
            
            {/* Subtext Above Image */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="max-w-2xl mx-auto px-2 sm:px-4">
                <p className="text-base sm:text-lg lg:text-xl font-elegant text-foreground leading-relaxed animate-fade-in">
                  Charleston's premier catering experience- where every bit is made with love and served with soul.
                </p>
              </div>
            </div>

            {/* Full-width Hero Image with Title and Buttons Overlay */}
            <div className="relative order-1 md:order-1 mb-6 sm:mb-8">
              {/* Hero Background Image */}
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                <img 
                  src={heroImage.src} 
                  alt={heroImage.alt} 
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                
                {/* Logo and Title Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10 px-4">
                  {/* Logo Icon */}
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20">
                      <img 
                        src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                        alt="Soul Train's Eatery Logo" 
                        className="w-full h-full object-contain hover:scale-110 transition-transform duration-300 drop-shadow-lg brightness-0 invert" 
                      />
                    </div>
                  </div>

                  {/* Main Heading with Script Font */}
                  <div className="mb-4 sm:mb-6">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-script font-bold text-white leading-tight animate-fade-in drop-shadow-lg">
                      Soul Train's Eatery
                    </h1>
                  </div>
                  
                  {/* Decorative line */}
                  <div className="w-20 sm:w-24 lg:w-28 xl:w-32 h-1 bg-gradient-primary mx-auto animate-fade-in drop-shadow-sm" />
                </div>
                
                {/* Click handler for modal */}
                <div 
                  className="absolute inset-0 cursor-pointer z-5"
                  onClick={() => handleImageClick(0)}
                />
              </div>
            </div>

            {/* Additional Images Carousel */}
            {carouselImages.length > 0 && (
              <div className="relative order-2 md:order-2 mb-6 sm:mb-8">
                <div className="max-w-7xl mx-auto">
                  <div className="relative">
                    <Carousel opts={{
                      align: "start",
                      loop: true
                    }} plugins={[Autoplay({
                      delay: 4000
                    })]} className="w-full">
                      <CarouselContent className="-ml-1 gap-2">
                        {carouselImages.map((image, index) => (
                           <CarouselItem key={index + 1} className="pl-1 basis-full sm:basis-1/2 lg:basis-1/4">
                             <div 
                               className="group relative rounded-2xl bg-gradient-card transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-fade-in shadow-glow hover:shadow-glow-strong" 
                               onClick={() => handleImageClick(heroImages.length + additionalImages.length + index)}
                            >
                              <div className="aspect-[16/9] overflow-hidden rounded-2xl">
                                <img 
                                  src={image.src} 
                                  alt={image.alt} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                  loading="lazy" 
                                  decoding="async" 
                                />
                              </div>
                              
                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-4 left-4 right-4">
                                  <h3 className="text-white font-elegant font-semibold text-lg mb-2">
                                    {image.title}
                                  </h3>
                                  <p className="text-white/90 text-sm leading-tight">
                                    Click to view full size
                                  </p>
                                </div>
                              </div>

                              {/* Subtle border effect */}
                              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-2xl transition-colors duration-300"></div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="hidden md:flex -left-12" />
                      <CarouselNext className="hidden md:flex -right-12" />
                    </Carousel>
                  </div>
                </div>
              </div>
            )}

            {/* Call-to-Action Buttons Below Carousel */}
            <div className="flex flex-row gap-2 sm:gap-4 justify-center items-center animate-fade-in w-full sm:w-auto order-3">
              <Button asChild variant="cta" size="default" className="flex-1 sm:flex-none sm:w-56 min-h-[44px] sm:min-h-[52px]">
                <Link to="/request-quote#page-header">
                  Request Quote
                </Link>
              </Button>
              <Button asChild variant="cta-outline" size="default" className="flex-1 sm:flex-none sm:w-56 min-h-[44px] sm:min-h-[52px]">
                <Link to="/gallery#page-header">
                  View Gallery
                </Link>
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Image Modal */}
      <ImageModal images={allImages} selectedIndex={selectedImageIndex} onClose={handleCloseModal} />
    </>
  );
};
