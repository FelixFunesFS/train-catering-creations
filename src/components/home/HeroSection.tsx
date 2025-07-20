import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ImageModal } from "@/components/gallery/ImageModal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { MagneticTagline } from "./MagneticTagline";

export const HeroSection = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [lineAnimationActive, setLineAnimationActive] = useState(true);

  // Stop line animation after 3 seconds
  useEffect(() => {
    const lineTimer = setTimeout(() => {
      setLineAnimationActive(false);
    }, 3000);

    return () => clearTimeout(lineTimer);
  }, []);

  const handleTaglineComplete = () => {
    console.log('Tagline animation completed');
  };

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
  
  const allImages = [...heroImages, ...additionalImages];
  
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
                
                {/* Main Heading with Neumorph Shadow */}
                <div className="mb-2 sm:mb-4 animate-fade-in">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant text-foreground leading-tight sm:leading-tight lg:leading-tight shadow-neumorph-text">Charleston's Premier Catering Experience</h1>
                </div>
                
                {/* Decorative line with animated neumorph shadow */}
                <div className={`w-16 sm:w-20 lg:w-24 xl:w-28 h-1 bg-gradient-primary mx-auto mb-4 sm:mb-6 animate-fade-in shadow-neumorph ${lineAnimationActive ? 'animate-line-glow' : ''}`} />
                
                {/* Animated Tagline with Framer Motion */}
                <div className="mb-4 sm:mb-6 min-h-[4rem] sm:min-h-[5rem] flex flex-wrap justify-center items-center perspective-1000 leading-relaxed">
                  <MagneticTagline 
                    text="Where every bite is made with love and served with soul!"
                    onAnimationComplete={handleTaglineComplete}
                  />
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
                              className="group relative rounded-2xl bg-gradient-card transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-fade-in shadow-neumorph-card hover:shadow-neumorph-hover" 
                              onClick={() => handleImageClick(index)}
                            >
                              <div className="aspect-[16/9] overflow-hidden rounded-2xl">
                                  <img src={image.src} alt={image.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading={index < 2 ? "eager" : "lazy"} decoding="async" />
                                </div>
                                
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-white font-elegant font-semibold text-lg mb-2 shadow-neumorph-text">
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

            {/* Call-to-Action Buttons Section */}
            <div className="relative order-3 md:order-3 py-0 animate-fade-in">
              <div className="text-center pb-4 sm:pb-6 lg:pb-8">
                <div className="flex flex-row gap-2 sm:gap-4 justify-center items-center animate-fade-in w-full sm:w-auto">
                  <Button asChild variant="cta" size="responsive-sm" className="flex-1 sm:w-auto sm:min-w-[8rem] shadow-neumorph-button hover:shadow-neumorph-hover">
                    <Link to="/request-quote#page-header">
                      Request Quote
                    </Link>
                  </Button>
                  <Button asChild variant="cta-outline" size="responsive-sm" className="flex-1 sm:w-auto sm:min-w-[8rem] shadow-neumorph-button hover:shadow-neumorph-hover">
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
