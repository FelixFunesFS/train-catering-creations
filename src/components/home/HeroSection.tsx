
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
    src: "/lovable-uploads/1dcbc1ee-eb25-4d89-8722-cb4904d1ba69.png",
    alt: "Elegant wedding dessert table with tiered cake, neon signage, and gourmet treats",
    title: "Wedding Reception",
    description: "Elegant wedding dessert table with tiered cake, neon signage, and gourmet treats",
    category: "wedding"
  }, {
    src: "/lovable-uploads/0703365f-22eb-4c4d-b258-4a2c8a23b63a.png",
    alt: "Rustic venue buffet setup with chafing dishes and atmospheric lighting",
    title: "Formal Events",
    description: "Rustic venue buffet setup with chafing dishes and atmospheric lighting",
    category: "formal"
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

  const newCarouselImages = [{
    src: "/lovable-uploads/1923d181-eca9-4c42-ad11-d326882e76e6.png",
    alt: "Professional buffet setup with chafing dishes and floral arrangements",
    title: "Buffet Service",
    description: "Professional buffet setup with chafing dishes and floral arrangements",
    category: "buffet"
  }, {
    src: "/lovable-uploads/280923c4-2558-449c-ad58-ba126a47a483.png",
    alt: "Formal corporate dining event with professional presentation",
    title: "Corporate Events",
    description: "Formal corporate dining event with professional presentation",
    category: "corporate"
  }, {
    src: "/lovable-uploads/411de873-521e-4e4e-b3c7-5c7ee84afa58.png",
    alt: "Elegant chafing dish setup with fresh floral decorations",
    title: "Elegant Setup",
    description: "Elegant chafing dish setup with fresh floral decorations",
    category: "formal"
  }, {
    src: "/lovable-uploads/d4d8b044-bc80-493d-a58f-a458876787f4.png",
    alt: "Diverse buffet spread with multiple course options and elegant presentation",
    title: "Full Menu",
    description: "Diverse buffet spread with multiple course options and elegant presentation",
    category: "buffet"
  }, {
    src: "/lovable-uploads/75b58f89-c2b3-4caf-b735-9da472b8293c.png",
    alt: "Family gathering around kitchen island with catered meal spread",
    title: "Family Style",
    description: "Family gathering around kitchen island with catered meal spread",
    category: "family"
  }, {
    src: "/lovable-uploads/724b58b9-8c4e-4a94-878e-b7a0a42e78ea.png",
    alt: "Elaborate charcuterie and grazing board with artisanal selections",
    title: "Grazing Boards",
    description: "Elaborate charcuterie and grazing board with artisanal selections",
    category: "grazing"
  }, {
    src: "/lovable-uploads/4bfab73f-3d37-46d4-aa4b-4b4d159c91b2.png",
    alt: "Outdoor wedding tent setup with elegant table arrangements",
    title: "Outdoor Events",
    description: "Outdoor wedding tent setup with elegant table arrangements",
    category: "wedding"
  }, {
    src: "/lovable-uploads/0adf0de5-126b-4189-95c2-75704f5f18d3.png",
    alt: "Elegant indoor event venue with crystal chandelier and formal table settings",
    title: "Luxury Venues",
    description: "Elegant indoor event venue with crystal chandelier and formal table settings",
    category: "formal"
  }, {
    src: "/lovable-uploads/8e016abd-f55f-475d-9e0c-8c2e6fae8c81.png",
    alt: "Professional catering staff providing excellent food service",
    title: "Professional Service",
    description: "Professional catering staff providing excellent food service",
    category: "team"
  }];
  
  const allImages = [...heroImages, ...additionalImages, ...newCarouselImages];
  
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };
  
  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="mb-8 sm:mb-12 md:mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col">
            
            {/* Brand Header Section */}
            <div className="relative order-1 md:order-1 my-0 py-0">
              {/* Subtle background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50 py-0 my-[25px]"></div>
              
              <div className="relative z-10 text-center pt-2 sm:pt-4 md:pt-12 sm:py-6 lg:py-0 py-0">
                {/* Main Heading */}
                <div className="mb-2 sm:mb-4 animate-fade-in">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant text-foreground leading-tight sm:leading-tight lg:leading-tight">Charleston's Premier Catering Experience</h1>
                </div>
                
                {/* Subtitle */}
                <div className="mb-4 sm:mb-6 animate-fade-in">
                  <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground font-elegant leading-relaxed">Where every bite is made with love and served with soul!</p>
                </div>
                
                {/* Decorative line */}
                <div className="w-16 sm:w-20 lg:w-24 xl:w-28 h-1 bg-gradient-primary mx-auto mb-4 sm:mb-6 animate-fade-in" />

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
                              className="group relative rounded-2xl bg-gradient-card transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-fade-in shadow-glow hover:shadow-glow-strong" 
                              onClick={() => handleImageClick(index)}
                            >
                              <div className="aspect-[16/9] overflow-hidden rounded-2xl">
                                  <img src={image.src} alt={image.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading={index < 2 ? "eager" : "lazy"} decoding="async" />
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

              </div>
            </div>

            {/* Additional Gallery Carousel Section */}
            <div className="relative order-2 md:order-2 py-4 animate-fade-in">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
                <Carousel opts={{
                  align: "start",
                  loop: true
                }} plugins={[Autoplay({
                  delay: 3500
                })]} className="w-full">
                  <CarouselContent className="-ml-0 gap-1 md:gap-2">
                    <CarouselItem className="pl-0 md:pl-1 basis-1/2 md:basis-1/4 lg:basis-1/5">
                      <div 
                        className="group relative rounded-2xl bg-gradient-card transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-fade-in shadow-glow hover:shadow-glow-strong" 
                        onClick={() => handleImageClick(5)}
                      >
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                          <img src="/lovable-uploads/1923d181-eca9-4c42-ad11-d326882e76e6.png" alt="Professional buffet setup with chafing dishes and floral arrangements" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-elegant font-semibold text-sm mb-1">Buffet Service</h3>
                            <p className="text-white/90 text-xs leading-tight">Tap to view full size</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-2xl transition-colors duration-300"></div>
                      </div>
                    </CarouselItem>
                    
                    <CarouselItem className="pl-0 md:pl-1 basis-1/2 md:basis-1/4 lg:basis-1/5">
                      <div 
                        className="group relative rounded-2xl bg-gradient-card transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-fade-in shadow-glow hover:shadow-glow-strong" 
                        onClick={() => handleImageClick(6)}
                      >
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                          <img src="/lovable-uploads/280923c4-2558-449c-ad58-ba126a47a483.png" alt="Formal corporate dining event with professional presentation" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-elegant font-semibold text-sm mb-1">Corporate Events</h3>
                            <p className="text-white/90 text-xs leading-tight">Tap to view full size</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-2xl transition-colors duration-300"></div>
                      </div>
                    </CarouselItem>

                    <CarouselItem className="pl-0 md:pl-1 basis-1/2 md:basis-1/4 lg:basis-1/5">
                      <div 
                        className="group relative rounded-2xl bg-gradient-card transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-fade-in shadow-glow hover:shadow-glow-strong" 
                        onClick={() => handleImageClick(7)}
                      >
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                          <img src="/lovable-uploads/411de873-521e-4e4e-b3c7-5c7ee84afa58.png" alt="Elegant chafing dish setup with fresh floral decorations" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-elegant font-semibold text-sm mb-1">Elegant Setup</h3>
                            <p className="text-white/90 text-xs leading-tight">Tap to view full size</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-2xl transition-colors duration-300"></div>
                      </div>
                    </CarouselItem>

                    <CarouselItem className="pl-0 md:pl-1 basis-1/2 md:basis-1/4 lg:basis-1/5">
                      <div 
                        className="group relative rounded-2xl bg-gradient-card transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-fade-in shadow-glow hover:shadow-glow-strong" 
                        onClick={() => handleImageClick(8)}
                      >
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                          <img src="/lovable-uploads/d4d8b044-bc80-493d-a58f-a458876787f4.png" alt="Diverse buffet spread with multiple course options and elegant presentation" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-elegant font-semibold text-sm mb-1">Full Menu</h3>
                            <p className="text-white/90 text-xs leading-tight">Tap to view full size</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-2xl transition-colors duration-300"></div>
                      </div>
                    </CarouselItem>

                    <CarouselItem className="pl-0 md:pl-1 basis-1/2 md:basis-1/4 lg:basis-1/5">
                      <div 
                        className="group relative rounded-2xl bg-gradient-card transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-fade-in shadow-glow hover:shadow-glow-strong" 
                        onClick={() => handleImageClick(9)}
                      >
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                          <img src="/lovable-uploads/75b58f89-c2b3-4caf-b735-9da472b8293c.png" alt="Family gathering around kitchen island with catered meal spread" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-elegant font-semibold text-sm mb-1">Family Style</h3>
                            <p className="text-white/90 text-xs leading-tight">Tap to view full size</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-2xl transition-colors duration-300"></div>
                      </div>
                    </CarouselItem>

                    <CarouselItem className="pl-0 md:pl-1 basis-1/2 md:basis-1/4 lg:basis-1/5">
                      <div 
                        className="group relative rounded-2xl bg-gradient-card transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-fade-in shadow-glow hover:shadow-glow-strong" 
                        onClick={() => handleImageClick(10)}
                      >
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                          <img src="/lovable-uploads/724b58b9-8c4e-4a94-878e-b7a0a42e78ea.png" alt="Elaborate charcuterie and grazing board with artisanal selections" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-elegant font-semibold text-sm mb-1">Grazing Boards</h3>
                            <p className="text-white/90 text-xs leading-tight">Tap to view full size</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-2xl transition-colors duration-300"></div>
                      </div>
                    </CarouselItem>

                    <CarouselItem className="pl-0 md:pl-1 basis-1/2 md:basis-1/4 lg:basis-1/5">
                      <div 
                        className="group relative rounded-2xl bg-gradient-card transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-fade-in shadow-glow hover:shadow-glow-strong" 
                        onClick={() => handleImageClick(11)}
                      >
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                          <img src="/lovable-uploads/4bfab73f-3d37-46d4-aa4b-4b4d159c91b2.png" alt="Outdoor wedding tent setup with elegant table arrangements" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-elegant font-semibold text-sm mb-1">Outdoor Events</h3>
                            <p className="text-white/90 text-xs leading-tight">Tap to view full size</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-2xl transition-colors duration-300"></div>
                      </div>
                    </CarouselItem>

                    <CarouselItem className="pl-0 md:pl-1 basis-1/2 md:basis-1/4 lg:basis-1/5">
                      <div 
                        className="group relative rounded-2xl bg-gradient-card transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-fade-in shadow-glow hover:shadow-glow-strong" 
                        onClick={() => handleImageClick(12)}
                      >
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                          <img src="/lovable-uploads/0adf0de5-126b-4189-95c2-75704f5f18d3.png" alt="Elegant indoor event venue with crystal chandelier and formal table settings" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-elegant font-semibold text-sm mb-1">Luxury Venues</h3>
                            <p className="text-white/90 text-xs leading-tight">Tap to view full size</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-2xl transition-colors duration-300"></div>
                      </div>
                    </CarouselItem>

                    <CarouselItem className="pl-0 md:pl-1 basis-1/2 md:basis-1/4 lg:basis-1/5">
                      <div 
                        className="group relative rounded-2xl bg-gradient-card transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-fade-in shadow-glow hover:shadow-glow-strong" 
                        onClick={() => handleImageClick(13)}
                      >
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                          <img src="/lovable-uploads/8e016abd-f55f-475d-9e0c-8c2e6fae8c81.png" alt="Professional catering staff providing excellent food service" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-elegant font-semibold text-sm mb-1">Professional Service</h3>
                            <p className="text-white/90 text-xs leading-tight">Tap to view full size</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-2xl transition-colors duration-300"></div>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:flex -left-12" />
                  <CarouselNext className="hidden md:flex -right-12" />
                </Carousel>
              </div>
            </div>

            {/* Call-to-Action Buttons Section */}
            <div className="relative order-3 md:order-3 py-0 animate-fade-in">
              <div className="text-center pb-4 sm:pb-6 lg:pb-8">
                <div className="flex flex-row gap-2 sm:gap-4 justify-center items-center animate-fade-in w-full sm:w-auto">
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
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <ImageModal images={allImages} selectedIndex={selectedImageIndex} onClose={handleCloseModal} />
    </>
  );
};
