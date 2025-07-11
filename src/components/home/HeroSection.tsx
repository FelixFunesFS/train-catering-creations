import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ImageModal } from "@/components/gallery/ImageModal";
export const HeroSection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageSet, setImageSet] = useState(0);

  // Featured images for the grid display - taking the first 4 images for initial display
  const heroImages = [{
    src: "/lovable-uploads/1dcbc1ee-eb25-4d89-8722-cb4904d1ba69.png",
    alt: "Elegant wedding dessert table with tiered cake, neon signage, and gourmet treats",
    title: "Wedding Reception"
  }, {
    src: "/lovable-uploads/0703365f-22eb-4c4d-b258-4a2c8a23b63a.png",
    alt: "Rustic venue buffet setup with chafing dishes and atmospheric lighting",
    title: "Formal Events"
  }, {
    src: "/lovable-uploads/c3ec0f07-ade4-40c3-89f7-0c5f2c8bebcf.png",
    alt: "Professional buffet service setup with chafing dishes and elegant presentation",
    title: "Buffet Service"
  }, {
    src: "/lovable-uploads/d2ed2f6e-a667-4bf2-9e28-30029d377f94.png",
    alt: "Elegant formal event display with tiered appetizers and beverage service",
    title: "Brunch Events"
  }];

  // Additional images for rotation
  const additionalImages = [{
    src: "/lovable-uploads/5dd8930c-34cc-4b9e-84a6-beeeb540d35e.png",
    alt: "Wedding dessert table with custom neon sign and tiered cake",
    title: "Dessert Display"
  }, {
    src: "/lovable-uploads/bd4e5565-94d9-4973-bf7b-3deeedbfbe21.png",
    alt: "Elegant appetizer display with beverage service and professional presentation",
    title: "Appetizer Service"
  }];
  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };
  const handleCloseModal = () => {
    setSelectedImage(null);
  };
  return <>
      <section className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 py-[20px] my-0 mx-0 px-0">
        {/* Brand Header Section - Compact (~35vh) */}
        <div className="relative h-[35vh] flex flex-col justify-center items-center text-center px-6 sm:px-8 lg:px-12">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-script font-bold text-foreground leading-[0.9] tracking-tight mb-4 hover:text-primary transition-colors duration-500 transform hover:scale-105">
              Soul Train's <span className="text-primary bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent animate-pulse">Eatery</span>
            </h1>
            
            {/* Red Logo Icon */}
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/3ad8c9b2-2411-43d2-ae32-de28c449b81c.png" 
                alt="Soul Train's Eatery Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain hover:rotate-12 hover:scale-110 transition-all duration-300"
                style={{animationDelay: '200ms'}}
              />
            </div>
            
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary-glow rounded-full mx-auto mb-6 hover:w-32 transition-all duration-300"></div>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed font-medium max-w-2xl mx-auto mb-6 hover:text-foreground transition-colors duration-300" style={{animationDelay: '400ms'}}>
              Where passion meets Southern hospitality. Elegant catering for weddings, black tie events, and memorable celebrations in Charleston's Lowcountry.
            </p>
            
            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{animationDelay: '600ms'}}>
              <Link to="/request-quote" className="group">
                <Button className="bg-primary hover:bg-primary-glow text-primary-foreground px-6 py-3 text-base font-semibold shadow-elegant hover:shadow-lg transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto group-hover:shadow-primary/20">
                  Request a Quote
                </Button>
              </Link>
              <Link to="/gallery" className="group">
                <Button variant="outline" className="px-6 py-3 text-base font-semibold w-full sm:w-auto border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 group-hover:shadow-md hover:scale-105 hover:-translate-y-1">
                  View Our Work
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Image Gallery Grid Section - (~45vh) */}
        <div className="relative h-[45vh] px-6 sm:px-8 lg:px-12 pb-12 py-[20px]">
          <div className="max-w-7xl mx-auto">
            
            
            {/* Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 h-full max-h-[280px]">
              {heroImages.map((image, index) => 
                <div 
                  key={index} 
                  className="group relative overflow-hidden rounded-2xl cursor-pointer backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in" 
                  onClick={() => handleImageClick(image.src)}
                  style={{animationDelay: `${800 + index * 200}ms`}}
                >
                  <div className="aspect-[5/4] overflow-hidden rounded-2xl">
                    <img 
                      src={image.src} 
                      alt={image.alt} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-105 contrast-105" 
                      loading={index < 2 ? "eager" : "lazy"} 
                    />
                  </div>
                  
                  {/* Glassmorphism Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm rounded-2xl">
                    <div className="absolute bottom-4 left-4 right-4 p-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg">
                      <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-primary-glow transition-colors duration-300">
                        {image.title}
                      </h3>
                      <p className="text-white/90 text-sm leading-tight">
                        Click to view full size
                      </p>
                    </div>
                  </div>

                  {/* Subtle border effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-2xl transition-colors duration-300"></div>
                </div>
              )}
            </div>

            {/* View More Link */}
            <div className="text-center mt-8 animate-fade-in" style={{animationDelay: '1600ms'}}>
              <Link to="/gallery" className="inline-flex items-center gap-2 text-primary hover:text-primary-glow transition-colors duration-200 font-medium text-lg group hover:scale-105 transform transition-transform">
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
      {selectedImage && <ImageModal selectedImage={selectedImage} onClose={handleCloseModal} />}
    </>;
};