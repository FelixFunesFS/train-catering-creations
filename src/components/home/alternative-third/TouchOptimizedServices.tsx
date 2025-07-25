import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Utensils, 
  Calendar, 
  Users, 
  Award, 
  Heart, 
  TrendingUp,
  Star,
  CheckCircle
} from "lucide-react";

const services = [
  {
    icon: Heart,
    title: "Wedding Celebrations",
    description: "Elegant dining experiences for your special day with personalized menu design",
    features: ["Custom menu planning", "Elegant presentation", "Professional service staff"],
    accent: "ruby"
  },
  {
    icon: Users,
    title: "Corporate Events",
    description: "Professional catering solutions that impress clients and motivate teams",
    features: ["Executive lunch meetings", "Conference catering", "Team building events"],
    accent: "ruby"
  },
  {
    icon: Calendar,
    title: "Private Parties",
    description: "Intimate gatherings with restaurant-quality cuisine in your preferred setting",
    features: ["Birthday celebrations", "Anniversary dinners", "Holiday gatherings"],
    accent: "ruby"
  },
  {
    icon: Award,
    title: "Signature Dishes",
    description: "Award-winning recipes crafted with premium ingredients and artistic presentation",
    features: ["Farm-to-table ingredients", "Artistic plating", "Dietary accommodations"],
    accent: "ruby"
  }
];

const stats = [
  { icon: CheckCircle, value: "500+", label: "Events Catered" },
  { icon: Star, value: "5.0", label: "Average Rating" },
  { icon: TrendingUp, value: "98%", label: "Client Satisfaction" },
  { icon: Users, value: "50K+", label: "Guests Served" }
];

export const TouchOptimizedServices = () => {
  const isMobile = useIsMobile();
  
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({
    variant: 'fade-up',
    delay: 0
  });

  const {
    ref: servicesRef,
    visibleItems: servicesVisible,
    getItemClassName: getServiceClassName,
    getItemStyle: getServiceStyle
  } = useStaggeredAnimation({
    itemCount: services.length,
    staggerDelay: isMobile ? 150 : 100,
    variant: 'slide-up'
  });

  const {
    ref: statsRef,
    visibleItems: statsVisible,
    getItemClassName: getStatClassName,
    getItemStyle: getStatStyle
  } = useStaggeredAnimation({
    itemCount: stats.length,
    staggerDelay: isMobile ? 200 : 150,
    baseDelay: 300,
    variant: 'scale-fade'
  });

  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background Ruby Accents */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-ruby-light/5 to-transparent" />
      <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-ruby-light/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile-First Header */}
        <div ref={headerRef} className={`text-center mb-12 sm:mb-16 md:mb-20 ${headerAnimationClass}`}>
          <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 mb-4 sm:mb-6 bg-ruby-light/10 rounded-full border border-ruby-light/20">
            <Utensils className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-ruby-dark" />
            <span className="text-ruby-dark text-xs sm:text-sm font-medium">Our Services</span>
          </div>
          
          <h2 className="font-elegant text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight px-2">
            Culinary Excellence
            <span className="block font-script text-ruby-primary text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mt-1 sm:mt-2">
              Tailored for You
            </span>
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            From intimate gatherings to grand celebrations, we bring restaurant-quality cuisine 
            and elegant service directly to your event.
          </p>
        </div>

        {/* Touch-Optimized Services Grid */}
        <div ref={servicesRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 md:mb-20">
          {services.map((service, index) => (
            <NeumorphicCard
              key={service.title}
              level={2}
              interactive
              className={`group cursor-pointer hover:scale-[1.02] transition-all duration-300 border-l-4 border-ruby-primary/30 hover:border-ruby-primary min-h-[280px] sm:min-h-[320px] flex flex-col ${getServiceClassName(index)}`}
              style={getServiceStyle(index)}
            >
              <div className="flex items-start space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-ruby-light/10 rounded-lg group-hover:bg-ruby-light/20 transition-colors duration-300 touch-manipulation">
                  <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-ruby-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-elegant text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 leading-tight">
                    {service.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed flex-1">
                {service.description}
              </p>
              
              <div className="space-y-2 sm:space-y-3">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-ruby-primary rounded-full flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </NeumorphicCard>
          ))}
        </div>

        {/* Mobile-Optimized Stats Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-ruby-light/5 via-ruby-primary/10 to-ruby-light/5 rounded-2xl sm:rounded-3xl backdrop-blur-sm" />
          
          <NeumorphicCard level={3} className="relative p-6 sm:p-8 lg:p-12">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="font-elegant text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">
                Proven Excellence
                <span className="block font-script text-ruby-primary text-lg sm:text-xl md:text-2xl lg:text-3xl mt-1 sm:mt-2">
                  in Every Event
                </span>
              </h3>
            </div>
            
            <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`text-center group ${getStatClassName(index)}`}
                  style={getStatStyle(index)}
                >
                  <div className="flex justify-center mb-2 sm:mb-3">
                    <div className="p-2 sm:p-3 bg-ruby-light/10 rounded-lg group-hover:bg-ruby-light/20 transition-colors duration-300">
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-ruby-primary" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </section>
  );
};