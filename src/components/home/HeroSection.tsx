import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";

export const HeroSection = () => {
  const heroImages = [
    {
      src: "/lovable-uploads/ca9734ef-7643-4b4c-913b-eeec8c80237d.png",
      alt: "Professional chafing dishes setup with elegant catering display"
    },
    {
      src: "/lovable-uploads/324100be-b134-4222-a2cf-4667ed370b98.png", 
      alt: "Elegant event space with white chair covers and gold accents"
    },
    {
      src: "/lovable-uploads/9332d2dd-3c00-48bb-ba3d-17b943a78ad2.png",
      alt: "Grand formal event space with multiple tables and floral arrangements"
    },
    {
      src: "/lovable-uploads/5dd8930c-34cc-4b9e-84a6-beeeb540d35e.png",
      alt: "Wedding dessert table with custom neon sign and tiered cake"
    },
    {
      src: "/lovable-uploads/bd4e5565-94d9-4973-bf7b-3deeedbfbe21.png",
      alt: "Elegant appetizer display with beverage service and professional presentation"
    }
  ];

  return (
    <section className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Hero Image Carousel */}
      <div className="lg:w-[55%] h-80 sm:h-96 lg:h-screen relative overflow-hidden border-r border-border/20">
        <Carousel
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="w-full h-full"
        >
          <CarouselContent className="h-full">
            {heroImages.map((image, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="relative h-full">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover object-center brightness-90 contrast-105"
                  />
                  {/* Dynamic gradient overlay based on image position */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-black/10"></div>
                  {/* Additional subtle overlay for consistent branding */}
                  <div className="absolute inset-0 bg-primary/5"></div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        {/* Enhanced navigation dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {heroImages.map((_, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-full bg-white/70 backdrop-blur-sm border border-white/30 shadow-md transition-all duration-300 hover:scale-110"
            ></div>
          ))}
        </div>
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