import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ImageModal } from "@/components/gallery/ImageModal";
import { AnimatedSection, AnimatedGrid } from "@/components/ui/animated-section";
export const HeroSection = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageSet, setImageSet] = useState(0);

  // Featured images for the grid display - taking the first 4 images for initial display
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
    src: "/lovable-uploads/c3ec0f07-ade4-40c3-89f7-0c5f2c8bebcf.png",
    alt: "Professional buffet service setup with chafing dishes and elegant presentation",
    title: "Buffet Service",
    description: "Professional buffet service setup with chafing dishes and elegant presentation",
    category: "buffet"
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
  return <>
      <section className="bg-gradient-card shadow-elegant hover:shadow-glow transition-all duration-200 rounded-lg mx-4 sm:mx-6 lg:mx-8 my-section sm:my-section-sm py-section sm:py-section-sm lg:py-section-lg">
        {/* Brand Header Section */}
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-8 sm:mb-12 md:mb-16">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50 my-0 py-0"></div>
          
          <div className="relative z-10 flex flex-col justify-center items-center text-center">
            <AnimatedSection animation="fade-in-up" delay={0}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-script font-bold text-foreground leading-[0.9] tracking-tight mb-4">
                Soul Train's <span className="text-primary bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Eatery</span>
              </h1>
            </AnimatedSection>
            
            {/* Red Logo Icon */}
            <AnimatedSection animation="scale-in" delay={200}>
              <div className="flex justify-center mb-4">
                <img src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" alt="Soul Train's Eatery Logo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain hover:scale-110 transition-transform duration-300 hover-bounce" />
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-in-up" delay={300}>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary-glow rounded-full mx-auto mb-6"></div>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-in-up" delay={400}>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground leading-relaxed font-medium max-w-2xl mx-auto mb-6">
                Where passion meets Southern hospitality. Elegant catering for weddings, black tie events, and memorable celebrations in Charleston's Lowcountry.
              </p>
            </AnimatedSection>
            
            {/* Call-to-Action Buttons */}
            <AnimatedSection animation="fade-in-up" delay={500}>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-6 sm:mt-8">
                <Button
                  asChild
                  variant="cta"
                  size="responsive-md"
                  className="w-[90%] sm:w-auto sm:min-w-[14rem] hover-lift"
                >
                  <Link to="/request-quote#page-header">
                    Request Quote
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="cta-outline"
                  size="responsive-md"
                  className="w-[90%] sm:w-auto sm:min-w-[14rem] hover-lift"
                >
                  <Link to="/gallery#page-header">
                    Gallery
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Image Gallery Grid Section */}
        <div className="relative px-6 sm:px-8 lg:px-12 pb-8 lg:pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Responsive Grid */}
            <AnimatedGrid 
              className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12"
              staggerDelay={150}
            >
              {heroImages.map((image, index) => 
                <div key={index} className="group relative overflow-hidden rounded-lg shadow-elegant hover:shadow-glow bg-gradient-card transition-all duration-200 cursor-pointer hover-lift" onClick={() => handleImageClick(index)}>
                  <div className="aspect-[5/4] overflow-hidden">
                    <img src={image.src} alt={image.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading={index < 2 ? "eager" : "lazy"} decoding="async" />
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-lg transition-colors duration-200"></div>
                </div>
              )}
            </AnimatedGrid>

            {/* View More Link */}
            <AnimatedSection animation="fade-in-up" delay={600}>
              <div className="text-center mt-12">
                <Link to="/gallery#page-header" className="inline-flex items-center gap-2 text-primary hover:text-primary-glow transition-colors duration-200 font-medium text-lg group">
                  View Complete Gallery 
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <ImageModal 
        images={allImages}
        selectedIndex={selectedImageIndex} 
        onClose={handleCloseModal} 
      />
    </>;
};