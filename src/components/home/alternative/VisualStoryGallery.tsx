import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight, Play, Pause, Eye } from "lucide-react";

export const VisualStoryGallery = () => {
  const isMobile = useIsMobile();
  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up',
    threshold: 0.1,
    triggerOnce: true
  });

  const [currentStory, setCurrentStory] = useState(0);
  const [currentImageInStory, setCurrentImageInStory] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const stories = [
    {
      id: "weddings",
      title: "Wedding Celebrations",
      description: "Romantic moments captured",
      images: [
        {
          src: "/lovable-uploads/f6f0cdc2-cd71-4392-984e-ed9609103e42.png",
          alt: "Elegant wedding reception venue",
          caption: "Romantic venue setup"
        },
        {
          src: "/lovable-uploads/adfb4ea8-c62c-4f6d-b7dd-b562466c2c31.png",
          alt: "Wedding dessert display",
          caption: "Sweet celebration"
        },
        {
          src: "/lovable-uploads/ce12a76f-20cf-449f-8755-4d84cbf1688a.png",
          alt: "Wedding grazing table",
          caption: "Artful presentation"
        }
      ]
    },
    {
      id: "corporate",
      title: "Corporate Events",
      description: "Professional excellence",
      images: [
        {
          src: "/lovable-uploads/92c3b6c8-61dc-4c37-afa8-a0a4db04c551.png",
          alt: "Corporate buffet setup",
          caption: "Business elegance"
        },
        {
          src: "/lovable-uploads/f6f0cdc2-cd71-4392-984e-ed9609103e42.png",
          alt: "Corporate event venue",
          caption: "Professional atmosphere"
        }
      ]
    },
    {
      id: "private",
      title: "Private Parties",
      description: "Intimate celebrations",
      images: [
        {
          src: "/lovable-uploads/ce12a76f-20cf-449f-8755-4d84cbf1688a.png",
          alt: "Private party spread",
          caption: "Personal touch"
        },
        {
          src: "/lovable-uploads/adfb4ea8-c62c-4f6d-b7dd-b562466c2c31.png",
          alt: "Elegant private dining",
          caption: "Intimate dining"
        }
      ]
    }
  ];

  const categories = [
    { id: "all", name: "All Events" },
    { id: "weddings", name: "Weddings" },
    { id: "corporate", name: "Corporate" },
    { id: "private", name: "Private" }
  ];

  // Auto-advance story images
  useEffect(() => {
    if (isPlaying && isMobile) {
      const timer = setInterval(() => {
        const currentStoryData = stories[currentStory];
        const nextImageIndex = (currentImageInStory + 1) % currentStoryData.images.length;
        
        if (nextImageIndex === 0) {
          // Move to next story
          const nextStoryIndex = (currentStory + 1) % stories.length;
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
    setCurrentStory((prev) => (prev + 1) % stories.length);
    setCurrentImageInStory(0);
  };

  const prevStory = () => {
    setCurrentStory((prev) => (prev - 1 + stories.length) % stories.length);
    setCurrentImageInStory(0);
  };

  const filteredStories = selectedCategory === "all" 
    ? stories 
    : stories.filter(story => story.id === selectedCategory);

  return (
    <section 
      ref={ref}
      className="py-16 lg:py-24 bg-gradient-pattern-d"
      aria-label="Visual gallery showcase"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-4">
            Our Culinary Stories
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary via-primary-light to-primary mx-auto mb-6 rounded-full" />
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Every event tells a story. Discover how we bring these moments to life through 
            exceptional cuisine and unforgettable experiences.
          </p>
        </div>

        {/* Mobile: Instagram-Style Stories */}
        {isMobile ? (
          <div className="space-y-6">
            
            {/* Story Progress Bars */}
            <div className="flex gap-1">
              {stories[currentStory].images.map((_, index) => (
                <div 
                  key={index}
                  className="h-1 bg-muted rounded-full flex-1 overflow-hidden"
                >
                  <div 
                    className={`h-full bg-primary transition-all duration-300 ${
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
                <OptimizedImage
                  src={stories[currentStory].images[currentImageInStory].src}
                  alt={stories[currentStory].images[currentImageInStory].alt}
                  aspectRatio="aspect-[4/5]"
                  containerClassName="h-full"
                  className="transition-all duration-500"
                />
                
                {/* Story Info Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {stories[currentStory].title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {stories[currentStory].description}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition-colors"
                    aria-label={isPlaying ? "Pause story" : "Play story"}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                </div>

                {/* Caption Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm bg-black/30 px-3 py-2 rounded-lg backdrop-blur-sm">
                    {stories[currentStory].images[currentImageInStory].caption}
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
              {stories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentStory(index);
                    setCurrentImageInStory(0);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStory ? 'bg-primary' : 'bg-muted'
                  }`}
                  aria-label={`View story ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          
          /* Desktop: Masonry Grid with Filters */
          <div>
            
            {/* Category Filters */}
            <div className="flex justify-center mb-12">
              <div className="flex gap-2 p-1 bg-muted/30 rounded-lg">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {filteredStories.map((story) =>
                story.images.map((image, imageIndex) => (
                  <NeumorphicCard
                    key={`${story.id}-${imageIndex}`}
                    level={1}
                    interactive
                    className="group p-3 hover:neumorphic-card-2 transition-all duration-300"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden">
                      <OptimizedImage
                        src={image.src}
                        alt={image.alt}
                        aspectRatio="aspect-square"
                        containerClassName="h-full"
                        className="group-hover:scale-110 transition-transform duration-300"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <h4 className="text-white font-semibold text-sm mb-1">
                            {story.title}
                          </h4>
                          <p className="text-white/80 text-xs">
                            {image.caption}
                          </p>
                        </div>
                        
                        <div className="absolute top-4 right-4">
                          <Eye className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </NeumorphicCard>
                ))
              )}
            </div>
          </div>
        )}

        {/* View Full Gallery CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <Button asChild size="lg">
            <Link to="/gallery" className="flex items-center gap-2">
              View Full Gallery
              <Eye className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};