import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ArrowRight, Play, Heart } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";

interface GalleryItem {
  src: string;
  alt: string;
  category: string;
  title: string;
  isPopular?: boolean;
}

export const InteractiveGalleryPreview = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0 
  });

  const animationClass = useAnimationClass('ios-spring', isVisible);

  const staggered = useStaggeredAnimation({
    itemCount: 6,
    staggerDelay: 150,
    baseDelay: 300,
    variant: 'bounce-in'
  });

  const galleryItems: GalleryItem[] = [
    {
      src: "/lovable-uploads/e61537fa-d421-490b-932f-402236a093aa.png",
      alt: "Elegant outdoor wedding buffet setup",
      category: "Wedding",
      title: "Outdoor Buffet Excellence",
      isPopular: true
    },
    {
      src: "/lovable-uploads/02486e12-54f5-4b94-8d6e-f150546c6983.png",
      alt: "Artisan charcuterie and grazing board",
      category: "Appetizers",
      title: "Artisan Grazing Boards"
    },
    {
      src: "/lovable-uploads/d6dabca7-8f7b-45c8-bb6c-ef86311e92bd.png",
      alt: "Colorful side dishes and comfort food",
      category: "Sides",
      title: "Southern Comfort Sides"
    },
    {
      src: "/lovable-uploads/1cd54e2e-3991-4795-ad2a-6e8c18fb530f.png",
      alt: "Custom wedding cake creation",
      category: "Desserts",
      title: "Tanya's Custom Cakes",
      isPopular: true
    },
    {
      src: "/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png",
      alt: "Elegant wedding venue dining setup",
      category: "Formal",
      title: "Formal Event Elegance"
    },
    {
      src: "/lovable-uploads/eca9632d-b79e-4584-8287-00cc36515fc6.png",
      alt: "Round table wedding reception setup",
      category: "Wedding",
      title: "Reception Perfection"
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      Wedding: "bg-ruby/10 text-ruby border-ruby/30",
      Appetizers: "bg-gold/10 text-gold border-gold/30",
      Sides: "bg-navy/10 text-navy border-navy/30",
      Desserts: "bg-primary/10 text-primary border-primary/30",
      Formal: "bg-platinum/10 text-platinum-foreground border-platinum/30"
    };
    return colors[category as keyof typeof colors] || "bg-muted text-muted-foreground border-border";
  };

  return (
    <section 
      ref={ref}
      className="py-8 sm:py-12 lg:py-16 bg-gradient-pattern-b"
    >
      <div className="container mx-auto px-3 sm:px-4">
        {/* Section Header */}
        <div className={`text-center mb-6 lg:mb-10 space-y-3 ${animationClass}`}>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Play className="h-5 w-5 text-ruby" />
            <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
              Visual Story
            </Badge>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground">
            A Gallery of Flavor & Style
          </h2>
          <p className="text-xl sm:text-2xl font-script text-ruby font-medium">
            Every Event Tells a Story
          </p>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From intimate family gatherings to grand celebrations, explore the artistry and attention 
            to detail that defines every Soul Train's Eatery experience.
          </p>
        </div>

        {/* Interactive Gallery Grid */}
        <div 
          ref={staggered.ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6"
        >
          {galleryItems.map((item, index) => (
            <Card
              key={index}
              className={`group relative overflow-hidden cursor-pointer border-2 border-transparent hover:border-ruby/30 transition-all duration-500 ${staggered.getItemClassName(index)}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={staggered.getItemStyle(index)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <OptimizedImage
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                
                {/* Ruby Gradient Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-ruby-subtle transition-opacity duration-300 ${
                  hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                }`} />

                {/* Popular Badge */}
                {item.isPopular && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gradient-ruby-primary text-white border-0">
                      <Heart className="h-3 w-3 mr-1 fill-white" />
                      Popular
                    </Badge>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </Badge>
                </div>

                {/* Content Overlay */}
                <div className={`absolute inset-0 flex items-end p-4 transition-all duration-300 ${
                  hoveredIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 w-full">
                    <h3 className="font-elegant font-semibold text-foreground text-base mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      View in gallery →
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className={`text-center ${animationClass}`}>
          <Button 
            size="lg"
            className="bg-gradient-ruby-primary hover:bg-gradient-ruby-accent text-white font-semibold group"
            asChild
          >
            <a href="/gallery" className="flex items-center space-x-2">
              <span>Explore Full Gallery</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          
          <p className="text-xs text-muted-foreground mt-3">
            Over 200+ photos showcasing our culinary artistry and event expertise
          </p>
        </div>
      </div>
    </section>
  );
};