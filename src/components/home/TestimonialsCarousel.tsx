import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface Testimonial {
  name: string;
  role?: string;
  event?: string;
  rating: number;
  quote: string;
  highlight: string;
}

export const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0 
  });

  const animationClass = useAnimationClass('ios-spring', isVisible);
  
  const testimonials: Testimonial[] = [
    {
      name: "Sarah & Michael Johnson",
      role: "Wedding Couple",
      event: "Wedding Reception - 150 guests",
      rating: 5,
      quote: "Soul Train's Eatery made our wedding day absolutely perfect. From the elegant presentation to the incredible flavors, every detail exceeded our expectations. Our guests are still talking about the food months later!",
      highlight: "Exceeded expectations"
    },
    {
      name: "Jennifer Martinez",
      role: "Event Coordinator",
      event: "Corporate Annual Gala - 200 guests",
      rating: 5,
      quote: "Working with Chef Train and his team is always a pleasure. They handle everything with such professionalism and the food quality is consistently outstanding. They've become our go-to caterer for all major events.",
      highlight: "Consistently outstanding"
    },
    {
      name: "Robert Williams",
      role: "Family Celebration Host",
      event: "Family Reunion - 75 guests",
      rating: 5,
      quote: "The authentic Southern flavors brought our family together in the most beautiful way. You can taste the love and tradition in every bite. Tanya's desserts were the perfect finale to an incredible meal.",
      highlight: "Authentic Southern flavors"
    },
    {
      name: "Amanda Chen",
      role: "Bride",
      event: "Intimate Wedding - 50 guests",
      rating: 5,
      quote: "From our first tasting to the wedding day, Soul Train's Eatery was incredible. They accommodated all our dietary restrictions and created a menu that was both elegant and delicious. Absolutely recommend!",
      highlight: "Accommodated all needs"
    }
  ];

  // Auto-advance testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section 
      ref={ref}
      className="relative py-16 sm:py-20 lg:py-24 overflow-hidden"
    >
      {/* Full-width Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png')` 
        }}
        aria-hidden="true"
      />
      
      {/* Dark gradient overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />

      {/* Top gradient fade for smooth section transition */}
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-black/70 to-transparent z-10" />
      
      {/* Bottom gradient fade for smooth section transition */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-black/70 to-transparent z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-6 lg:mb-10 space-y-3 ${animationClass}`}>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Quote className="h-5 w-5 text-white" />
            <Badge variant="outline" className="border-white/50 text-white font-script text-sm">
              Client Love
            </Badge>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-white">
            What Our Clients Say
          </h2>
          <p className="text-xl sm:text-2xl font-script text-white/90 font-medium">
            Real Stories, Real Satisfaction
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className={`max-w-4xl mx-auto ${animationClass}`}>
          <Card 
            className="relative p-5 lg:p-6 !bg-none !bg-black/35 !backdrop-blur-md !border-white/20 !shadow-none ring-1 ring-white/10 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Quote Icon */}
            <div className="absolute top-4 left-4 opacity-10">
              <Quote className="h-12 w-12 lg:h-16 lg:w-16 text-white/30" />
            </div>

            <div className="relative z-10 space-y-5">
              {/* Rating */}
              <div className="flex items-center justify-center space-x-1">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-gold fill-gold" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-center text-base lg:text-lg text-white leading-relaxed italic">
                "{currentTestimonial.quote}"
              </blockquote>

              {/* Highlight Badge */}
              <div className="flex justify-center">
                <Badge className="bg-gradient-ruby-primary text-white border-0 text-sm">
                  <Heart className="h-3 w-3 mr-1 fill-white" />
                  {currentTestimonial.highlight}
                </Badge>
              </div>

              {/* Author Info */}
              <div className="text-center space-y-2">
                <h4 className="font-elegant font-bold text-white text-lg">
                  {currentTestimonial.name}
                </h4>
                {currentTestimonial.role && (
                  <p className="text-base text-ruby font-script">
                    {currentTestimonial.role}
                  </p>
                )}
                {currentTestimonial.event && (
                  <p className="text-sm text-white/80">
                    {currentTestimonial.event}
                  </p>
                )}
              </div>
            </div>

            {/* Navigation Buttons - Hidden on mobile (<768px), shown on tablets and desktop */}
            <div className="hidden md:block">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 !bg-none !bg-black/50 !backdrop-blur-md hover:!bg-black/70 !border !border-white/30 !text-white shadow-lg"
                onClick={goToPrevious}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 !bg-none !bg-black/50 !backdrop-blur-md hover:!bg-black/70 !border !border-white/30 !text-white shadow-lg"
                onClick={goToNext}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </Button>
            </div>
          </Card>

          {/* Dots Navigation */}
          <div className="flex items-center justify-center mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to testimonial ${index + 1} of ${testimonials.length}`}
                aria-current={index === currentIndex ? 'true' : undefined}
                className="min-w-[24px] min-h-[24px] flex items-center justify-center"
              >
                <span className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 bg-gradient-ruby-primary' 
                    : 'w-2 bg-ruby/30 hover:bg-ruby/50'
                }`} />
              </button>
            ))}
          </div>

          {/* Swipe Instruction - Mobile only (<768px) */}
          <p className="text-center text-xs text-white/60 mt-4 md:hidden">
            Swipe left or right to see more testimonials
          </p>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-3 gap-3 mt-6 lg:mt-8 max-w-2xl mx-auto ${animationClass}`}>
          <Card className="p-3 text-center !bg-none !bg-black/35 !backdrop-blur-md !border-white/20 !shadow-none ring-1 ring-white/10">
            <div className="text-lg lg:text-xl font-bold text-white drop-shadow-sm">500+</div>
            <div className="text-sm text-white/70 drop-shadow-sm">Events Catered</div>
          </Card>
          <Card className="p-3 text-center !bg-none !bg-black/35 !backdrop-blur-md !border-white/20 !shadow-none ring-1 ring-white/10">
            <div className="text-lg lg:text-xl font-bold text-white drop-shadow-sm">★ 4.9</div>
            <div className="text-sm text-white/70 drop-shadow-sm">Average Rating</div>
          </Card>
          <Card className="p-3 text-center !bg-none !bg-black/35 !backdrop-blur-md !border-white/20 !shadow-none ring-1 ring-white/10">
            <div className="text-lg lg:text-xl font-bold text-white drop-shadow-sm">98%</div>
            <div className="text-sm text-white/70 drop-shadow-sm">Would Recommend</div>
          </Card>
        </div>
      </div>
    </section>
  );
};