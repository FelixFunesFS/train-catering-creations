import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { useEffect, useState, useRef } from "react";
import Autoplay from "embla-carousel-autoplay";

export const HeroSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayRef = useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    })
  );

  const heroImages = [
    {
      src: "/lovable-uploads/ca9734ef-7643-4b4c-913b-eeec8c80237d.png",
      alt: "Professional chafing dishes setup with elegant catering display",
      position: "object-center"
    },
    {
      src: "/lovable-uploads/324100be-b134-4222-a2cf-4667ed370b98.png", 
      alt: "Elegant event space with white chair covers and gold accents",
      position: "object-center"
    },
    {
      src: "/lovable-uploads/ad203b16-cedb-430a-be39-c32a262ebebd.png",
      alt: "Artisanal grazing board with fresh fruits, premium cheeses, and gourmet selections",
      position: "object-center"
    },
    {
      src: "/lovable-uploads/ed173b87-f34a-40e4-848c-44cd6fca316f.png",
      alt: "Elaborate charcuterie display with artisanal breads, cheeses, and fresh accompaniments",
      position: "object-center"
    },
    {
      src: "/lovable-uploads/9332d2dd-3c00-48bb-ba3d-17b943a78ad2.png",
      alt: "Grand formal event space with multiple tables and floral arrangements",
      position: "object-top"
    },
    {
      src: "/lovable-uploads/cb0a7324-9db0-427f-b582-e49bb5c15f87.png",
      alt: "Professional buffet service with grilled specialties and hot entrees",
      position: "object-center"
    },
    {
      src: "/lovable-uploads/ae0c2001-6164-4fc6-9163-6219c2aa790e.png",
      alt: "Outdoor tent wedding reception with elegant table settings and lighting",
      position: "object-center"
    },
    {
      src: "/lovable-uploads/0703365f-22eb-4c4d-b258-4a2c8a23b63a.png",
      alt: "Rustic venue buffet setup with chafing dishes and atmospheric lighting",
      position: "object-center"
    },
    {
      src: "/lovable-uploads/5dd8930c-34cc-4b9e-84a6-beeeb540d35e.png",
      alt: "Wedding dessert table with custom neon sign and tiered cake",
      position: "object-center"
    },
    {
      src: "/lovable-uploads/bd4e5565-94d9-4973-bf7b-3deeedbfbe21.png",
      alt: "Elegant appetizer display with beverage service and professional presentation",
      position: "object-center"
    }
  ];

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    setCurrent(api.selectedScrollSnap());

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const handleDotClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  return (
    <section className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Hero Image Carousel */}
      <div 
        className="lg:w-[55%] h-80 sm:h-96 lg:h-screen relative overflow-hidden border-r border-border/20 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Carousel
          setApi={setApi}
          plugins={[autoplayRef.current]}
          className="w-full h-full"
          opts={{
            loop: true,
            align: "start",
          }}
        >
          <CarouselContent className="h-full">
            {heroImages.map((image, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="relative h-full overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className={`w-full h-full object-cover ${image.position} brightness-125 contrast-110 saturate-110 transition-transform duration-700 ease-out ${isHovered ? 'scale-105' : 'scale-100'}`}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  {/* Optimized gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/15 to-transparent"></div>
                  {/* Subtle red-tinted overlay for brand consistency */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent"></div>
                  {/* Enhanced readability overlay on text side */}
                  <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black/20 to-transparent lg:hidden"></div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        {/* Interactive navigation dots */}
        <div 
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10"
          role="tablist"
          aria-label="Hero image carousel navigation"
        >
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 rounded-full backdrop-blur-sm border transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-black/20 ${
                current === index
                  ? 'bg-primary border-primary/50 shadow-lg shadow-primary/30 scale-110'
                  : 'bg-white/60 border-white/40 hover:bg-white/80 shadow-md'
              }`}
              role="tab"
              aria-selected={current === index}
              aria-label={`View image ${index + 1}: ${heroImages[index].alt}`}
            />
          ))}
        </div>

        {/* Pause indicator for accessibility */}
        {isHovered && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium z-10 animate-fade-in">
            Paused
          </div>
        )}
      </div>

      {/* Right Side - Content */}
      <div className="lg:w-[45%] bg-background/95 backdrop-blur-sm flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-20 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20 opacity-50"></div>
        
        <div className="max-w-2xl mx-auto lg:mx-0 relative z-10">
          {/* Title with enhanced typography */}
          <div className="mb-10 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-elegant font-bold text-foreground leading-[0.9] tracking-tight animate-fade-in">
              Soul Train's <span className="text-primary bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Eatery</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary-glow rounded-full animate-fade-in"></div>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed font-medium animate-fade-in max-w-lg">
              Where passion meets Southern hospitality. Elegant catering for weddings, black tie events, and memorable celebrations in Charleston's Lowcountry.
            </p>
          </div>

          {/* Enhanced Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
            <Link to="/request-quote" className="group">
              <Button className="bg-primary hover:bg-primary-glow text-primary-foreground px-10 py-5 text-lg font-semibold shadow-elegant hover:shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto group-hover:shadow-primary/20">
                Request a Quote
              </Button>
            </Link>
            <Link to="/gallery" className="group">
              <Button variant="outline" className="px-10 py-5 text-lg font-semibold w-full sm:w-auto border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 group-hover:shadow-md">
                View Our Work
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};