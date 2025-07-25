import { useState } from "react";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { SectionContentCard } from "@/components/ui/section-content-card";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { ChefHat, Users, Calendar, Star, ArrowRight, Heart } from "lucide-react";

export const InteractiveJourneyServices = () => {
  const [activeService, setActiveService] = useState(0);
  
  const { ref, getItemClassName } = useStaggeredAnimation({
    itemCount: 4,
    staggerDelay: 150,
    variant: "scale-fade"
  });

  const services = [
    {
      icon: ChefHat,
      title: "Corporate Catering",
      subtitle: "Professional Excellence",
      description: "Elevate your business events with our sophisticated catering services, designed to impress clients and colleagues alike.",
      features: ["Custom menus", "Professional service", "Flexible scheduling"],
      color: "ruby"
    },
    {
      icon: Heart,
      title: "Wedding Celebrations",
      subtitle: "Your Perfect Day",
      description: "Create unforgettable wedding memories with our elegant catering that reflects your unique love story.",
      features: ["Personalized menus", "Full-service planning", "Elegant presentation"],
      color: "gold"
    },
    {
      icon: Users,
      title: "Private Events", 
      subtitle: "Intimate Gatherings",
      description: "Transform your private celebrations into extraordinary experiences with our personalized culinary approach.",
      features: ["Customized service", "Intimate settings", "Personal touch"],
      color: "navy"
    },
    {
      icon: Star,
      title: "Special Occasions",
      subtitle: "Memorable Moments",
      description: "Mark life's special moments with exceptional cuisine that brings people together in celebration.",
      features: ["Holiday catering", "Anniversary celebrations", "Milestone events"],
      color: "ruby"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-ruby-50/10">
      <ResponsiveWrapper>
        <div ref={ref} className="space-y-16">
          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-elegant font-bold mb-6">
              <span className="bg-gradient-ruby-primary bg-clip-text text-transparent">
                Start Your Culinary Journey
              </span>
              <br />
              <span className="text-2xl md:text-3xl font-script text-ruby-600">
                Today
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Discover how we can make your next event extraordinary with our signature Charleston-inspired cuisine and heartfelt service.
            </p>
          </div>

          {/* Interactive Services Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <SectionContentCard
                key={index}
                level={2}
                interactive
                className={`${getItemClassName(index)} cursor-pointer transition-all duration-500 hover:scale-105 ${
                  activeService === index ? 'ring-2 ring-ruby-300 shadow-lg' : ''
                }`}
                onClick={() => setActiveService(index)}
              >
                <div className="space-y-6">
                  {/* Service Icon & Title */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-ruby-subtle flex items-center justify-center">
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-elegant font-bold mb-2">
                        {service.title}
                      </h3>
                      <p className="font-script text-ruby-600 text-lg">
                        {service.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Service Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>

                  {/* Service Features */}
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-ruby-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Service CTA */}
                  <div className="pt-4">
                    <NeumorphicButton 
                      variant="outline" 
                      className="w-full"
                    >
                      Explore {service.title}
                    </NeumorphicButton>
                  </div>
                </div>
              </SectionContentCard>
            ))}
          </div>

          {/* Journey Steps */}
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-elegant font-bold text-center mb-12">
              Your Culinary Journey in <span className="font-script text-ruby-600">3 Simple Steps</span>
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Share Your Vision",
                  description: "Tell us about your event, preferences, and dreams. We listen to every detail."
                },
                {
                  step: "02", 
                  title: "Craft Your Menu",
                  description: "Our chefs create a personalized menu that reflects your taste and occasion."
                },
                {
                  step: "03",
                  title: "Enjoy the Experience", 
                  description: "Relax and savor every moment while we handle the culinary magic."
                }
              ].map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-ruby-subtle flex items-center justify-center text-2xl font-elegant font-bold text-white group-hover:scale-110 transition-transform duration-300">
                    {step.step}
                  </div>
                  <h4 className="text-lg font-elegant font-semibold mb-3">
                    {step.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Main CTA */}
          <div className="text-center">
            <NeumorphicButton size="lg" className="px-12 py-4 text-lg">
              Start Your Culinary Journey Today
            </NeumorphicButton>
          </div>
        </div>
      </ResponsiveWrapper>
    </section>
  );
};