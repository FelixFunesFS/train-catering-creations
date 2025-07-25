import { useState } from "react";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Star,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Heart,
  Award,
  Users
} from "lucide-react";

const bookingSteps = [
  {
    icon: Calendar,
    title: "Consultation",
    description: "Free personalized consultation to understand your vision and requirements"
  },
  {
    icon: Heart,
    title: "Menu Design",
    description: "Custom menu creation tailored to your preferences and dietary needs"
  },
  {
    icon: CheckCircle,
    title: "Confirmation",
    description: "Finalize details, timeline, and secure your date with our team"
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Flawless execution and memorable dining experience on your special day"
  }
];

const urgencyIndicators = [
  "📅 Limited availability for 2024",
  "⭐ 5-star rated catering service",
  "🎯 100% satisfaction guarantee",
  "👨‍🍳 Award-winning culinary team"
];

export const MobileLuxuryBooking = () => {
  const isMobile = useIsMobile();
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({
    variant: 'fade-up',
    delay: 0
  });

  const { ref: contentRef, isVisible: contentVisible, variant: contentVariant } = useScrollAnimation({
    variant: 'slide-up',
    delay: 200
  });

  const {
    ref: stepsRef,
    visibleItems: stepsVisible,
    getItemClassName: getStepClassName,
    getItemStyle: getStepStyle
  } = useStaggeredAnimation({
    itemCount: bookingSteps.length,
    staggerDelay: isMobile ? 150 : 100,
    baseDelay: 300,
    variant: 'scale-fade'
  });

  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);
  const contentAnimationClass = useAnimationClass(contentVariant, contentVisible);

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-ruby-light/5 via-background to-ruby-primary/5 relative overflow-hidden">
      {/* Ruby Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-ruby-primary/10 via-transparent to-ruby-light/10" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/3 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-ruby-light/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-0 w-24 h-24 sm:w-36 sm:h-36 bg-ruby-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile-First Header */}
        <div ref={headerRef} className={`text-center mb-12 sm:mb-16 md:mb-20 ${headerAnimationClass}`}>
          <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 mb-4 sm:mb-6 bg-ruby-primary/10 rounded-full border border-ruby-primary/20">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-ruby-primary" />
            <span className="text-ruby-primary text-xs sm:text-sm font-medium">Premium Booking</span>
          </div>
          
          <h2 className="font-elegant text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight px-2">
            Start Your Culinary
            <span className="block font-script text-ruby-primary text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mt-1 sm:mt-2">
              Journey Today
            </span>
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            From concept to celebration, we handle every detail to create an extraordinary 
            dining experience that exceeds your expectations.
          </p>
        </div>

        {/* Mobile-Optimized Content Grid */}
        <div ref={contentRef} className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 ${contentAnimationClass}`}>
          
          {/* Left Column - Booking Process & Urgency */}
          <div className="space-y-6 sm:space-y-8">
            <NeumorphicCard level={2} className="p-6 sm:p-8">
              <h3 className="font-elegant text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-4 sm:mb-6">
                How It Works
                <span className="block font-script text-ruby-primary text-base sm:text-lg md:text-xl mt-1">
                  Simple & Seamless
                </span>
              </h3>
              
              {/* Touch-Optimized Steps */}
              <div ref={stepsRef} className="space-y-4 sm:space-y-6">
                {bookingSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className={`group cursor-pointer ${getStepClassName(index)}`}
                    style={getStepStyle(index)}
                    onClick={() => setActiveStep(activeStep === index ? null : index)}
                  >
                    <div className={`flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg transition-all duration-300 ${
                      activeStep === index ? 'bg-ruby-light/10 border-l-4 border-ruby-primary' : 'hover:bg-muted/50'
                    }`}>
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          activeStep === index ? 'bg-ruby-primary text-white' : 'bg-ruby-light/20 text-ruby-primary'
                        }`}>
                          <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                          <span className="text-xs sm:text-sm font-medium text-ruby-primary">
                            Step {index + 1}
                          </span>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                        <h4 className="font-semibold text-sm sm:text-base text-foreground mb-1 sm:mb-2">
                          {step.title}
                        </h4>
                        <p className={`text-xs sm:text-sm text-muted-foreground leading-relaxed transition-all duration-300 ${
                          activeStep === index ? 'opacity-100 max-h-20' : 'opacity-70 max-h-12 overflow-hidden'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </NeumorphicCard>
            
            {/* Urgency Indicators */}
            <NeumorphicCard level={2} className="p-4 sm:p-6 bg-gradient-to-r from-ruby-light/5 to-ruby-primary/5">
              <div className="space-y-2 sm:space-y-3">
                {urgencyIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
                    <div className="w-1.5 h-1.5 bg-ruby-primary rounded-full animate-pulse" />
                    <span className="text-foreground font-medium">{indicator}</span>
                  </div>
                ))}
              </div>
            </NeumorphicCard>
          </div>

          {/* Right Column - CTA & Contact */}
          <div className="space-y-6 sm:space-y-8">
            <NeumorphicCard level={3} className="p-6 sm:p-8 lg:p-10 text-center">
              <div className="mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-ruby-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-ruby-primary" />
                </div>
                
                <h3 className="font-elegant text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 sm:mb-4">
                  Ready to Begin?
                  <span className="block font-script text-ruby-primary text-lg sm:text-xl md:text-2xl mt-1 sm:mt-2">
                    Let's Create Magic
                  </span>
                </h3>
                
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Book your complimentary consultation and start planning your perfect event today.
                </p>
              </div>
              
              {/* Primary CTAs */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <Button
                  variant="cta"
                  size="responsive-lg"
                  className="w-full min-h-[48px] sm:min-h-[52px] shadow-elevated hover:shadow-glow-strong transition-all duration-300"
                  asChild
                >
                  <a href="/request-quote" className="flex items-center justify-center space-x-2 sm:space-x-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold text-sm sm:text-base">Book Free Consultation</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                </Button>
                
                <Button
                  variant="outline"
                  size="responsive-lg"
                  className="w-full min-h-[48px] sm:min-h-[52px] border-ruby-primary/30 text-ruby-primary hover:border-ruby-primary hover:bg-ruby-light/10 transition-all duration-300"
                  asChild
                >
                  <a href="tel:+1234567890" className="flex items-center justify-center space-x-2 sm:space-x-3">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold text-sm sm:text-base">Call Now: (123) 456-7890</span>
                  </a>
                </Button>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-3 sm:space-y-4 border-t border-border/50 pt-6 sm:pt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-ruby-primary" />
                    <span className="text-muted-foreground">Available 7 days/week</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-ruby-primary" />
                    <span className="text-muted-foreground">hello@soultrainseatery.com</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 sm:col-span-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-ruby-primary" />
                    <span className="text-muted-foreground">Serving Los Angeles & Surrounding Areas</span>
                  </div>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex items-center justify-center space-x-4 sm:space-x-6 pt-3 sm:pt-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                    <span className="text-xs sm:text-sm font-medium text-foreground">5.0</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-ruby-primary" />
                    <span className="text-xs sm:text-sm font-medium text-foreground">500+ Events</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span className="text-xs sm:text-sm font-medium text-foreground">Insured</span>
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