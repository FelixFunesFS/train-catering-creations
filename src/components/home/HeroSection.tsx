import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ImageModal } from "@/components/gallery/ImageModal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { SectionContentCard } from "@/components/ui/section-content-card";
import Autoplay from "embla-carousel-autoplay";
export const HeroSection = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

  // Background carousel images - using the 4 new uploaded images
  const backgroundImages = [
    "/lovable-uploads/65fe181d-cecf-4057-b1be-7e6f86970219.png", // Elegant buffet setup with chafing dishes and flowers
    "/lovable-uploads/741ca496-e7de-4e42-b68f-484f65666b7b.png", // Elaborate grazing table with fruits and cheeses
    "/lovable-uploads/e32cd95d-ef80-4603-af4c-4b08c3d0593c.png", // Elegant event venue with multiple round tables
    "/lovable-uploads/40e903e4-1df5-4330-92d1-2b3f243aa734.png", // Appetizer station with gourmet hors d'oeuvres
  ];

  // Auto-rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);
  const heroImages = [{
    src: "/lovable-uploads/fab5b1da-b317-4374-b52e-46581108e4f2.png",
    alt: "Elegant buffet setup with chafing dishes and beautiful floral arrangements",
    title: "Elegant Buffet Service",
    description: "Professional buffet setup with chafing dishes and beautiful floral arrangements",
    category: "buffet"
  }, {
    src: "/lovable-uploads/c0634f86-f070-461c-b61c-70f2175524ba.png",
    alt: "Close-up of professional chafing dish with red roses and elegant table setting",
    title: "Professional Equipment",
    description: "High-quality chafing dishes with elegant floral decorations",
    category: "equipment"
  }, {
    src: "/lovable-uploads/a05776de-0777-4ed9-8e63-0828d6bdcc2b.png",
    alt: "Wedding reception venue with gold chair covers and elegant table settings",
    title: "Wedding Reception Setup",
    description: "Beautiful wedding venue with gold accents and professional table arrangements",
    category: "wedding"
  }, {
    src: "/lovable-uploads/76497407-a3da-4ff0-a4bd-6d44f6c6a291.png",
    alt: "Elaborate grazing table with fresh fruits, artisanal cheeses, and gourmet selections",
    title: "Gourmet Grazing Table",
    description: "Stunning grazing table featuring fresh fruits, artisanal cheeses, and premium selections",
    category: "grazing"
  }, {
    src: "/lovable-uploads/995f0f1c-4128-48ca-a653-ac0ef9667f0c.png",
    alt: "Corporate catering setup with fresh vegetable display and chafing dishes",
    title: "Corporate Catering",
    description: "Professional corporate catering with fresh vegetable displays and hot food service",
    category: "corporate"
  }, {
    src: "/lovable-uploads/dcb381d4-b913-4151-852c-dc149335f666.png",
    alt: "Creative themed dessert table with custom decorations and specialty cupcakes",
    title: "Themed Events",
    description: "Custom themed catering with creative decorations and specialty desserts",
    category: "themed"
  }, {
    src: "/lovable-uploads/f569af07-9bdd-4e2f-8fa0-50f4f58284fc.png",
    alt: "Elegant outdoor catering setup with chafing dishes and white floral arrangements",
    title: "Outdoor Elegance",
    description: "Sophisticated outdoor catering with professional equipment and floral design",
    category: "outdoor"
  }, {
    src: "/lovable-uploads/31e1538d-1b06-45be-bef9-619e023d3dc4.png",
    alt: "Appetizer station with gourmet hors d'oeuvres and elegant presentation",
    title: "Appetizer Service",
    description: "Exquisite appetizer displays with gourmet hors d'oeuvres and professional presentation",
    category: "appetizers"
  }, {
    src: "/lovable-uploads/ba9526e9-a12e-4ea8-8e2a-450595002e23.png",
    alt: "Memorial celebration dessert table with blue theme and decorative elements",
    title: "Memorial Celebrations",
    description: "Thoughtfully designed memorial celebration with custom themed dessert display",
    category: "memorial"
  }, {
    src: "/lovable-uploads/c490314a-af9a-49e5-9951-8604a90471cc.png",
    alt: "Professional catering staff showcasing buffet setup with multiple hot dishes",
    title: "Full Service Team",
    description: "Dedicated catering professionals providing full-service buffet management",
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
  return <>
      {/* Hero Section - Brand Header Only */}
      <section className="relative bg-cover bg-center bg-no-repeat overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0">
          {backgroundImages.map((bgImage, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
                index === currentBackgroundIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url('${bgImage}')`
              }}
            />
          ))}
        </div>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70 my-0 py-0"></div>
        <div className="max-w-7xl mx-auto px-6 xl:px-12 py-16 xl:py-24">
          {/* Brand Header Section with larger typography */}
          <div className="relative text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-30 rounded-xl"></div>
            
            <div className="relative z-10">
              {/* Logo Icon - Silver gradient effect */}
              <div className="flex justify-center mb-8 sm:mb-10 animate-fade-in">
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-28 lg:w-28 relative">
                    <img src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" alt="Soul Train's Eatery Logo" className="w-full h-full object-contain hover:scale-110 transition-transform duration-300 filter brightness-0 invert" style={{
                    filter: 'brightness(0) invert(1) drop-shadow(0 0 12px rgba(192, 192, 192, 0.9))'
                  }} />
                  </div>
                </div>
              </div>
              
              {/* Main Heading with larger typography */}
              <div className="mb-6 sm:mb-8 animate-fade-in">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-elegant font-bold text-white leading-tight drop-shadow-lg">
                  Charleston's Premier Catering Experience
                </h1>
              </div>
              
              {/* Decorative line */}
              <div className="w-20 sm:w-32 lg:w-40 h-1.5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 mx-auto mb-6 sm:mb-8 animate-fade-in rounded-full shadow-sm" />
              
              {/* Subtitle with larger sizing and neumorphic effect */}
              <div className="mb-8 sm:mb-12 animate-fade-in">
                <div className="inline-block px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_8px_32px_rgba(0,0,0,0.3)]">
                  <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-white/95 font-elegant leading-relaxed">
                    Where every bite is made with love and served with soul!
                  </p>
                </div>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="text-center animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
                  <Button asChild size="lg">
                    <Link to="/request-quote#page-header">
                      Request Quote
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="lg">
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

      {/* Gallery Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 xl:px-12">
          {/* Image Gallery Carousel Section */}
          <div className="relative animate-fade-in">
            <Carousel opts={{
            align: "start",
            loop: true
          }} plugins={[Autoplay({
            delay: 4000
          })]} className="w-full">
              <CarouselContent className="-ml-1 gap-3 sm:gap-4">
                {heroImages.map((image, index) => <CarouselItem key={index} className="pl-1 basis-full md:basis-1/2 lg:basis-1/3">
                    <div className="group neumorphic-card-2 hover:neumorphic-card-3 p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300" onClick={() => handleImageClick(index)}>
                      <div className="relative rounded-xl overflow-hidden">
                        <div className="aspect-[16/9]">
                          <img src={image.src} alt={image.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading={index < 2 ? "eager" : "lazy"} decoding="async" />
                        </div>
                        
                        {/* Hover Overlay */}
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
                  </CarouselItem>)}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12" />
              <CarouselNext className="hidden md:flex -right-12" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <ImageModal images={allImages} selectedIndex={selectedImageIndex} onClose={handleCloseModal} />
    </>;
};