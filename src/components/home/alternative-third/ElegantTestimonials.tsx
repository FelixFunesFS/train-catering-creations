import { Card, CardContent } from "@/components/ui/card";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "The most exquisite catering we've ever experienced. Every dish was a masterpiece, and the service was flawless. Our wedding guests are still talking about the incredible food months later.",
    author: "Sarah & Michael Chen",
    event: "Wedding Reception",
    rating: 5,
    image: "/lovable-uploads/elegant-couple.jpg"
  },
  {
    quote: "Professional, punctual, and absolutely delicious. They transformed our corporate event into something truly special. The presentation was stunning and accommodated all dietary restrictions perfectly.",
    author: "David Rodriguez",
    event: "Corporate Gala",
    rating: 5,
    image: "/lovable-uploads/business-executive.jpg"
  },
  {
    quote: "From the initial consultation to the final cleanup, everything was handled with such care and attention to detail. The food was restaurant-quality, and the service felt like fine dining.",
    author: "Emily Thompson",
    event: "Anniversary Celebration",
    rating: 5,
    image: "/lovable-uploads/happy-client.jpg"
  }
];

export const ElegantTestimonials = () => {
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0 
  });
  
  const { 
    ref: testimonialsRef, 
    getItemClassName, 
    getItemStyle 
  } = useStaggeredAnimation({ 
    itemCount: testimonials.length, 
    staggerDelay: 200, 
    baseDelay: 300,
    variant: 'scale-fade'
  });

  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-ruby/5 to-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-ruby/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-ruby/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div ref={headerRef} className={`text-center mb-16 ${headerAnimationClass}`}>
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-ruby/10 rounded-full">
            <Star className="w-4 h-4 mr-2 text-ruby" />
            <span className="text-ruby text-sm font-medium">Client Stories</span>
          </div>
          
          <h2 className="font-elegant text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            What Our <span className="font-script text-ruby">Clients Say</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Don't just take our word for it. Here's what our valued clients have to say about 
            their unforgettable dining experiences with us.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div ref={testimonialsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className={getItemClassName(index)}
              style={getItemStyle(index)}
            >
              <NeumorphicCard 
                level={2} 
                interactive 
                className="h-full group hover:shadow-glow transition-all duration-500"
              >
                <CardContent className="p-8 h-full flex flex-col">
                  {/* Quote Icon */}
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Quote className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                      <Star 
                        key={starIndex} 
                        className="w-4 h-4 text-ruby fill-current" 
                      />
                    ))}
                  </div>
                  
                  {/* Quote Text */}
                  <blockquote className="text-foreground leading-relaxed mb-6 flex-grow">
                    <p className="font-script text-lg sm:text-xl italic">
                      "{testimonial.quote}"
                    </p>
                  </blockquote>
                  
                  {/* Author Info */}
                  <div className="mt-auto pt-6 border-t border-border">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                        {testimonial.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-elegant font-semibold text-foreground text-sm">
                          {testimonial.author}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {testimonial.event}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </NeumorphicCard>
            </div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="text-center mt-16">
          <NeumorphicCard level={3} className="inline-block">
            <div className="px-8 py-6 bg-gradient-primary rounded-lg">
              <p className="text-white font-elegant text-lg mb-4">
                Ready to create your own <span className="font-script">memorable experience?</span>
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <a 
                  href="/request-quote" 
                  className="inline-flex items-center px-6 py-3 bg-white text-ruby font-semibold rounded-lg hover:bg-white/90 transition-colors duration-300"
                >
                  Get Your Quote Today
                </a>
                <a 
                  href="/gallery" 
                  className="inline-flex items-center px-6 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors duration-300"
                >
                  View Our Gallery
                </a>
              </div>
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </section>
  );
};