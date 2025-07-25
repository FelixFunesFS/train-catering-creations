import { useState } from "react";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { SectionContentCard } from "@/components/ui/section-content-card";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { Heart, Users, Star, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export const JourneyGalleryFusion = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);

  const { ref, getItemClassName } = useStaggeredAnimation({
    itemCount: 8,
    staggerDelay: 100,
    variant: "scale-fade"
  });

  const categories = [
    { id: "all", label: "All Journeys", icon: Heart },
    { id: "wedding", label: "Weddings", icon: Heart },
    { id: "corporate", label: "Corporate", icon: Users },
    { id: "special", label: "Special Events", icon: Star },
    { id: "catering", label: "Catering", icon: Calendar }
  ];

  const galleryItems = [
    {
      id: 1,
      title: "Elegant Wedding Reception",
      category: "wedding",
      image: "/placeholder.svg",
      description: "A magical Charleston wedding celebration with Southern charm"
    },
    {
      id: 2,
      title: "Corporate Excellence", 
      category: "corporate",
      image: "/placeholder.svg",
      description: "Professional catering that impresses and delights"
    },
    {
      id: 3,
      title: "Birthday Celebration",
      category: "special", 
      image: "/placeholder.svg",
      description: "Milestone moments made memorable with exceptional cuisine"
    },
    {
      id: 4,
      title: "Gourmet Catering Setup",
      category: "catering",
      image: "/placeholder.svg", 
      description: "Beautifully presented dishes ready to serve"
    },
    {
      id: 5,
      title: "Anniversary Dinner",
      category: "special",
      image: "/placeholder.svg",
      description: "Intimate celebrations with personalized touches"
    },
    {
      id: 6,
      title: "Business Lunch",
      category: "corporate",
      image: "/placeholder.svg", 
      description: "Sophisticated dining for professional occasions"
    },
    {
      id: 7,
      title: "Garden Wedding",
      category: "wedding",
      image: "/placeholder.svg",
      description: "Outdoor elegance with Southern hospitality"
    },
    {
      id: 8,
      title: "Holiday Feast",
      category: "special",
      image: "/placeholder.svg",
      description: "Seasonal celebrations with traditional flavors"
    }
  ];

  const filteredItems = activeCategory === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, filteredItems.length - 2));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, filteredItems.length - 2)) % Math.max(1, filteredItems.length - 2));
  };

  return (
    <section className="py-20 bg-gradient-to-b from-ruby-50/10 to-background">
      <ResponsiveWrapper>
        <div ref={ref} className="space-y-16">
          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-elegant font-bold mb-6">
              Culinary Journey
              <br />
              <span className="font-script text-ruby-600 text-2xl md:text-3xl">
                Gallery & Experiences
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Discover the moments that make each celebration special, from intimate gatherings to grand occasions.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <NeumorphicButton
                key={category.id}
                variant={activeCategory === category.id ? "primary" : "outline"}
                onClick={() => {
                  setActiveCategory(category.id);
                  setCurrentSlide(0);
                }}
                className="flex items-center gap-2"
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </NeumorphicButton>
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="block md:hidden">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <NeumorphicButton
                  variant="outline"
                  size="icon"
                  onClick={prevSlide}
                  disabled={filteredItems.length <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </NeumorphicButton>
                
                <span className="text-sm text-muted-foreground">
                  {currentSlide + 1} / {Math.max(1, filteredItems.length)}
                </span>
                
                <NeumorphicButton
                  variant="outline"
                  size="icon"
                  onClick={nextSlide}
                  disabled={filteredItems.length <= 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </NeumorphicButton>
              </div>
              
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {filteredItems.map((item, index) => (
                    <div key={item.id} className="w-full flex-shrink-0 px-2">
                      <SectionContentCard level={1} className="h-full">
                        <div className="aspect-video bg-gradient-ruby-subtle rounded-lg mb-4 flex items-center justify-center">
                          <span className="text-white font-script text-xl">
                            {item.title}
                          </span>
                        </div>
                        <h3 className="font-elegant font-semibold mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </SectionContentCard>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <SectionContentCard
                key={item.id}
                level={1}
                interactive
                className={`${getItemClassName(index)} group cursor-pointer hover:scale-105 transition-all duration-300`}
              >
                <div className="space-y-4">
                  <div className="aspect-video bg-gradient-ruby-subtle rounded-lg flex items-center justify-center overflow-hidden">
                    <span className="text-white font-script text-lg group-hover:scale-110 transition-transform duration-300">
                      {item.title}
                    </span>
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
            ))}
          </div>

          {/* Experience Highlights */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-elegant font-bold text-center mb-12">
              What Makes Each Journey <span className="font-script text-ruby-600">Special</span>
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Heart,
                  title: "Personal Touch",
                  description: "Every event is crafted with care and attention to your unique story and preferences."
                },
                {
                  icon: Star,
                  title: "Exceptional Quality",
                  description: "Premium ingredients and expert culinary techniques ensure outstanding taste and presentation."
                },
                {
                  icon: Users,
                  title: "Memorable Moments",
                  description: "We create experiences that bring people together and create lasting memories."
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

          {/* CTA */}
          <div className="text-center">
            <NeumorphicButton size="lg" className="px-8 py-4">
              View Complete Gallery
            </NeumorphicButton>
          </div>
        </div>
      </ResponsiveWrapper>
    </section>
  );
};