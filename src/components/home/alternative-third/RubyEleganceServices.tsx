import { Card, CardContent } from "@/components/ui/card";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { 
  Utensils, 
  Heart, 
  Users, 
  Award, 
  Sparkles, 
  Clock,
  MapPin,
  Star
} from "lucide-react";

const services = [
  {
    icon: Heart,
    title: "Wedding Catering",
    description: "Elegant dining experiences for your special day",
    features: ["Custom menus", "Professional service", "Stunning presentation"],
    accent: "ruby-light"
  },
  {
    icon: Users,
    title: "Corporate Events",
    description: "Professional catering for business occasions",
    features: ["Executive menus", "Timely service", "Dietary accommodations"],
    accent: "ruby"
  },
  {
    icon: Sparkles,
    title: "Private Parties",
    description: "Intimate gatherings with personalized touch",
    features: ["Custom themes", "Interactive stations", "Premium ingredients"],
    accent: "ruby-dark"
  },
  {
    icon: Award,
    title: "Signature Dishes",
    description: "Award-winning culinary creations",
    features: ["Chef specialties", "Seasonal ingredients", "Artistic plating"],
    accent: "ruby-light"
  }
];

const stats = [
  { icon: Clock, value: "15+", label: "Years Experience" },
  { icon: Users, value: "500+", label: "Events Catered" },
  { icon: Star, value: "5.0", label: "Average Rating" },
  { icon: MapPin, value: "50+", label: "Venues Served" }
];

export const RubyEleganceServices = () => {
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0 
  });
  
  const { 
    ref: servicesRef, 
    getItemClassName, 
    getItemStyle 
  } = useStaggeredAnimation({ 
    itemCount: services.length, 
    staggerDelay: 150, 
    baseDelay: 200,
    variant: 'scale-fade'
  });
  
  const { 
    ref: statsRef, 
    getItemClassName: getStatsClassName, 
    getItemStyle: getStatsStyle 
  } = useStaggeredAnimation({ 
    itemCount: stats.length, 
    staggerDelay: 100, 
    baseDelay: 600,
    variant: 'bounce-in'
  });

  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);

  return (
    <section className="py-16 lg:py-24 bg-background relative overflow-hidden">
      {/* Ruby Accent Background */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-ruby/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headerRef} className={`text-center mb-16 ${headerAnimationClass}`}>
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-ruby/10 rounded-full">
            <Utensils className="w-4 h-4 mr-2 text-ruby" />
            <span className="text-ruby text-sm font-medium">Our Services</span>
          </div>
          
          <h2 className="font-elegant text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Culinary <span className="font-script text-ruby">Excellence</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From intimate gatherings to grand celebrations, we craft exceptional dining experiences 
            that leave lasting impressions on you and your guests.
          </p>
        </div>

        {/* Services Grid */}
        <div ref={servicesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={index}
                className={getItemClassName(index)}
                style={getItemStyle(index)}
              >
                <NeumorphicCard 
                  level={2} 
                  interactive 
                  className="h-full group hover:shadow-glow transition-all duration-300"
                >
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <h3 className="font-elegant text-xl font-bold text-foreground mb-2 group-hover:text-ruby transition-colors duration-300">
                        {service.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {service.description}
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-ruby mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </NeumorphicCard>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-primary rounded-2xl opacity-5" />
          <NeumorphicCard level={3} className="relative bg-background/50 backdrop-blur-sm border border-ruby/10">
            <div className="p-8 lg:p-12">
              <div className="text-center mb-8">
                <h3 className="font-elegant text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Trusted by <span className="font-script text-ruby">Hundreds</span>
                </h3>
                <p className="text-muted-foreground">
                  Our commitment to excellence speaks for itself
                </p>
              </div>
              
              <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div 
                      key={index}
                      className={`text-center ${getStatsClassName(index)}`}
                      style={getStatsStyle(index)}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="font-elegant text-2xl sm:text-3xl font-bold text-foreground mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </section>
  );
};