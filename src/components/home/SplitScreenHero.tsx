
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ImageModal } from "@/components/gallery/ImageModal";
import { OptimizedImage } from "@/components/ui/optimized-image";

export const SplitScreenHero = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const showcaseImages = [
    {
      src: "/lovable-uploads/92c3b6c8-61dc-4c37-afa8-a0a4db04c551.png",
      alt: "Professional buffet setup with chafing dishes and elegant floral arrangements",
      title: "Corporate Catering",
      description: "Professional buffet setup with chafing dishes and elegant floral arrangements",
      category: "corporate"
    },
    {
      src: "/lovable-uploads/1dcbc1ee-eb25-4d89-8722-cb4904d1ba69.png",
      alt: "Elegant wedding dessert table with tiered cake, neon signage, and gourmet treats",
      title: "Wedding Reception",
      description: "Elegant wedding dessert table with tiered cake, neon signage, and gourmet treats",
      category: "wedding"
    },
    {
      src: "/lovable-uploads/ce12a76f-20cf-449f-8755-4d84cbf1688a.png",
      alt: "Elaborate grazing board with artisanal cheeses, charcuterie, and fresh fruits",
      title: "Grazing Tables",
      description: "Elaborate grazing board with artisanal cheeses, charcuterie, and fresh fruits",
      category: "grazing"
    },
    {
      src: "/lovable-uploads/6225467a-567b-4a4e-8f41-181db66e0aaf.png",
      alt: "Elegant outdoor tent setup with sophisticated lighting and table arrangements",
      title: "Outdoor Events",
      description: "Elegant outdoor tent setup with sophisticated lighting and table arrangements",
      category: "outdoor"
    }
  ];

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  return (
    <>
      <section className="relative min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-6 xl:px-12 py-8 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-8rem)]">
            
            {/* Left Content Panel */}
            <div className="order-2 lg:order-1 text-center lg:text-left">
              {/* Logo */}
              <div className="flex justify-center lg:justify-start mb-6 lg:mb-8">
                <div className="p-4 lg:p-6">
                  <div className="h-12 w-12 lg:h-16 lg:w-16 relative">
                    <img 
                      src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                      alt="Soul Train's Eatery Logo" 
                      className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" 
                    />
                  </div>
                </div>
              </div>

              {/* Main Heading */}
              <div className="mb-6 lg:mb-8">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-elegant font-bold text-foreground leading-tight mb-4">
                  Charleston's Premier Catering Experience
                </h1>
                <div className="w-16 lg:w-24 h-1 bg-gradient-to-r from-primary via-primary-light to-primary mx-auto lg:mx-0 mb-4 rounded-full" />
                <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground font-elegant leading-relaxed">
                  Where every bite is made with love and served with soul!
                </p>
              </div>

              {/* Service Categories */}
              <div className="mb-8 lg:mb-10">
                <div className="grid grid-cols-2 gap-3 lg:gap-4 text-sm lg:text-base">
                  <div className="neumorphic-card p-3 lg:p-4 text-center hover:neumorphic-card-2 transition-all duration-300">
                    <span className="font-medium text-foreground">Corporate Events</span>
                  </div>
                  <div className="neumorphic-card p-3 lg:p-4 text-center hover:neumorphic-card-2 transition-all duration-300">
                    <span className="font-medium text-foreground">Wedding Catering</span>
                  </div>
                  <div className="neumorphic-card p-3 lg:p-4 text-center hover:neumorphic-card-2 transition-all duration-300">
                    <span className="font-medium text-foreground">Family Gatherings</span>
                  </div>
                  <div className="neumorphic-card p-3 lg:p-4 text-center hover:neumorphic-card-2 transition-all duration-300">
                    <span className="font-medium text-foreground">Special Events</span>
                  </div>
                </div>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 lg:gap-6">
                <Button asChild size="lg" className="w-full sm:w-auto min-w-[160px]">
                  <Link to="/request-quote#page-header">
                    Request Quote
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto min-w-[160px]">
                  <Link to="/gallery#page-header">
                    View Gallery
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Image Showcase */}
            <div className="order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-3 lg:gap-4 h-[400px] lg:h-[600px]">
                {showcaseImages.map((image, index) => (
                  <div 
                    key={index}
                    className={`group neumorphic-card hover:neumorphic-card-2 p-2 lg:p-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                      index === 0 ? 'col-span-2' : index === 1 ? 'row-span-2' : ''
                    }`}
                    onClick={() => handleImageClick(index)}
                  >
                    <div className="relative rounded-xl overflow-hidden h-full">
                      <OptimizedImage
                        src={image.src}
                        alt={image.alt}
                        aspectRatio="aspect-video"
                        className="group-hover:scale-105 transition-transform duration-300"
                        containerClassName="h-full"
                        priority={index < 2}
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-3 lg:bottom-4 left-3 lg:left-4 right-3 lg:right-4">
                          <h3 className="text-white font-elegant font-semibold text-sm lg:text-base mb-1">
                            {image.title}
                          </h3>
                          <div className="w-8 h-0.5 bg-white/80 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <ImageModal 
        images={showcaseImages} 
        selectedIndex={selectedImageIndex} 
        onClose={handleCloseModal} 
      />
    </>
  );
};
