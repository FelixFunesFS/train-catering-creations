
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedImageModal } from "@/components/gallery/EnhancedImageModal";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useState } from "react";
import { galleryImages } from "@/data/galleryImages";
import { Camera, Heart, Star } from "lucide-react";

export const InteractiveGallerySection = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ delay: 0, variant: 'fade-up' });
  const { ref: gridRef, isVisible: gridVisible, variant: gridVariant } = useScrollAnimation({ delay: 200, variant: 'ios-spring' });
  const { ref: ctaRef, isVisible: ctaVisible, variant: ctaVariant } = useScrollAnimation({ delay: 400, variant: 'elastic' });
  
  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);
  const gridAnimationClass = useAnimationClass(gridVariant, gridVisible);
  const ctaAnimationClass = useAnimationClass(ctaVariant, ctaVisible);

  const handleImageClick = (imageSrc: string) => {
    const index = galleryImages.findIndex(img => img.src === imageSrc);
    setSelectedImageIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  // Get best quality images for showcase - 12 images for consistent display
  const showcaseImages = galleryImages
    .sort((a, b) => b.quality - a.quality)
    .slice(0, 12);

  // Create varied aspect ratios for visual interest
  const getAspectRatio = (index: number): "aspect-square" | "aspect-[4/5]" | "aspect-[3/4]" | "aspect-[5/4]" => {
    const patterns = ["aspect-square", "aspect-[4/5]", "aspect-[3/4]", "aspect-[5/4]"] as const;
    return patterns[index % patterns.length];
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      wedding: { label: "Wedding", color: "bg-pink-500/90" },
      formal: { label: "Formal", color: "bg-purple-500/90" },
      corporate: { label: "Corporate", color: "bg-blue-500/90" },
      desserts: { label: "Desserts", color: "bg-orange-500/90" },
      grazing: { label: "Appetizers", color: "bg-green-500/90" },
      team: { label: "Our Team", color: "bg-indigo-500/90" },
      buffet: { label: "Buffet", color: "bg-red-500/90" },
    };
    return categoryMap[category as keyof typeof categoryMap] || { label: category, color: "bg-gray-500/90" };
  };

  return (
    <>
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-card/30 border-t border-border/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div ref={headerRef} className={`text-center mb-8 sm:mb-10 lg:mb-12 ${headerAnimationClass}`}>
            <div className="flex justify-center items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-primary" />
              <Heart className="w-4 h-4 text-primary" />
              <Star className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-3 sm:mb-4 leading-tight">
              Gallery Showcase
            </h2>
            <div className="w-16 h-1 bg-gradient-primary mx-auto mb-4 sm:mb-6 rounded-full" />
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore our portfolio of beautifully catered events, from intimate gatherings to grand celebrations. 
              Each image captures the essence of culinary excellence and impeccable service.
            </p>
          </div>

          {/* Unified Responsive Grid */}
          <div ref={gridRef} className={gridAnimationClass}>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
              {showcaseImages.map((image, index) => {
                const categoryBadge = getCategoryBadge(image.category);
                const aspectRatio = getAspectRatio(index);
                
                return (
                  <div
                    key={index}
                    className={`neumorphic-card-2 hover:neumorphic-card-3 rounded-xl p-2 sm:p-3 bg-card transition-all duration-300 cursor-pointer group hover:scale-[1.02] ${
                      index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
                    }`}
                    onClick={() => handleImageClick(image.src)}
                  >
                    <div className="relative rounded-lg overflow-hidden">
                      <OptimizedImage
                        src={image.src}
                        alt={image.title}
                        aspectRatio={index === 0 ? "aspect-[4/3]" : aspectRatio}
                        className="group-hover:scale-105 transition-transform duration-300"
                        priority={index < 6}
                      />
                      
                      {/* Hover overlay with category badge */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute top-2 left-2">
                          <Badge className={`${categoryBadge.color} text-white text-xs`}>
                            {categoryBadge.label}
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <h3 className="text-white font-elegant font-semibold text-sm sm:text-base mb-1 leading-tight">
                            {image.title}
                          </h3>
                          <p className="text-white/90 text-xs sm:text-sm line-clamp-2 leading-tight">
                            {image.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div ref={ctaRef} className={`text-center ${ctaAnimationClass}`}>
            <div className="neumorphic-card-2 hover:neumorphic-card-3 rounded-2xl p-6 sm:p-8 bg-gradient-card/50 transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-elegant font-bold text-foreground mb-3">
                Ready to Create Your Perfect Event?
              </h3>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                Let our portfolio inspire your next celebration. View our complete gallery or start planning your event today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/gallery#page-header">
                  <Button variant="cta" size="responsive-md" className="w-full sm:w-auto">
                    View Full Gallery
                  </Button>
                </Link>
                <Link to="/request-quote#page-header">
                  <Button variant="outline" size="responsive-md" className="w-full sm:w-auto">
                    Get Quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EnhancedImageModal 
        images={galleryImages} 
        selectedIndex={selectedImageIndex} 
        onClose={handleCloseModal} 
      />
    </>
  );
};
