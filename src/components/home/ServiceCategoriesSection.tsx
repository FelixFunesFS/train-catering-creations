import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { 
  Heart, 
  Building2, 
  Users, 
  GraduationCap,
  ArrowRight,
  Star,
  Clock,
  Award
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";

interface ServiceCategory {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: string[];
  href: string;
  isPopular?: boolean;
}

export const ServiceCategoriesSection = () => {
  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0 
  });

  const animationClass = useAnimationClass('ios-spring', isVisible);

  const staggered = useStaggeredAnimation({
    itemCount: 4,
    staggerDelay: 200,
    baseDelay: 400,
    variant: 'bounce-in'
  });

  const serviceCategories: ServiceCategory[] = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Wedding Catering",
      subtitle: "Your Dream Day",
      description: "From intimate ceremonies to grand receptions, we create unforgettable culinary experiences for your special day.",
      image: "/lovable-uploads/26d2d500-6017-41a2-99b2-b7050cefedba.png",
      features: ["Custom Menu Planning", "Professional Service", "Elegant Presentation"],
      href: "/wedding-menu",
      isPopular: true
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Corporate Events",
      subtitle: "Professional Excellence",
      description: "Impress clients and colleagues with sophisticated catering that reflects your company's commitment to quality.",
      image: "/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png",
      features: ["Flexible Scheduling", "Dietary Accommodations", "Professional Setup"],
      href: "/request-quote#page-header"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Family Gatherings",
      subtitle: "Comfort & Joy",
      description: "Bring families together with soul food that creates lasting memories and celebrates your heritage.",
      image: "/lovable-uploads/d6dabca7-8f7b-45c8-bb6c-ef86311e92bd.png",
      features: ["Family-Style Service", "Traditional Recipes", "Generous Portions"],
      href: "/menu"
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Special Occasions",
      subtitle: "Milestone Moments",
      description: "Celebrate life's important moments with catering that makes every occasion feel truly special.",
      image: "/lovable-uploads/1cd54e2e-3991-4795-ad2a-6e8c18fb530f.png",
      features: ["Custom Desserts", "Themed Presentations", "Memorable Service"],
      href: "/request-quote#page-header"
    }
  ];

  return (
    <section 
      ref={ref}
      className="py-12 sm:py-16 lg:py-20 bg-gradient-pattern-c"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-8 lg:mb-12 space-y-4 ${animationClass}`}>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Award className="h-5 w-5 text-ruby" />
            <Badge variant="outline" className="border-ruby text-ruby font-script">
              Our Services
            </Badge>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-foreground">
            Catering Excellence for Every Occasion
          </h2>
          <p className="text-lg sm:text-xl font-script text-ruby font-medium">
            20+ Years of Culinary Mastery
          </p>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From intimate family dinners to grand celebrations, Soul Train's Eatery brings the same 
            level of passion, quality, and southern hospitality to every event we cater.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div 
          ref={staggered.ref}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8"
        >
          {serviceCategories.map((service, index) => (
            <Card
              key={index}
              className={`group relative overflow-hidden border-2 border-transparent hover:border-ruby/30 transition-all duration-500 cursor-pointer ${staggered.getItemClassName(index)}`}
              style={staggered.getItemStyle(index)}
            >
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <OptimizedImage
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Ruby Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-ruby-subtle opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Popular Badge */}
                {service.isPopular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-ruby-primary text-white border-0">
                      <Star className="h-3 w-3 mr-1 fill-white" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Icon */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white">
                    {service.icon}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-elegant font-bold text-foreground group-hover:text-ruby transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm font-script text-ruby font-medium">
                    {service.subtitle}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-ruby" />
                      <span className="text-xs text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  variant="outline" 
                  className="w-full border-ruby text-ruby hover:bg-ruby hover:text-white group"
                  asChild
                >
                  <a href={service.href} className="flex items-center justify-center space-x-2">
                    <span>Learn More</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center space-y-4 ${animationClass}`}>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-ruby/20">
            <h3 className="text-lg font-elegant font-bold text-foreground mb-2">
              Need Something Custom?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Every event is unique. Let us create a customized catering solution that perfectly 
              matches your vision, dietary needs, and budget.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-ruby-primary hover:bg-gradient-ruby-accent text-white font-semibold"
              asChild
            >
              <a href="/request-quote#page-header">Request Custom Quote</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};