import { Button } from "@/components/ui/button";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { 
  Calendar, 
  Phone, 
  Mail, 
  Clock, 
  Users, 
  MapPin,
  CheckCircle,
  Star
} from "lucide-react";

const bookingSteps = [
  {
    icon: Calendar,
    title: "Schedule Consultation",
    description: "Book a complimentary consultation to discuss your vision and requirements"
  },
  {
    icon: Users,
    title: "Custom Menu Planning",
    description: "Work with our chefs to create a personalized menu for your event"
  },
  {
    icon: CheckCircle,
    title: "Seamless Execution",
    description: "Relax while we handle every detail of your culinary experience"
  }
];

const urgencyIndicators = [
  "📅 Limited dates available for peak season",
  "⭐ Award-winning chef team",
  "🏆 5-star rated service guarantee",
  "📞 Same-day consultation available"
];

export const LuxuryBookingSection = () => {
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0 
  });
  
  const { ref: contentRef, isVisible: contentVisible, variant: contentVariant } = useScrollAnimation({ 
    variant: 'scale-fade', 
    delay: 300 
  });
  
  const { ref: ctaRef, isVisible: ctaVisible, variant: ctaVariant } = useScrollAnimation({ 
    variant: 'bounce-in', 
    delay: 600 
  });

  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);
  const contentAnimationClass = useAnimationClass(contentVariant, contentVisible);
  const ctaAnimationClass = useAnimationClass(ctaVariant, ctaVisible);

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Ruby Gradient Background */}
      <div className="absolute inset-0 bg-gradient-primary" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-1000" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div ref={headerRef} className={`text-center mb-12 ${headerAnimationClass}`}>
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <Star className="w-4 h-4 mr-2 text-white" />
            <span className="text-white text-sm font-medium">Premium Booking</span>
          </div>
          
          <h2 className="font-elegant text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Reserve Your <span className="font-script text-accent-light">Culinary Experience</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Don't let your special occasion pass without the perfect culinary companion. 
            Book your consultation today and let us create an unforgettable experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Booking Process */}
          <div ref={contentRef} className={contentAnimationClass}>
            <NeumorphicCard level={2} className="bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="p-8">
                <h3 className="font-elegant text-2xl font-bold text-white mb-6">
                  Simple <span className="font-script text-accent-light">Booking Process</span>
                </h3>
                
                <div className="space-y-6">
                  {bookingSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-1">
                            {step.title}
                          </h4>
                          <p className="text-white/80 text-sm leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Urgency Indicators */}
                <div className="mt-8 pt-6 border-t border-white/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {urgencyIndicators.map((indicator, index) => (
                      <div key={index} className="text-white/90 text-xs flex items-center">
                        <span>{indicator}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </NeumorphicCard>
          </div>

          {/* CTA Section */}
          <div ref={ctaRef} className={ctaAnimationClass}>
            <NeumorphicCard level={3} className="bg-white">
              <div className="p-8 lg:p-10">
                <div className="text-center mb-8">
                  <h3 className="font-elegant text-2xl font-bold text-foreground mb-2">
                    Ready to Get Started?
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Choose your preferred way to connect with us
                  </p>
                </div>
                
                {/* Primary CTA Buttons */}
                <div className="space-y-4 mb-8">
                  <Button 
                    asChild 
                    variant="cta" 
                    size="responsive-lg"
                    className="w-full shadow-elevated hover:shadow-glow-strong"
                  >
                    <a href="/request-quote" className="flex items-center justify-center space-x-3">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold">Book Free Consultation</span>
                    </a>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    size="responsive-lg"
                    className="w-full border-ruby text-ruby hover:bg-ruby/5"
                  >
                    <a href="tel:+1234567890" className="flex items-center justify-center space-x-3">
                      <Phone className="w-5 h-5" />
                      <span className="font-semibold">Call (123) 456-7890</span>
                    </a>
                  </Button>
                </div>
                
                {/* Contact Information */}
                <div className="space-y-3 text-center">
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Available Mon-Fri 9AM-6PM</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground text-sm">
                    <Mail className="w-4 h-4" />
                    <span>events@rubyelegance.com</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>Serving Greater Metropolitan Area</span>
                  </div>
                </div>
                
                {/* Trust Indicators */}
                <div className="mt-6 pt-6 border-t border-border text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    Trusted by 500+ satisfied clients
                  </p>
                  <div className="flex justify-center space-x-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="w-4 h-4 text-ruby fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </NeumorphicCard>
          </div>
        </div>
      </div>
    </section>
  );
};