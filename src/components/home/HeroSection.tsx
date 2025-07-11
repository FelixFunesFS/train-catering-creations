import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ImageModal } from "@/components/gallery/ImageModal";

export const HeroSection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageSet, setImageSet] = useState(0);

  // Featured images for the grid display - taking the first 4 images for initial display
  const heroImages = [
    {
      src: "/lovable-uploads/ca9734ef-7643-4b4c-913b-eeec8c80237d.png",
      alt: "Professional chafing dishes setup with elegant catering display",
      title: "Buffet Service"
    },
    {
      src: "/lovable-uploads/324100be-b134-4222-a2cf-4667ed370b98.png", 
      alt: "Elegant event space with white chair covers and gold accents",
      title: "Wedding Reception"
    },
    {
      src: "/lovable-uploads/9332d2dd-3c00-48bb-ba3d-17b943a78ad2.png",
      alt: "Grand formal event space with multiple tables and floral arrangements",
      title: "Formal Events"
    },
    {
      src: "/lovable-uploads/0703365f-22eb-4c4d-b258-4a2c8a23b63a.png",
      alt: "Rustic venue buffet setup with chafing dishes and atmospheric lighting",
      title: "Venue Setup"
    }
  ];

  // Additional images for rotation
  const additionalImages = [
    {
      src: "/lovable-uploads/5dd8930c-34cc-4b9e-84a6-beeeb540d35e.png",
      alt: "Wedding dessert table with custom neon sign and tiered cake",
      title: "Dessert Display"
    },
    {
      src: "/lovable-uploads/bd4e5565-94d9-4973-bf7b-3deeedbfbe21.png",
      alt: "Elegant appetizer display with beverage service and professional presentation",
      title: "Appetizer Service"
    }
  ];

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <section className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        {/* Brand Header Section - Compact (~40vh) */}
        <div className="relative h-[40vh] flex flex-col justify-center items-center text-center px-6 sm:px-8 lg:px-12">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-elegant font-bold text-foreground leading-[0.9] tracking-tight animate-fade-in mb-6">
              Soul Train's <span className="text-primary bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Eatery</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary-glow rounded-full mx-auto mb-6"></div>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed font-medium animate-fade-in max-w-2xl mx-auto mb-8">
              Where passion meets Southern hospitality. Elegant catering for weddings, black tie events, and memorable celebrations in Charleston's Lowcountry.
            </p>
            
            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link to="/request-quote" className="group">
                <Button className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-lg font-semibold shadow-elegant hover:shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto group-hover:shadow-primary/20">
                  Request a Quote
                </Button>
              </Link>
              <Link to="/gallery" className="group">
                <Button variant="outline" className="px-8 py-4 text-lg font-semibold w-full sm:w-auto border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 group-hover:shadow-md">
                  View Our Work
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Image Gallery Grid Section - (~50vh) */}
        <div className="relative h-[50vh] px-6 sm:px-8 lg:px-12 pb-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-semibold text-center mb-8 text-foreground">
              Featured Catering Services
            </h2>
            
            {/* Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 h-full max-h-[300px]">
              {heroImages.map((image, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-card"
                  onClick={() => handleImageClick(image.src)}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-105 contrast-105"
                      loading={index < 2 ? "eager" : "lazy"}
                    />
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {image.title}
                      </h3>
                      <p className="text-white/90 text-sm leading-tight">
                        Click to view full size
                      </p>
                    </div>
                  </div>

                  {/* Subtle border effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-lg transition-colors duration-300"></div>
                </div>
              ))}
            </div>

            {/* View More Link */}
            <div className="text-center mt-8">
              <Link 
                to="/gallery" 
                className="inline-flex items-center gap-2 text-primary hover:text-primary-glow transition-colors duration-200 font-medium text-lg group"
              >
                View Complete Gallery 
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          selectedImage={selectedImage}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};