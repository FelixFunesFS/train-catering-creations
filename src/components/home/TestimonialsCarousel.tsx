import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, ChevronLeft, ChevronRight, Heart, Facebook } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFacebookReviews } from "@/hooks/useFacebookReviews";

interface Testimonial {
  name: string;
  role?: string;
  event?: string;
  rating: number;
  quote: string;
  highlight: string;
  source?: 'facebook' | 'curated';
}

export const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0 
  });

  const animationClass = useAnimationClass('ios-spring', isVisible);
  
  // Fetch Facebook reviews
  const { reviews: facebookReviews } = useFacebookReviews({ limit: 3 });

  const curatedTestimonials: Testimonial[] = [
    {
      name: "Sarah & Michael Johnson",
      role: "Wedding Couple",
      event: "Wedding Reception - 150 guests",
      rating: 5,
      quote: "Soul Train's Eatery made our wedding day absolutely perfect. From the elegant presentation to the incredible flavors, every detail exceeded our expectations. Our guests are still talking about the food months later!",
      highlight: "Exceeded expectations",
      source: 'curated'
    },
    {
      name: "Jennifer Martinez",
      role: "Event Coordinator",
      event: "Corporate Annual Gala - 200 guests",
      rating: 5,
      quote: "Working with Chef Train and his team is always a pleasure. They handle everything with such professionalism and the food quality is consistently outstanding. They've become our go-to caterer for all major events.",
      highlight: "Consistently outstanding",
      source: 'curated'
    },
    {
      name: "Robert Williams",
      role: "Family Celebration Host",
      event: "Family Reunion - 75 guests",
      rating: 5,
      quote: "The authentic Southern flavors brought our family together in the most beautiful way. You can taste the love and tradition in every bite. Tanya's desserts were the perfect finale to an incredible meal.",
      highlight: "Authentic Southern flavors",
      source: 'curated'
    },
    {
      name: "Amanda Chen",
      role: "Bride",
      event: "Intimate Wedding - 50 guests",
      rating: 5,
      quote: "From our first tasting to the wedding day, Soul Train's Eatery was incredible. They accommodated all our dietary restrictions and created a menu that was both elegant and delicious. Absolutely recommend!",
      highlight: "Accommodated all needs",
      source: 'curated'
    }
  ];

  // Convert Facebook reviews to testimonial format
  const facebookTestimonials: Testimonial[] = facebookReviews.map(review => ({
    name: review.name,
    rating: review.rating,
    quote: review.quote,
    highlight: "Verified Facebook Review",
    source: 'facebook' as const
  }));

  // Combine curated and Facebook testimonials
  const testimonials = [...curatedTestimonials, ...facebookTestimonials];

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
      className="py-8 sm:py-12 lg:py-16 bg-gradient-pattern-a"
    >
      <div className="container mx-auto px-3 sm:px-4">
        {/* Section Header */}
        <div className={`text-center mb-6 lg:mb-10 space-y-3 ${animationClass}`}>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Quote className="h-5 w-5 text-ruby" />
            <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
              Client Love
            </Badge>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground">
            What Our Clients Say
          </h2>
          <p className="text-xl sm:text-2xl font-script text-ruby font-medium">
            Real Stories, Real Satisfaction
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className={`max-w-4xl mx-auto ${animationClass}`}>
          <Card 
            className="relative p-5 lg:p-6 bg-white/95 backdrop-blur-sm border-2 border-ruby/20 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Quote Icon */}
            <div className="absolute top-4 left-4 opacity-10">
              <Quote className="h-12 w-12 lg:h-16 lg:w-16 text-ruby" />
            </div>

            <div className="relative z-10 space-y-5">
              {/* Rating */}
              <div className="flex items-center justify-center space-x-1">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-gold fill-gold" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-center text-base lg:text-lg text-foreground leading-relaxed italic">
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
                <div className="flex items-center justify-center gap-2">
                  <h4 className="font-elegant font-bold text-foreground text-lg">
                    {currentTestimonial.name}
                  </h4>
                  {currentTestimonial.source === 'facebook' && (
                    <Facebook className="h-4 w-4 text-[#1877F2] fill-[#1877F2]" />
                  )}
                </div>
                {currentTestimonial.role && (
                  <p className="text-base text-ruby font-script">
                    {currentTestimonial.role}
                  </p>
                )}
                {currentTestimonial.event && (
                  <p className="text-sm text-muted-foreground">
                    {currentTestimonial.event}
                  </p>
                )}
                {currentTestimonial.source === 'facebook' && (
                  <Badge variant="outline" className="border-[#1877F2] text-[#1877F2]">
                    <Facebook className="h-3 w-3 mr-1" />
                    Facebook Review
                  </Badge>
                )}
              </div>
            </div>

            {/* Navigation Buttons - Desktop */}
            {!isMobile && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white border border-ruby/20"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-4 w-4 text-ruby" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white border border-ruby/20"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-4 w-4 text-ruby" />
                </Button>
              </>
            )}
          </Card>

          {/* Dots Navigation */}
          <div className="flex items-center justify-center space-x-3 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 bg-gradient-ruby-primary' 
                    : 'w-2 bg-ruby/30 hover:bg-ruby/50'
                }`}
              />
            ))}
          </div>

          {/* Swipe Instruction for Mobile */}
          {isMobile && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Swipe left or right to see more testimonials
            </p>
          )}
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-3 gap-3 mt-6 lg:mt-8 max-w-2xl mx-auto ${animationClass}`}>
          <Card className="p-3 text-center bg-white/60 border-ruby/20">
            <div className="text-lg lg:text-xl font-bold text-ruby">500+</div>
            <div className="text-sm text-muted-foreground">Events Catered</div>
          </Card>
          <Card className="p-3 text-center bg-white/60 border-ruby/20">
            <div className="text-lg lg:text-xl font-bold text-ruby">★ 4.9</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </Card>
          <Card className="p-3 text-center bg-white/60 border-ruby/20">
            <div className="text-lg lg:text-xl font-bold text-ruby">98%</div>
            <div className="text-sm text-muted-foreground">Would Recommend</div>
          </Card>
        </div>
      </div>
    </section>
  );
};