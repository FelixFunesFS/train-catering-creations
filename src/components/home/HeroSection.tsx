import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ImageModal } from "@/components/gallery/ImageModal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { SectionContentCard } from "@/components/ui/section-content-card";
import Autoplay from "embla-carousel-autoplay";

export const HeroSection = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const heroImages = [
    {
      src: "/lovable-uploads/0703365f-22eb-4c4d-b258-4a2c8a23b63a.png",
      alt: "Rustic venue buffet setup with chafing dishes and atmospheric lighting",
      title: "Formal Events",
      description: "Rustic venue buffet setup with chafing dishes and atmospheric lighting",
      category: "formal"
    },
    {
      src: "/lovable-uploads/1dcbc1ee-eb25-4d89-8722-cb4904d1ba69.png",
      alt: "Elegant wedding dessert table with tiered cake, neon signage, and gourmet treats",
      title: "Wedding Reception",
      description: "Elegant wedding dessert table with tiered cake, neon signage, and gourmet treats",
      category: "wedding"
    },
    {
      src: "/lovable-uploads/d2ed2f6e-a667-4bf2-9e28-30029d377f94.png",
      alt: "Elegant formal event display with tiered appetizers and beverage service",
      title: "Brunch Events",
      description: "Elegant formal event display with tiered appetizers and beverage service",
      category: "brunch"
    },
    {
      src: "/lovable-uploads/92c3b6c8-61dc-4c37-afa8-a0a4db04c551.png",
      alt: "Professional buffet setup with chafing dishes and elegant floral arrangements",
      title: "Corporate Catering",
      description: "Professional buffet setup with chafing dishes and elegant floral arrangements",
      category: "corporate"
    },
    {
      src: "/lovable-uploads/2bb3a6cf-e13c-4405-9b69-2cf610ae8411.png",
      alt: "Military formal ceremony with professional service and patriotic atmosphere",
      title: "Military Events",
      description: "Military formal ceremony with professional service and patriotic atmosphere",
      category: "military"
    },
    {
      src: "/lovable-uploads/7b66dfbe-2aef-444a-97f3-9c2d0636404c.png",
      alt: "Family gathering around kitchen island with abundant catered spread",
      title: "Family Gatherings",
      description: "Family gathering around kitchen island with abundant catered spread",
      category: "family"
    },
    {
      src: "/lovable-uploads/ce12a76f-20cf-449f-8755-4d84cbf1688a.png",
      alt: "Elaborate grazing board with artisanal cheeses, charcuterie, and fresh fruits",
      title: "Grazing Tables",
      description: "Elaborate grazing board with artisanal cheeses, charcuterie, and fresh fruits",
      category: "grazing"
    },
    {
      src: "/lovable-uploads/6225467a-567b-4a4e-8f41-181db66e0aaf.png",
      alt: "Elegant outdoor tent setup with sophisticated lighting and table arrangements",
      title: "Outdoor Events",
      description: "Elegant outdoor tent setup with sophisticated lighting and table arrangements",
      category: "outdoor"
    },
    {
      src: "/lovable-uploads/cc798395-e8fa-49bd-9fc3-91300bad308d.png",
      alt: "Beautiful indoor venue with round table settings and autumn floral centerpieces",
      title: "Indoor Venues",
      description: "Beautiful indoor venue with round table settings and autumn floral centerpieces",
      category: "indoor"
    },
    {
      src: "/lovable-uploads/d26dfcdd-4b5b-4e1a-aca8-1cacbb2ad075.png",
      alt: "Professional catering staff serving from elegant buffet display with variety of dishes",
      title: "Full Service Catering",
      description: "Professional catering staff serving from elegant buffet display with variety of dishes",
      category: "service"
    }
  ];

  const additionalImages = [
    {
      src: "/lovable-uploads/5dd8930c-34cc-4b9e-84a6-beeeb540d35e.png",
      alt: "Wedding dessert table with custom neon sign and tiered cake",
      title: "Dessert Display",
      description: "Wedding dessert table with custom neon sign and tiered cake",
      category: "dessert"
    },
    {
      src: "/lovable-uploads/bd4e5565-94d9-4973-bf7b-3deeedbfbe21.png",
      alt: "Elegant appetizer display with beverage service and professional presentation",
      title: "Appetizer Service",
      description: "Elegant appetizer display with beverage service and professional presentation",
      category: "appetizer"
    }
  ];
  
  const allImages = [...heroImages, ...additionalImages];
  
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };
  
  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  return (
    <>
      <section className="bg-gradient-to-br from-red-800 via-red-700 to-red-900 neumorphic-card-3 rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 sm:my-8">
        <div className="max-w-7xl mx-auto px-6 xl:px-12 py-12 xl:py-16">
          {/* Brand Header Section with mobile-optimized typography */}
          <div className="relative mb-6 sm:mb-8 pt-8 sm:pt-12 lg:pt-16">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-30 rounded-xl"></div>
            
            <div className="relative z-10 text-center">
              {/* Logo Icon - No background square, silver gradient effect */}
              <div className="flex justify-center mb-4 sm:mb-6 animate-fade-in">
                <div className="p-4 sm:p-5 lg:p-6">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 relative">
                    <img 
                      src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                      alt="Soul Train's Eatery Logo" 
                      className="w-full h-full object-contain hover:scale-110 transition-transform duration-300 filter brightness-0 invert"
                      style={{
                        filter: 'brightness(0) invert(1) drop-shadow(0 0 8px rgba(192, 192, 192, 0.8))'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Main Heading with mobile-first typography and high contrast */}
              <div className="mb-4 sm:mb-6 animate-fade-in">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-white leading-tight drop-shadow-lg">
                  Charleston's Premier Catering Experience
                </h1>
              </div>
              
              {/* Decorative line */}
              <div className="w-16 sm:w-24 lg:w-32 h-1 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 mx-auto mb-4 sm:mb-6 animate-fade-in rounded-full shadow-sm" />
              
              {/* Subtitle with mobile-optimized sizing and high contrast */}
              <div className="mb-6 sm:mb-8 animate-fade-in">
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-white/95 font-elegant leading-relaxed drop-shadow-md">
                  Where every bite is made with love and served with soul!
                </p>
              </div>
            </div>
          </div>

          {/* Image Gallery Carousel Section */}
          <div className="relative mb-6 sm:mb-8 animate-fade-in">
            <Carousel 
              opts={{
                align: "start",
                loop: true
              }} 
              plugins={[Autoplay({
                delay: 4000
              })]} 
              className="w-full"
            >
              <CarouselContent className="-ml-1 gap-3 sm:gap-4">
                {heroImages.map((image, index) => (
                  <CarouselItem key={index} className="pl-1 basis-full md:basis-1/2 lg:basis-1/3">
                    <div 
                      className="group neumorphic-card-2 hover:neumorphic-card-3 p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300" 
                      onClick={() => handleImageClick(index)}
                    >
                      <div className="relative rounded-xl overflow-hidden">
                        <div className="aspect-[16/9]">
                          <img 
                            src={image.src} 
                            alt={image.alt} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            loading={index < 2 ? "eager" : "lazy"} 
                            decoding="async" 
                          />
                        </div>
                        
                        {/* Hover Overlay with mobile-optimized text */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-left">
                            <h3 className="text-white font-elegant font-semibold text-base sm:text-lg mb-1 sm:mb-2">
                              {image.title}
                            </h3>
                            <p className="text-white/90 text-xs sm:text-sm leading-tight">
                              {image.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12" />
              <CarouselNext className="hidden md:flex -right-12" />
            </Carousel>
          </div>

          {/* Call-to-Action Buttons Section with improved accessibility */}
          <div className="text-center animate-fade-in pb-8 sm:pb-12 lg:pb-16">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              {/* Primary CTA with silver gradient for high contrast */}
              <Button 
                asChild 
                variant="ghost" 
                size="responsive-lg" 
                className="w-4/5 sm:w-auto sm:min-w-[14rem] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 text-gray-900 font-bold border-0 hover:from-gray-300 hover:via-gray-200 hover:to-gray-400 hover:text-gray-800 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              >
                <Link to="/request-quote#page-header">
                  Request Quote
                </Link>
              </Button>
              
              {/* Secondary CTA with transparent background and white text */}
              <Button 
                asChild 
                variant="ghost" 
                size="responsive-lg" 
                className="w-4/5 sm:w-auto sm:min-w-[14rem] bg-transparent border-2 border-white text-white font-semibold hover:bg-white/20 hover:text-white backdrop-blur-sm shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
              >
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
