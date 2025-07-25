import { useState, useEffect } from "react";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  Calendar,
  MapPin
} from "lucide-react";

const testimonials = [
  {
    quote: "Soul Train's Eatery transformed our wedding into a culinary masterpiece. Every dish was a work of art that our guests are still talking about months later.",
    author: "Sarah & Michael Johnson",
    event: "Wedding Reception",
    rating: 5,
    image: "/lovable-uploads/eca9632d-b79e-4584-8287-00cc36515fc6.png",
    location: "Beverly Hills, CA",
    date: "June 2024"
  },
  {
    quote: "The attention to detail and flavors were absolutely incredible. Our corporate event was elevated to a whole new level of sophistication.",
    author: "Jennifer Martinez",
    event: "Corporate Gala",
    rating: 5,
    image: "/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png",
    location: "Downtown LA",
    date: "March 2024"
  },
  {
    quote: "From the first bite to the last, everything was perfection. The team's professionalism and the quality of food exceeded all our expectations.",
    author: "David & Lisa Chen",
    event: "Anniversary Celebration",
    rating: 5,
    image: "/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png",
    location: "Malibu, CA",
    date: "August 2024"
  },
  {
    quote: "The presentation was stunning and the taste was even better. They turned our backyard party into an elegant dining experience.",
    author: "Amanda Rodriguez",
    event: "Birthday Party",
    rating: 5,
    image: "/lovable-uploads/26d2d500-6017-41a2-99b2-b7050cefedba.png",
    location: "Santa Monica, CA",
    date: "May 2024"
  }
];

export const SwipeableTestimonials = () => {
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({
    variant: 'fade-up',
    delay: 0
  });

  const { ref: testimonialsRef, isVisible: testimonialsVisible, variant: testimonialsVariant } = useScrollAnimation({
    variant: 'scale-fade',
    delay: 200
  });

  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);
  const testimonialsAnimationClass = useAnimationClass(testimonialsVariant, testimonialsVisible);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || !testimonialsVisible) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonialsVisible]);

  // Touch handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsAutoPlaying(false);
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
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }

    // Resume auto-play after 3 seconds
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-ruby-light/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-24 h-24 sm:w-36 sm:h-36 bg-ruby-primary/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile-First Header */}
        <div ref={headerRef} className={`text-center mb-12 sm:mb-16 md:mb-20 ${headerAnimationClass}`}>
          <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 mb-4 sm:mb-6 bg-ruby-light/10 rounded-full border border-ruby-light/20">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-ruby-dark" />
            <span className="text-ruby-dark text-xs sm:text-sm font-medium">Client Stories</span>
          </div>
          
          <h2 className="font-elegant text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight px-2">
            What Our Clients
            <span className="block font-script text-ruby-primary text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mt-1 sm:mt-2">
              Are Saying
            </span>
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Don't just take our word for it. Hear from couples, companies, and families 
            who've experienced our culinary excellence.
          </p>
        </div>

        {/* Swipeable Testimonials Container */}
        <div ref={testimonialsRef} className={testimonialsAnimationClass}>
          <NeumorphicCard 
            level={3} 
            className="relative overflow-hidden max-w-5xl mx-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Main Testimonial Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 p-6 sm:p-8 lg:p-12">
              {/* Quote Section */}
              <div className="space-y-4 sm:space-y-6 flex flex-col justify-center">
                <div className="flex items-center justify-center lg:justify-start mb-4 sm:mb-6">
                  <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-ruby-primary opacity-50" />
                </div>
                
                <blockquote className="font-script text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground leading-relaxed text-center lg:text-left">
                  "{currentTestimonial.quote}"
                </blockquote>
                
                {/* Rating */}
                <div className="flex justify-center lg:justify-start space-x-1">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                
                {/* Author Info */}
                <div className="text-center lg:text-left space-y-2">
                  <div className="font-elegant text-base sm:text-lg md:text-xl font-semibold text-foreground">
                    {currentTestimonial.author}
                  </div>
                  <div className="text-sm sm:text-base text-ruby-primary font-medium">
                    {currentTestimonial.event}
                  </div>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{currentTestimonial.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{currentTestimonial.date}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Image Section */}
              <div className="relative">
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                  <img
                    src={currentTestimonial.image}
                    alt={`${currentTestimonial.event} by Soul Train's Eatery`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ruby-dark/20 to-transparent" />
                </div>
              </div>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-t border-border/50">
              {/* Previous/Next Buttons */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevTestimonial}
                  className="w-8 h-8 sm:w-10 sm:h-10 p-0 border-ruby-primary/30 hover:border-ruby-primary hover:bg-ruby-light/10"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextTestimonial}
                  className="w-8 h-8 sm:w-10 sm:h-10 p-0 border-ruby-primary/30 hover:border-ruby-primary hover:bg-ruby-light/10"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
              
              {/* Dot Indicators */}
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 touch-manipulation ${
                      index === currentIndex 
                        ? 'bg-ruby-primary scale-110' 
                        : 'bg-ruby-primary/30 hover:bg-ruby-primary/50'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              
              {/* Auto-play Indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {isAutoPlaying ? 'Auto' : 'Paused'}
                </span>
              </div>
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </section>
  );
};