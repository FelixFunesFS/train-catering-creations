
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ImageModal } from "@/components/gallery/ImageModal";
import { SectionCard } from "@/components/ui/section-card";

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

  // Additional images for rotation
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
      <SectionCard className="mt-1">
        {/* Brand Header Section */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50"></div>
          
          <div className="relative z-10 text-center space-y-6 sm:space-y-8 lg:space-y-10 py-8 sm:py-12 lg:py-16">
            {/* Logo Icon - consistent with PageHeader styling */}
            <div className="flex justify-center">
              <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16">
                <img 
                  src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                  alt="Soul Train's Eatery Logo" 
                  className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" 
                />
              </div>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant text-foreground leading-tight sm:leading-tight lg:leading-tight animate-fade-in">
                Where Southern Flavor Meets Family & Celebration
              </h1>
              
              {/* Decorative line */}
              <div className="w-16 sm:w-20 lg:w-24 xl:w-28 h-1 bg-gradient-primary mx-auto animate-fade-in" />
            </div>

            {/* Descriptive Text */}
            <div className="max-w-3xl mx-auto px-2 sm:px-4">
              <p className="text-base sm:text-lg lg:text-xl text-foreground/90 leading-relaxed animate-fade-in">
                More than a meal, Soul Train's Eatery delivers comfort, connection, and Lowcountry flavor to every table.
              </p>
            </div>
            
            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch animate-fade-in">
              <Button asChild variant="cta" size="responsive-sm">
                <Link to="/request-quote#page-header">
                  Request Quote
                </Link>
              </Button>
              <Button asChild variant="cta-outline" size="responsive-sm">
                <Link to="/gallery#page-header">
                  Gallery
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Image Gallery Grid Section */}
        <div className="relative px-4 sm:px-6 lg:px-8 xl:px-12 pb-8 sm:pb-12 lg:pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
              {heroImages.map((image, index) => (
                <div 
                  key={index} 
                  className="group relative overflow-hidden rounded-lg shadow-elegant hover:shadow-glow bg-gradient-card transition-all duration-300 cursor-pointer transform hover:scale-[1.02]" 
                  onClick={() => handleImageClick(index)}
                >
                  <div className="aspect-[3/2] overflow-hidden">
                    <img 
                      src={image.src} 
                      alt={image.alt} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      loading={index < 2 ? "eager" : "lazy"} 
                      decoding="async" 
                    />
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
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-lg transition-colors duration-300"></div>
                </div>
              ))}
            </div>

            {/* View More Link */}
            <div className="text-center">
              <Link 
                to="/gallery#page-header" 
                className="inline-flex items-center gap-2 text-primary hover:text-primary-glow transition-colors duration-200 font-medium text-lg group min-h-touch"
              >
                View Complete Gallery 
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Image Modal */}
      <ImageModal images={allImages} selectedIndex={selectedImageIndex} onClose={handleCloseModal} />
    </>
  );
};
