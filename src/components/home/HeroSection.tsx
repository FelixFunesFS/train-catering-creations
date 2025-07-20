import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ImageModal } from "@/components/gallery/ImageModal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export const HeroSection = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Featured images for the carousel display
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
  }, {
    src: "/lovable-uploads/92c3b6c8-61dc-4c37-afa8-a0a4db04c551.png",
    alt: "Professional buffet setup with chafing dishes and elegant floral arrangements",
    title: "Corporate Catering",
    description: "Professional buffet setup with chafing dishes and elegant floral arrangements",
    category: "corporate"
  }, {
    src: "/lovable-uploads/2bb3a6cf-e13c-4405-9b69-2cf610ae8411.png",
    alt: "Military formal ceremony with professional service and patriotic atmosphere",
    title: "Military Events",
    description: "Military formal ceremony with professional service and patriotic atmosphere",
    category: "military"
  }, {
    src: "/lovable-uploads/7b66dfbe-2aef-444a-97f3-9c2d0636404c.png",
    alt: "Family gathering around kitchen island with abundant catered spread",
    title: "Family Gatherings",
    description: "Family gathering around kitchen island with abundant catered spread",
    category: "family"
  }, {
    src: "/lovable-uploads/ce12a76f-20cf-449f-8755-4d84cbf1688a.png",
    alt: "Elaborate grazing board with artisanal cheeses, charcuterie, and fresh fruits",
    title: "Grazing Tables",
    description: "Elaborate grazing board with artisanal cheeses, charcuterie, and fresh fruits",
    category: "grazing"
  }, {
    src: "/lovable-uploads/6225467a-567b-4a4e-8f41-181db66e0aaf.png",
    alt: "Elegant outdoor tent setup with sophisticated lighting and table arrangements",
    title: "Outdoor Events",
    description: "Elegant outdoor tent setup with sophisticated lighting and table arrangements",
    category: "outdoor"
  }, {
    src: "/lovable-uploads/cc798395-e8fa-49bd-9fc3-91300bad308d.png",
    alt: "Beautiful indoor venue with round table settings and autumn floral centerpieces",
    title: "Indoor Venues",
    description: "Beautiful indoor venue with round table settings and autumn floral centerpieces",
    category: "indoor"
  }, {
    src: "/lovable-uploads/d26dfcdd-4b5b-4e1a-aca8-1cacbb2ad075.png",
    alt: "Professional catering staff serving from elegant buffet display with variety of dishes",
    title: "Full Service Catering",
    description: "Professional catering staff serving from elegant buffet display with variety of dishes",
    category: "service"
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
  
  const allImages = [...heroImages, ...additionalImages];
  
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };
  
  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  return (
    <>
      {/* Hero Section with Full-Width Card Layout */}
      <section className="mb-8 sm:mb-12 md:mb-16">
        {/* Desktop Full-Width Card */}
        <div className="hidden lg:block">
          <div className="neumorphic-card-3 mx-4 xl:mx-8 rounded-2xl overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 xl:px-12 py-12 xl:py-16">
              
              {/* Brand Header Section */}
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50 rounded-xl"></div>
                
                <div className="relative z-10 text-center">
                  {/* Logo Icon */}
                  <div className="flex justify-center mb-6 animate-fade-in">
                    <div className="neumorphic-card-2 p-4 rounded-full">
                      <div className="h-16 w-16">
                        <img src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" alt="Soul Train's Eatery Logo" className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Main Heading */}
                  <div className="mb-6 animate-fade-in">
                    <h1 className="text-4xl xl:text-6xl font-elegant text-foreground leading-tight">Charleston's Premier Catering Experience</h1>
                  </div>
                  
                  {/* Decorative line */}
                  <div className="w-32 h-1 bg-gradient-primary mx-auto mb-6 animate-fade-in rounded-full" />
                  
                  {/* Subtitle */}
                  <div className="mb-8 animate-fade-in">
                    <p className="text-xl xl:text-3xl text-muted-foreground font-elegant leading-relaxed">Where every bite is made with love and served with soul!</p>
                  </div>
                </div>
              </div>

              {/* Image Gallery Carousel Section */}
              <div className="relative mb-8 animate-fade-in">
                <div className="neumorphic-card-2 p-6 rounded-2xl">
                  <Carousel opts={{
                    align: "start",
                    loop: true
                  }} plugins={[Autoplay({
                    delay: 4000
                  })]} className="w-full">
                    <CarouselContent className="-ml-1 gap-4">
                      {heroImages.map((image, index) => (
                        <CarouselItem key={index} className="pl-1 basis-full md:basis-1/2 lg:basis-1/3">
                          <div 
                            className="neumorphic-card-2 group relative rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden" 
                            onClick={() => handleImageClick(index)}
                          >
                            <div className="aspect-[16/9]">
                              <img src={image.src} alt={image.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading={index < 2 ? "eager" : "lazy"} decoding="async" />
                            </div>
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-4 left-4 right-4 text-left">
                                <h3 className="text-white font-elegant font-semibold text-lg mb-2">
                                  {image.title}
                                </h3>
                                <p className="text-white/90 text-sm leading-tight">
                                  {image.description}
                                </p>
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
              </div>

              {/* Call-to-Action Buttons Section */}
              <div className="text-center animate-fade-in">
                <div className="flex flex-row justify-center items-center gap-6">
                  <Button asChild variant="cta" size="responsive-lg" className="min-w-[14rem]">
                    <Link to="/request-quote#page-header">
                      Request Quote
                    </Link>
                  </Button>
                  <Button asChild variant="cta-outline" size="responsive-lg" className="min-w-[14rem]">
                    <Link to="/gallery#page-header">
                      View Gallery
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="block lg:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col">
              
              {/* Brand Header Section */}
              <div className="relative order-1 my-0 py-0">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50 py-0 my-[25px]"></div>
                
                <div className="relative z-10 text-center pt-2 sm:pt-4 md:pt-12 sm:py-6 py-0">
                  {/* Logo Icon - consistent with PageHeader styling */}
                  <div className="flex justify-center mb-4 my-[25px] animate-fade-in">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14">
                      <img src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" alt="Soul Train's Eatery Logo" className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  {/* Main Heading */}
                  <div className="mb-2 sm:mb-4 animate-fade-in">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant text-foreground leading-tight sm:leading-tight lg:leading-tight">Charleston's Premier Catering Experience</h1>
                  </div>
                  
                  {/* Decorative line */}
                  <div className="w-16 sm:w-20 lg:w-24 xl:w-28 h-1 bg-gradient-primary mx-auto mb-4 sm:mb-6 animate-fade-in" />
                  
                  {/* Subtitle */}
                  <div className="mb-4 sm:mb-6 animate-fade-in">
                    <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground font-elegant leading-relaxed">Where every bite is made with love and served with soul!</p>
                  </div>

                  {/* Image Gallery Carousel Section */}
                  <div className="relative pt-2 sm:pt-2 pb-4 sm:pb-6 lg:pb-8 my-0 py-0 animate-fade-in">
                    <div className="max-w-7xl mx-auto">
                      {/* Responsive Carousel */}
                      <div className="relative">
                        <Carousel opts={{
                        align: "start",
                        loop: true
                      }} plugins={[Autoplay({
                        delay: 4000
                      })]} className="w-full">
                          <CarouselContent className="-ml-1 gap-2">
                          {heroImages.map((image, index) => (
                            <CarouselItem key={index} className="pl-1 basis-full md:basis-1/2 lg:basis-1/3">
                              <div 
                                className="neumorphic-card-2 group relative rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden" 
                                onClick={() => handleImageClick(index)}
                              >
                                <div className="aspect-[16/9]">
                                    <img src={image.src} alt={image.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading={index < 2 ? "eager" : "lazy"} decoding="async" />
                                  </div>
                                  
                                  {/* Hover Overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-4 left-4 right-4 text-left">
                                      <h3 className="text-white font-elegant font-semibold text-lg mb-2 text-left">
                                        {image.title}
                                      </h3>
                                      <p className="text-white/90 text-sm leading-tight text-left">
                                        {image.description}
                                      </p>
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Call-to-Action Buttons Section */}
              <div className="relative order-3 py-0 animate-fade-in">
                <div className="text-center pb-4 sm:pb-6 lg:pb-8">
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 animate-fade-in">
                    <Button asChild variant="cta" size="responsive-lg" className="w-3/5 sm:w-auto sm:min-w-[14rem]">
                      <Link to="/request-quote#page-header">
                        Request Quote
                      </Link>
                    </Button>
                    <Button asChild variant="cta-outline" size="responsive-lg" className="w-3/5 sm:w-auto sm:min-w-[14rem]">
                      <Link to="/gallery#page-header">
                        View Gallery
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <ImageModal images={allImages} selectedIndex={selectedImageIndex} onClose={handleCloseModal} />
    </>
  );
};
