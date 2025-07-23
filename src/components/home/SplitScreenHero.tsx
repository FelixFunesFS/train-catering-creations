import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ImageModal } from "@/components/gallery/ImageModal";
import { OptimizedImage } from "@/components/ui/optimized-image";
export const SplitScreenHero = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const showcaseImages = [{
    src: "/lovable-uploads/adfb4ea8-c62c-4f6d-b7dd-b562466c2c31.png",
    alt: "Elegant tiered dessert and appetizer display with gourmet presentation",
    title: "Elegant Catering",
    description: "Elegant tiered dessert and appetizer display with gourmet presentation",
    category: "elegant"
  }, {
    src: "/lovable-uploads/f6f0cdc2-cd71-4392-984e-ed9609103e42.png",
    alt: "Elegant rustic venue with exposed beams, crystal chandeliers, and string lights for wedding reception",
    title: "Wedding Reception",
    description: "Elegant rustic venue with exposed beams, crystal chandeliers, and string lights for wedding reception",
    category: "wedding"
  }, {
    src: "/lovable-uploads/ce12a76f-20cf-449f-8755-4d84cbf1688a.png",
    alt: "Elaborate grazing board with artisanal cheeses, charcuterie, and fresh fruits",
    title: "Grazing Tables",
    description: "Elaborate grazing board with artisanal cheeses, charcuterie, and fresh fruits",
    category: "grazing"
  }, {
    src: "/lovable-uploads/92c3b6c8-61dc-4c37-afa8-a0a4db04c551.png",
    alt: "Professional buffet setup with chafing dishes and elegant floral arrangements",
    title: "Corporate Catering",
    description: "Professional buffet setup with chafing dishes and elegant floral arrangements",
    category: "corporate"
  }];
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };
  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };
  return <>
      <section className="relative min-h-screen bg-gradient-to-br from-background via-muted/20 to-background -mt-4 my-0">
        <div className="max-w-7xl mx-auto px-6 xl:px-12 pb-8 lg:pb-0 py-0">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center min-h-screen py-0 my-0">
            
            {/* Left Content Panel */}
            <div className="order-1 md:order-1 text-center md:text-left">
              {/* Logo */}
              <div className="flex justify-center md:justify-start mb-2">
                <div className="p-4 md:p-5 lg:p-6">
                  <div className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 relative">
                    <img src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" alt="Soul Train's Eatery Logo" className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
              </div>

              {/* Main Heading */}
              <div className="mb-8 md:mb-9 lg:mb-10">
                <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-elegant font-bold text-foreground leading-tight mb-4">
                  Charleston's Premier Catering Experience
                </h1>
                <div className="w-16 md:w-20 lg:w-24 h-1 bg-gradient-to-r from-primary via-primary-light to-primary mx-auto md:mx-0 mb-4 rounded-full" />
                <p className="text-lg sm:text-xl md:text-xl lg:text-2xl text-muted-foreground font-elegant leading-relaxed">
                  Where every bite is made with love and served with soul!
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
                {showcaseImages.map((image, index) => <div key={index} className={`group neumorphic-card hover:neumorphic-card-2 p-2 md:p-2 lg:p-3 rounded-2xl cursor-pointer transition-all duration-300 ${index === 0 ? 'col-span-2' : index === 1 ? 'row-span-2' : ''}`} onClick={() => handleImageClick(index)}>
                    <div className="relative rounded-xl overflow-hidden h-full">
                      <OptimizedImage src={image.src} alt={image.alt} aspectRatio="aspect-video" className="group-hover:scale-105 transition-transform duration-300" containerClassName="h-full" priority={index < 2} />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 py-0 my-0">
                        <div className="absolute bottom-3 md:bottom-3 lg:bottom-4 left-3 md:left-3 lg:left-4 right-3 md:right-3 lg:right-4">
                          <h3 className="text-white font-elegant font-semibold text-sm md:text-sm lg:text-base mb-1">
                            {image.title}
                          </h3>
                          <div className="w-8 h-0.5 bg-white/80 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <ImageModal images={showcaseImages} selectedIndex={selectedImageIndex} onClose={handleCloseModal} />
    </>;
};