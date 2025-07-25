import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { SectionContentCard } from "@/components/ui/section-content-card";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Calendar, Users, ChefHat, Heart, ArrowRight, Star, Clock, MapPin } from "lucide-react";

export const CulinaryJourneyBooking = () => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    variant: "fade-up"
  });

  const journeySteps = [
    {
      icon: Heart,
      title: "Share Your Vision",
      description: "Tell us about your event dreams and preferences",
      features: ["Event consultation", "Menu preferences", "Special requirements"]
    },
    {
      icon: ChefHat,
      title: "Custom Menu Creation",
      description: "Our chefs craft a personalized culinary experience",
      features: ["Signature dishes", "Dietary accommodations", "Tasting sessions"]
    },
    {
      icon: Star,
      title: "Perfect Execution",
      description: "Relax while we create your perfect culinary journey",
      features: ["Professional service", "Elegant presentation", "Seamless experience"]
    }
  ];

  const bookingOptions = [
    {
      icon: Calendar,
      title: "Corporate Events",
      subtitle: "Professional Excellence",
      description: "Impress clients and colleagues with sophisticated catering",
      price: "Starting at $25/person",
      features: ["Breakfast meetings", "Lunch conferences", "Evening receptions"]
    },
    {
      icon: Heart,
      title: "Wedding Celebrations", 
      subtitle: "Your Perfect Day",
      description: "Create unforgettable memories with elegant wedding catering",
      price: "Custom packages available",
      features: ["Bridal tastings", "Reception dinners", "Cocktail hours"]
    },
    {
      icon: Users,
      title: "Special Occasions",
      subtitle: "Life's Moments",
      description: "Celebrate milestones with exceptional culinary experiences",
      price: "Starting at $18/person", 
      features: ["Birthday parties", "Anniversaries", "Holiday gatherings"]
    }
  ];

  const quickBookingFeatures = [
    { icon: Clock, text: "24-hour response time" },
    { icon: MapPin, text: "Charleston & Lowcountry areas" },
    { icon: Star, text: "Satisfaction guaranteed" },
    { icon: Users, text: "Events for 10-500 guests" }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-ruby-50/10">
      <ResponsiveWrapper>
        <div ref={ref} className="space-y-20">
          {/* Header */}
          <div className={`text-center max-w-4xl mx-auto ${isVisible ? 'fade-up-visible' : 'fade-up-hidden'}`}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-elegant font-bold mb-6">
              <span className="bg-gradient-ruby-primary bg-clip-text text-transparent">
                Start Your Culinary Journey
              </span>
              <br />
              <span className="font-script text-ruby-600 text-2xl md:text-3xl">
                Today
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              From intimate gatherings to grand celebrations, let us create an unforgettable culinary experience 
              that reflects your unique vision and brings people together.
            </p>
          </div>

          {/* Journey Steps */}
          <div className={`${isVisible ? 'fade-up-visible' : 'fade-up-hidden'}`} style={{ animationDelay: '200ms' }}>
            <h3 className="text-2xl md:text-3xl font-elegant font-bold text-center mb-12">
              Your Journey in <span className="font-script text-ruby-600">Three Steps</span>
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              {journeySteps.map((step, index) => (
                <SectionContentCard key={index} level={2} className="text-center h-full">
                  <div className="space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-ruby-subtle flex items-center justify-center">
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-elegant font-semibold mb-3">
                        {step.title}
                      </h4>
                      <p className="text-muted-foreground mb-4">
                        {step.description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center justify-center gap-2">
                          <ArrowRight className="w-4 h-4 text-ruby-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </SectionContentCard>
              ))}
            </div>
          </div>

          {/* Booking Options */}
          <div className={`${isVisible ? 'fade-up-visible' : 'fade-up-hidden'}`} style={{ animationDelay: '400ms' }}>
            <h3 className="text-2xl md:text-3xl font-elegant font-bold text-center mb-12">
              Choose Your <span className="font-script text-ruby-600">Culinary Adventure</span>
            </h3>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {bookingOptions.map((option, index) => (
                <SectionContentCard 
                  key={index} 
                  level={1} 
                  interactive
                  className="h-full cursor-pointer hover:scale-105 transition-all duration-300"
                >
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-ruby-subtle flex items-center justify-center flex-shrink-0">
                        <option.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-elegant font-semibold mb-1">
                          {option.title}
                        </h4>
                        <p className="font-script text-ruby-600">
                          {option.subtitle}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground">
                      {option.description}
                    </p>
                    
                    <div className="bg-ruby-50/50 rounded-lg p-4">
                      <div className="text-lg font-elegant font-semibold text-ruby-700 mb-2">
                        {option.price}
                      </div>
                      <div className="space-y-1">
                        {option.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2">
                            <ArrowRight className="w-3 h-3 text-ruby-500" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <NeumorphicButton 
                      className="w-full min-h-[44px]"
                      aria-label={`Get started with ${option.title} catering services`}
                    >
                      Get Started
                    </NeumorphicButton>
                  </div>
                </SectionContentCard>
              ))}
            </div>
          </div>

          {/* Quick Booking Features */}
          <div className={`${isVisible ? 'fade-up-visible' : 'fade-up-hidden'}`} style={{ animationDelay: '600ms' }}>
            <SectionContentCard level={3} className="max-w-4xl mx-auto">
              <div className="text-center space-y-8">
                <h3 className="text-2xl font-elegant font-bold">
                  Why Choose <span className="font-script text-ruby-600">Soul Train's Eatery</span>
                </h3>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {quickBookingFeatures.map((feature, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-ruby-subtle flex items-center justify-center mb-3">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-6">
                  <NeumorphicButton 
                    size="lg" 
                    className="px-12 py-4 text-lg min-h-[44px]"
                    aria-label="Contact Soul Train's Eatery for a free consultation"
                  >
                    Start Your Culinary Journey Now
                  </NeumorphicButton>
                  <p className="text-sm text-muted-foreground mt-4">
                    Free consultation • No obligation • Quick response
                  </p>
                </div>
              </div>
            </SectionContentCard>
          </div>
        </div>
      </ResponsiveWrapper>
    </section>
  );
};