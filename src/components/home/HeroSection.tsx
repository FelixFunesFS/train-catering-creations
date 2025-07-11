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
      <div className="lg:w-1/2 h-64 lg:h-screen relative overflow-hidden">
        <Carousel
          plugins={[
            Autoplay({
              delay: 4000,
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
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent"></div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        {/* Navigation dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {heroImages.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-white/50 animate-pulse"
            ></div>
          ))}
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="lg:w-1/2 bg-background flex flex-col justify-center p-6 sm:p-8 lg:p-12 xl:p-16">
        <div className="max-w-xl mx-auto lg:mx-0 animate-fade-in">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-elegant font-bold text-foreground mb-6 leading-tight">
              Soul Train's <span className="text-primary">Eatery</span>
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
              Where passion meets Southern hospitality. Elegant catering for weddings, black tie events, and memorable celebrations in Charleston's Lowcountry.
            </p>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/request-quote">
              <Button className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-lg font-medium shadow-elegant w-full sm:w-auto">
                Request a Quote
              </Button>
            </Link>
            <Link to="/gallery">
              <Button variant="outline" className="px-8 py-4 text-lg font-medium w-full sm:w-auto">
                View Our Work
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};