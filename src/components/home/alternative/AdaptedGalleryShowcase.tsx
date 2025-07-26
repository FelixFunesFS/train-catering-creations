import { useState, useEffect } from "react";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Camera, 
  Eye, 
  Heart, 
  ArrowRight,
  Expand,
  Play,
  Pause
} from "lucide-react";

const galleryCategories = [
  {
    title: "Wedding Elegance",
    description: "Romantic celebrations with stunning culinary presentations",
    image: "/lovable-uploads/eca9632d-b79e-4584-8287-00cc36515fc6.png",
    photos: 45,
    link: "/photo-gallery?category=wedding"
  },
  {
    title: "Corporate Excellence",
    description: "Professional events that impress and inspire",
    image: "/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png",
    photos: 32,
    link: "/photo-gallery?category=corporate"
  },
  {
    title: "Signature Dishes",
    description: "Artistically crafted culinary masterpieces",
    image: "/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png",
    photos: 28,
    link: "/photo-gallery?category=signature"
  }
];

const featuredImages = [
  "/lovable-uploads/26d2d500-6017-41a2-99b2-b7050cefedba.png",
  "/lovable-uploads/e61537fa-d421-490b-932f-402236a093aa.png",
  "/lovable-uploads/1cd54e2e-3991-4795-ad2a-6e8c18fb530f.png",
  "/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png",
  "/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png",
  "/lovable-uploads/eca9632d-b79e-4584-8287-00cc36515fc6.png"
];

const culinaryStories = [
  {
    id: "wedding",
    title: "Wedding Elegance",
    description: "Romantic moments captured",
    images: [
      {
        src: "/lovable-uploads/eca9632d-b79e-4584-8287-00cc36515fc6.png",
        alt: "Elegant wedding reception venue",
        caption: "Romantic venue setup"
      },
      {
        src: "/lovable-uploads/26d2d500-6017-41a2-99b2-b7050cefedba.png",
        alt: "Wedding dessert display",
        caption: "Sweet celebration moments"
      }
    ]
  },
  {
    id: "corporate",
    title: "Corporate Excellence",
    description: "Professional culinary artistry",
    images: [
      {
        src: "/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png",
        alt: "Corporate buffet setup",
        caption: "Business dining elegance"
      },
      {
        src: "/lovable-uploads/e61537fa-d421-490b-932f-402236a093aa.png",
        alt: "Corporate event venue",
        caption: "Professional presentation"
      }
    ]
  },
  {
    id: "signature",
    title: "Signature Dishes",
    description: "Culinary masterpieces",
    images: [
      {
        src: "/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png",
        alt: "Artfully plated signature dish",
        caption: "Culinary artistry"
      },
      {
        src: "/lovable-uploads/1cd54e2e-3991-4795-ad2a-6e8c18fb530f.png",
        alt: "Gourmet presentation",
        caption: "Masterful presentation"
      }
    ]
  }
];

export const AdaptedGalleryShowcase = () => {
  const isMobile = useIsMobile();
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // Story state for mobile
  const [currentStory, setCurrentStory] = useState(0);
  const [currentImageInStory, setCurrentImageInStory] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({
    variant: 'fade-up',
    delay: 0
  });

  const {
    ref: categoriesRef,
    visibleItems: categoriesVisible,
    getItemClassName: getCategoryClassName,
    getItemStyle: getCategoryStyle
  } = useStaggeredAnimation({
    itemCount: galleryCategories.length,
    staggerDelay: isMobile ? 200 : 150,
    variant: 'slide-up'
  });

  const {
    ref: featuredRef,
    visibleItems: featuredVisible,
    getItemClassName: getFeaturedClassName,
    getItemStyle: getFeaturedStyle
  } = useStaggeredAnimation({
    itemCount: featuredImages.length,
    staggerDelay: isMobile ? 100 : 80,
    baseDelay: 400,
    variant: 'scale-fade'
  });

  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);

  // Auto-advance story images on mobile
  useEffect(() => {
    if (isPlaying && isMobile) {
      const timer = setInterval(() => {
        const currentStoryData = culinaryStories[currentStory];
        const nextImageIndex = (currentImageInStory + 1) % currentStoryData.images.length;
        
        if (nextImageIndex === 0) {
          // Move to next story
          const nextStoryIndex = (currentStory + 1) % culinaryStories.length;
          setCurrentStory(nextStoryIndex);
          setCurrentImageInStory(0);
        } else {
          setCurrentImageInStory(nextImageIndex);
        }
      }, 3000);

      return () => clearInterval(timer);
    }
  }, [isPlaying, currentStory, currentImageInStory, isMobile]);

  const nextStory = () => {
    setCurrentStory((prev) => (prev + 1) % culinaryStories.length);
    setCurrentImageInStory(0);
  };

  const prevStory = () => {
    setCurrentStory((prev) => (prev - 1 + culinaryStories.length) % culinaryStories.length);
    setCurrentImageInStory(0);
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-pattern-d relative overflow-hidden">
      {/* Ruby Background Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-radial from-ruby-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-radial from-ruby-light/15 to-transparent rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile-First Header */}
        <div ref={headerRef} className={`text-center mb-12 sm:mb-16 md:mb-20 ${headerAnimationClass}`}>
          <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 mb-4 sm:mb-6 bg-ruby-light/10 rounded-full border border-ruby-light/20">
            <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-ruby-dark" />
            <span className="text-ruby-dark text-xs sm:text-sm font-medium">Visual Gallery</span>
          </div>
          
          <h2 className="font-elegant text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-2 sm:mb-4 leading-tight px-2">
            Charleston's Most
          </h2>
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-script bg-gradient-ruby-primary bg-clip-text text-transparent mb-4 sm:mb-6">
            Cherished Creations
          </div>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Explore our portfolio of stunning events, from intimate celebrations to grand galas, 
            each showcasing our commitment to culinary excellence.
          </p>
        </div>

        {/* Touch-Optimized Gallery Categories */}
        <div ref={categoriesRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 md:mb-20">
          {galleryCategories.map((category, index) => (
            <NeumorphicCard
              key={category.title}
              level={2}
              interactive
              className={`group cursor-pointer hover:scale-[1.02] transition-all duration-500 overflow-hidden min-h-[320px] sm:min-h-[360px] ${getCategoryClassName(index)}`}
              style={getCategoryStyle(index)}
              onClick={() => setSelectedCategory(selectedCategory === index ? null : index)}
            >
              <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden rounded-lg mb-4 sm:mb-6">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ruby-dark/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 sm:p-4 transform scale-75 group-hover:scale-100 transition-transform duration-500">
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-ruby-primary" />
                  </div>
                </div>
                
                {/* Photo Count Badge */}
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-ruby-primary/90 backdrop-blur-sm text-white text-xs sm:text-sm font-medium px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                  {category.photos} photos
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-elegant text-lg sm:text-xl md:text-2xl font-semibold text-foreground leading-tight">
                  {category.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-between pt-2 sm:pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-ruby-primary hover:text-ruby-dark hover:bg-ruby-light/10 p-0 h-auto font-medium"
                    asChild
                  >
                    <a href={category.link} className="flex items-center space-x-1 sm:space-x-2">
                      <span className="text-xs sm:text-sm">Explore Collection</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                  
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-ruby-primary" />
                    <span className="text-xs sm:text-sm">{Math.floor(Math.random() * 50) + 20}</span>
                  </div>
                </div>
              </div>
            </NeumorphicCard>
          ))}
        </div>

        {/* Our Culinary Stories */}
        <NeumorphicCard level={3} className="p-6 sm:p-8 lg:p-12">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="font-elegant text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              Charleston's Most
              <span className="block font-script bg-gradient-ruby-primary bg-clip-text text-transparent text-lg sm:text-xl md:text-2xl lg:text-3xl mt-1 sm:mt-2">
                Cherished Stories
              </span>
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience our culinary journey through interactive stories of memorable celebrations
            </p>
          </div>
          
          {/* Mobile: Instagram-Style Stories */}
          {isMobile ? (
            <div className="space-y-6">
              
              {/* Story Progress Bars */}
              <div className="flex gap-1">
                {culinaryStories[currentStory].images.map((_, index) => (
                  <div 
                    key={index}
                    className="h-1 bg-muted rounded-full flex-1 overflow-hidden"
                  >
                    <div 
                      className={`h-full bg-ruby-primary transition-all duration-300 ${
                        index < currentImageInStory ? 'w-full' : 
                        index === currentImageInStory ? 'w-1/2' : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Current Story Display */}
              <NeumorphicCard level={2} className="p-0 overflow-hidden">
                <div className="relative aspect-[4/5]">
                  <img
                    src={culinaryStories[currentStory].images[currentImageInStory].src}
                    alt={culinaryStories[currentStory].images[currentImageInStory].alt}
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                  
                  {/* Story Info Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {culinaryStories[currentStory].title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {culinaryStories[currentStory].description}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 bg-ruby-primary/30 backdrop-blur-sm rounded-full text-white hover:bg-ruby-primary/50 transition-colors"
                      aria-label={isPlaying ? "Pause story" : "Play story"}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Caption Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm bg-ruby-primary/30 backdrop-blur-sm px-3 py-2 rounded-lg">
                      {culinaryStories[currentStory].images[currentImageInStory].caption}
                    </p>
                  </div>

                  {/* Touch Areas for Navigation */}
                  <button
                    onClick={prevStory}
                    className="absolute left-0 top-0 bottom-0 w-1/3 bg-transparent"
                    aria-label="Previous story"
                  />
                  <button
                    onClick={nextStory}
                    className="absolute right-0 top-0 bottom-0 w-1/3 bg-transparent"
                    aria-label="Next story"
                  />
                </div>
              </NeumorphicCard>

              {/* Story Navigation */}
              <div className="flex justify-center gap-2">
                {culinaryStories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentStory(index);
                      setCurrentImageInStory(0);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStory ? 'bg-ruby-primary' : 'bg-muted'
                    }`}
                    aria-label={`View story ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            
            /* Desktop: Static Grid with Ruby Accents */
            <div ref={featuredRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
              {featuredImages.map((image, index) => (
                <div
                  key={index}
                  className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer group ${getFeaturedClassName(index)}`}
                  style={getFeaturedStyle(index)}
                  onMouseEnter={() => setHoveredImage(index)}
                  onMouseLeave={() => setHoveredImage(null)}
                >
                  <img
                    src={image}
                    alt={`Featured culinary moment ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Hover/Selected Overlay */}
                  <div className={`absolute inset-0 bg-ruby-primary/20 transition-opacity duration-300 ${
                    hoveredImage === index ? 'opacity-100' : 'opacity-0'
                  }`} />
                  
                  {/* Expand Icon */}
                  <div className={`absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1 sm:p-2 transition-all duration-300 ${
                    hoveredImage === index ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}>
                    <Expand className="w-3 h-3 sm:w-4 sm:h-4 text-ruby-primary" />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* CTA Button */}
          <div className="text-center">
            <Button
              variant="cta"
              size="responsive-lg"
              className="min-w-[200px] sm:min-w-[240px] min-h-[48px] shadow-elevated hover:shadow-glow-strong transition-all duration-300"
              asChild
            >
              <a href="/photo-gallery" className="flex items-center justify-center space-x-2 sm:space-x-3">
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-sm sm:text-base">View Complete Gallery</span>
              </a>
            </Button>
          </div>
        </NeumorphicCard>
      </div>
    </section>
  );
};