import { Card, CardContent } from "@/components/ui/card";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { Camera, ArrowRight, Eye, Heart } from "lucide-react";

const galleryCategories = [
  {
    title: "Wedding Elegance",
    description: "Sophisticated dining experiences for your special day",
    image: "/lovable-uploads/elegant-wedding-setup.jpg",
    count: "50+ photos",
    link: "/gallery?category=wedding"
  },
  {
    title: "Corporate Excellence",
    description: "Professional presentations for business events",
    image: "/lovable-uploads/corporate-catering.jpg",
    count: "30+ photos",
    link: "/gallery?category=corporate"
  },
  {
    title: "Signature Dishes",
    description: "Artistically crafted culinary masterpieces",
    image: "/lovable-uploads/signature-dishes.jpg",
    count: "75+ photos",
    link: "/gallery?category=signature"
  }
];

const featuredImages = [
  "/lovable-uploads/featured-dish-1.jpg",
  "/lovable-uploads/featured-dish-2.jpg",
  "/lovable-uploads/featured-dish-3.jpg",
  "/lovable-uploads/featured-dish-4.jpg"
];

export const RubyGalleryShowcase = () => {
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0 
  });
  
  const { 
    ref: categoriesRef, 
    getItemClassName, 
    getItemStyle 
  } = useStaggeredAnimation({ 
    itemCount: galleryCategories.length, 
    staggerDelay: 200, 
    baseDelay: 300,
    variant: 'scale-fade'
  });
  
  const { 
    ref: featuredRef, 
    getItemClassName: getFeaturedClassName, 
    getItemStyle: getFeaturedStyle 
  } = useStaggeredAnimation({ 
    itemCount: featuredImages.length, 
    staggerDelay: 100, 
    baseDelay: 600,
    variant: 'zoom-fade'
  });

  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);

  return (
    <section className="py-16 lg:py-24 bg-background relative overflow-hidden">
      {/* Ruby Accent Background */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-ruby/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div ref={headerRef} className={`text-center mb-16 ${headerAnimationClass}`}>
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-ruby/10 rounded-full">
            <Camera className="w-4 h-4 mr-2 text-ruby" />
            <span className="text-ruby text-sm font-medium">Visual Gallery</span>
          </div>
          
          <h2 className="font-elegant text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Culinary <span className="font-script text-ruby">Artistry</span> in Focus
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our portfolio of meticulously crafted dishes and elegantly presented events. 
            Each image tells the story of culinary excellence and attention to detail.
          </p>
        </div>

        {/* Gallery Categories */}
        <div ref={categoriesRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {galleryCategories.map((category, index) => (
            <div 
              key={index}
              className={getItemClassName(index)}
              style={getItemStyle(index)}
            >
              <NeumorphicCard 
                level={2} 
                interactive 
                className="h-full group overflow-hidden hover:shadow-glow transition-all duration-500"
              >
                <div className="relative">
                  {/* Category Image */}
                  <div className="aspect-[4/3] overflow-hidden">
                    <OptimizedImage
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    
                    {/* Ruby Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ruby/80 via-ruby/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Hover Content */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="text-center text-white">
                        <Eye className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-sm font-semibold">View Gallery</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Category Info */}
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-elegant text-xl font-bold text-foreground group-hover:text-ruby transition-colors duration-300">
                        {category.title}
                      </h3>
                      <span className="text-xs text-muted-foreground bg-ruby/10 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {category.description}
                    </p>
                    
                    <a 
                      href={category.link}
                      className="inline-flex items-center text-ruby font-semibold text-sm hover:text-ruby-dark transition-colors duration-300"
                    >
                      Explore Collection
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  </CardContent>
                </div>
              </NeumorphicCard>
            </div>
          ))}
        </div>

        {/* Featured Images Mosaic */}
        <div className="relative">
          <NeumorphicCard level={3} className="bg-gradient-to-br from-ruby/5 to-background border border-ruby/10">
            <div className="p-8 lg:p-12">
              <div className="text-center mb-8">
                <h3 className="font-elegant text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Featured <span className="font-script text-ruby">Creations</span>
                </h3>
                <p className="text-muted-foreground">
                  A glimpse into our signature culinary presentations
                </p>
              </div>
              
              <div ref={featuredRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredImages.map((image, index) => (
                  <div 
                    key={index}
                    className={`group cursor-pointer ${getFeaturedClassName(index)}`}
                    style={getFeaturedStyle(index)}
                  >
                    <div className="aspect-square overflow-hidden rounded-lg relative">
                      <OptimizedImage
                        src={image}
                        alt={`Featured dish ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Ruby Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-ruby/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Heart Icon */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                          <Heart className="w-4 h-4 text-ruby" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <a 
                  href="/gallery" 
                  className="inline-flex items-center px-8 py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-glow transition-all duration-300"
                >
                  View Complete Gallery
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </div>
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </section>
  );
};