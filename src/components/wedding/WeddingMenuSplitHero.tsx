
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ImageModal } from "@/components/gallery/ImageModal";
import { OptimizedImage } from "@/components/ui/optimized-image";

export const WeddingMenuSplitHero = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  const weddingShowcaseImages = [
    {
      src: "/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png",
      alt: "Stunning rustic venue with chandeliers, string lights, and elegant dining setup",
      title: "Rustic Elegance",
      description: "Stunning rustic venue with chandeliers, string lights, and elegant dining setup",
      category: "wedding"
    },
    {
      src: "/lovable-uploads/26d2d500-6017-41a2-99b2-b7050cefedba.png",
      alt: "Elegant outdoor wedding tent with chandeliers, string lights, and formal table service",
      title: "Outdoor Elegance",
      description: "Elegant outdoor wedding tent with chandeliers, string lights, and formal table service",
      category: "wedding"
    },
    {
      src: "/lovable-uploads/e61537fa-d421-490b-932f-402236a093aa.png",
      alt: "Beautiful outdoor wedding buffet with fresh floral arrangements and chafing dishes",
      title: "Garden Reception",
      description: "Beautiful outdoor wedding buffet with fresh floral arrangements and chafing dishes",
      category: "wedding"
    },
    {
      src: "/lovable-uploads/1cd54e2e-3991-4795-ad2a-6e8c18fb530f.png",
      alt: "Custom wedding cake and dessert station by Tanya Ward",
      title: "Custom Desserts",
      description: "Custom wedding cake and dessert station by Tanya Ward",
      category: "wedding"
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
        <div className="max-w-7xl mx-auto px-6 xl:px-12 pt-6 sm:pt-8 lg:pt-12 xl:pt-16 pb-8 lg:pb-0">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center min-h-[calc(100vh-12rem)] lg:min-h-[calc(100vh-8rem)]">
            
            {/* Left Content Panel */}
            <div className="order-1 md:order-1 text-center md:text-left">
              {/* Logo */}
              <div className="flex justify-center md:justify-start mb-4 sm:mb-5 lg:mb-6">
                <div className="p-4 md:p-5 lg:p-6">
                  <div className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 relative">
                    <img 
                      src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                      alt="Soul Train's Eatery Logo" 
                      className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" 
                    />
                  </div>
                </div>
              </div>

              {/* Main Heading */}
              <div className="mb-8 md:mb-9 lg:mb-10">
                <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-elegant font-bold text-foreground leading-tight mb-4">
                  Elegant Wedding Catering with Southern Soul
                </h1>
                <div className="w-16 md:w-20 lg:w-24 h-1 bg-gradient-to-r from-primary via-primary-light to-primary mx-auto md:mx-0 mb-4 rounded-full" />
                <p className="text-lg sm:text-xl md:text-xl lg:text-2xl text-muted-foreground font-elegant leading-relaxed">
                  Create unforgettable moments with sophisticated menus crafted for your special day
                </p>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-4 md:gap-5 lg:gap-6">
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
            <div className="order-2 md:order-2">
              <div className="grid grid-cols-2 gap-3 md:gap-3 lg:gap-4 h-[400px] md:h-[500px] lg:h-[600px]">
                {weddingShowcaseImages.map((image, index) => (
                  <div 
                    key={index} 
                    className={`group neumorphic-card hover:neumorphic-card-2 p-2 md:p-2 lg:p-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                      index === 0 ? 'col-span-2' : 
                      index === 1 ? 'row-span-2' : ''
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
                        <div className="absolute bottom-3 md:bottom-3 lg:bottom-4 left-3 md:left-3 lg:left-4 right-3 md:right-3 lg:right-4">
                          <h3 className="text-white font-elegant font-semibold text-sm md:text-sm lg:text-base mb-1">
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
        images={weddingShowcaseImages} 
        selectedIndex={selectedImageIndex} 
        onClose={handleCloseModal} 
      />
    </>
  );
};
