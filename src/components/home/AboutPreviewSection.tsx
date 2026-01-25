import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { 
  ChefHat, 
  Award, 
  Heart, 
  Users,
  ArrowRight,
  Shield,
  Clock
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import homeStoryBg from "@/assets/home-story-bg.jpg";

export const AboutPreviewSection = () => {
  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0 
  });

  const animationClass = useAnimationClass('ios-spring', isVisible);

  const credentials = [
    {
      icon: <Shield className="h-4 w-4" />,
      text: "ServSafe Certified"
    },
    {
      icon: <Clock className="h-4 w-4" />,
      text: "20+ Years Experience"
    },
    {
      icon: <Users className="h-4 w-4" />,
      text: "Family-Owned Business"
    },
    {
      icon: <Award className="h-4 w-4" />,
      text: "Charleston's Trusted Caterer"
    }
  ];

  return (
    <section 
      ref={ref}
      className="py-12 sm:py-16 lg:py-20 relative overflow-hidden"
    >
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-contain lg:bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${homeStoryBg})` }}
        aria-hidden="true"
      />
      
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-background/85" />
      
      {/* Top gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-background to-transparent z-10" />
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-background to-transparent z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Section Header */}
        <div className={`text-center mb-6 lg:mb-10 space-y-3 ${animationClass}`}>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Heart className="h-5 w-5 text-ruby fill-ruby" />
            <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
              Our Story
            </Badge>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground">
            Meet the Soul Behind the Train
          </h2>
          <p className="text-xl sm:text-2xl font-script text-ruby font-medium">
            A Family Legacy of Flavor & Love
          </p>
        </div>

        {/* Main Content */}
        <div className={`grid lg:grid-cols-2 gap-6 lg:gap-10 items-center ${animationClass}`}>
          {/* Content */}
          <div className="space-y-5 order-2 lg:order-1">
            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-elegant font-bold text-foreground">
                Chef Train & Tanya Ward
              </h3>
              
              <p className="text-base text-muted-foreground leading-relaxed">
                For over two decades, Chef Train has been bringing the authentic flavors of the South 
                to Charleston's tables. Together with pastry chef Tanya Ward, they've built Soul Train's 
                Eatery on the foundation of family recipes, quality ingredients, and genuine hospitality.
              </p>

              <p className="text-base text-muted-foreground leading-relaxed">
                What started as a passion for cooking has grown into Charleston's trusted catering partner, 
                serving families, couples, and businesses across the Lowcountry with the same care and 
                attention we'd give our own family.
              </p>
            </div>

            {/* Credentials Grid */}
            <div className="grid grid-cols-2 gap-3">
              {credentials.map((credential, index) => (
                <Card key={index} className="p-3 bg-white/60 border-ruby/20">
                  <div className="flex items-center space-x-2">
                    <div className="text-ruby">
                      {credential.icon}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {credential.text}
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quote */}
            <div className="bg-gradient-ruby-subtle rounded-lg p-4 border-l-4 border-ruby">
              <blockquote className="text-base italic text-foreground">
                "Every dish we create carries a piece of our heart. We're not just feeding people; 
                we're creating memories that last a lifetime."
              </blockquote>
              <cite className="text-sm text-ruby font-medium mt-2 block">
                — Chef Train, Founder & Head Chef
              </cite>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row sm:space-y-0 sm:space-x-3 space-y-3">
              <Button 
                size="lg"
                className="w-full sm:w-auto sm:flex-1 bg-gradient-ruby-primary hover:bg-gradient-ruby-accent text-white font-semibold group min-h-[44px]"
                asChild
              >
                <a href="/about" className="flex items-center justify-center space-x-2">
                  <span>Our Full Story</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto sm:flex-1 border-ruby text-ruby hover:bg-ruby hover:text-white min-h-[44px]"
                asChild
              >
                <a href="/request-quote#page-header">Work With Us</a>
              </Button>
            </div>
          </div>

          {/* Images */}
          <div className="relative order-1 lg:order-2">
            <div className="grid grid-cols-1 gap-3">
              {/* Main Chef Image */}
              <Card className="overflow-hidden border-2 border-ruby/20">
                <OptimizedImage
                  src="/lovable-uploads/5f287525-fcce-46b6-9d7b-4d8ce488760f.png"
                  alt="Chef Train and Tanya Ward in Soul Train's Eatery aprons"
                  className="w-full aspect-[4/3] object-cover"
                  disableFilters={true}
                />
              </Card>
            </div>

            {/* Floating Badge */}
            <div className="absolute -top-3 -right-3 bg-white rounded-xl p-3 shadow-xl border border-ruby/20">
              <div className="flex items-center space-x-2">
                <ChefHat className="h-5 w-5 text-ruby" />
                <div className="text-center">
                  <div className="text-base font-bold text-ruby">20+</div>
                  <div className="text-sm text-muted-foreground">Years</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
