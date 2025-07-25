import { useState } from "react";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { SectionContentCard } from "@/components/ui/section-content-card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { ChevronLeft, ChevronRight, Eye, Star, Users, Calendar, Award, Heart } from "lucide-react";
import { galleryImages } from "@/data/galleryImages";

export const JourneyGalleryFusion = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);

  const { ref, getItemClassName } = useStaggeredAnimation({
    itemCount: 12,
    staggerDelay: 100,
    variant: "scale-fade"
  });

  const categories = [
    { value: "all", label: "All Journeys", icon: Heart },
    { value: "wedding", label: "Weddings", icon: Heart },
    { value: "corporate", label: "Corporate", icon: Users },
    { value: "buffet", label: "Buffet Service", icon: Calendar },
    { value: "formal", label: "Formal Events", icon: Star }
  ];

  // Get high-quality images from our gallery
  const galleryItems = galleryImages
    .filter(img => img.quality >= 7) // Only show high-quality images
    .slice(0, 12) // Limit to 12 items for performance
    .map(img => ({
      category: img.category,
      title: img.title,
      description: img.description,
      image: img.src,
      featured: img.quality >= 8
    }));

  const filteredItems = activeCategory === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const nextSlide = () => {
    if (currentSlide < filteredItems.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-ruby-50/10 to-background">
      <ResponsiveWrapper>
        <div ref={ref} className="space-y-16">
          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-elegant font-bold mb-6">
              Curated Gallery of
              <br />
              <span className="font-script text-ruby-600 text-2xl md:text-3xl">
                Culinary Experiences
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Explore the moments that make each celebration special, from intimate gatherings to grand occasions showcasing Soul Train's Eatery's heritage and expertise.
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8" role="tablist" aria-label="Gallery categories">
            {categories.map((category) => (
              <NeumorphicButton
                key={category.value}
                variant={activeCategory === category.value ? "primary" : "outline"}
                onClick={() => {
                  setActiveCategory(category.value);
                  setCurrentSlide(0);
                }}
                role="tab"
                aria-selected={activeCategory === category.value}
                aria-controls="gallery-content"
                className="px-6 py-2 min-h-[44px] flex items-center gap-2"
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </NeumorphicButton>
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="block md:hidden">
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${Math.min(currentSlide, Math.max(0, filteredItems.length - 1)) * 100}%)` }}
                >
                  {filteredItems.map((item, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                      <SectionContentCard level={1} className="mx-2 h-full">
                        <div className="space-y-4">
                          <div className="aspect-video rounded-lg overflow-hidden">
                            <OptimizedImage 
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              containerClassName="w-full h-full"
                            />
                          </div>
                          <div>
                            <h3 className="font-elegant font-semibold mb-2">
                              {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </SectionContentCard>
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                aria-label="Previous gallery image"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-ruby-500"
              >
                <ChevronLeft className="w-5 h-5 text-ruby-600" />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentSlide >= filteredItems.length - 1}
                aria-label="Next gallery image"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-ruby-500"
              >
                <ChevronRight className="w-5 h-5 text-ruby-600" />
              </button>
              
              {/* Slide Indicators */}
              <div className="flex justify-center mt-4 gap-2" role="tablist" aria-label="Gallery slides">
                {filteredItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    role="tab"
                    aria-selected={index === currentSlide}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`w-3 h-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-ruby-500 focus:ring-offset-1 ${
                      index === currentSlide ? 'bg-ruby-500' : 'bg-ruby-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Grid */}
          <div 
            className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" 
            id="gallery-content"
            role="tabpanel"
            aria-live="polite"
          >
            {filteredItems.map((item, index) => (
              <div
                key={index}
                className={`${getItemClassName(index)} group cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <SectionContentCard level={1} interactive className="h-full hover:scale-105 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <OptimizedImage 
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        containerClassName="w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-elegant font-semibold mb-2 group-hover:text-ruby-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </SectionContentCard>
              </div>
            ))}
          </div>

          {/* Experience Highlights */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-elegant font-bold text-center mb-12">
              Experience Highlights of <span className="font-script text-ruby-600">Soul Train's Eatery</span>
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Heart,
                  title: "Charleston Heritage",
                  description: "25+ years of authentic Lowcountry culinary tradition bringing families together since 1999."
                },
                {
                  icon: Star,
                  title: "Premium Quality",
                  description: "Family-owned commitment to exceptional ingredients and expert culinary techniques for outstanding taste."
                },
                {
                  icon: Users,
                  title: "10,000+ Families Served",
                  description: "Creating memorable experiences across 50+ venues throughout Charleston and the Lowcountry."
                }
              ].map((highlight, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-ruby-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <highlight.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-elegant font-semibold mb-3">
                    {highlight.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <NeumorphicButton 
              size="lg" 
              className="px-8 py-4 min-h-[44px]"
              aria-label="View our complete gallery of catering work"
            >
              <Eye className="w-5 h-5 mr-2" />
              View Complete Gallery
            </NeumorphicButton>
          </div>
        </div>
      </ResponsiveWrapper>
    </section>
  );
};