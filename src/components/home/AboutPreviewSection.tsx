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
      className="py-12 sm:py-16 lg:py-20 bg-gradient-pattern-d"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-8 lg:mb-12 space-y-4 ${animationClass}`}>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-5 w-5 text-ruby fill-ruby" />
            <Badge variant="outline" className="border-ruby text-ruby font-script">
              Our Story
            </Badge>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-foreground">
            Meet the Soul Behind the Train
          </h2>
          <p className="text-lg sm:text-xl font-script text-ruby font-medium">
            A Family Legacy of Flavor & Love
          </p>
        </div>

        {/* Main Content */}
        <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${animationClass}`}>
          {/* Content */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-elegant font-bold text-foreground">
                Chef Train & Tanya Ward
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                For over two decades, Chef Train has been bringing the authentic flavors of the South 
                to Charleston's tables. Together with pastry chef Tanya Ward, they've built Soul Train's 
                Eatery on the foundation of family recipes, quality ingredients, and genuine hospitality.
              </p>

              <p className="text-muted-foreground leading-relaxed">
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
                    <span className="text-xs font-medium text-foreground">
                      {credential.text}
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quote */}
            <div className="bg-gradient-ruby-subtle rounded-lg p-4 border-l-4 border-ruby">
              <blockquote className="text-sm italic text-foreground">
                "Every dish we create carries a piece of our heart. We're not just feeding people; 
                we're creating memories that last a lifetime."
              </blockquote>
              <cite className="text-xs text-ruby font-medium mt-2 block">
                — Chef Train, Founder & Head Chef
              </cite>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                className="bg-gradient-ruby-primary hover:bg-gradient-ruby-accent text-white font-semibold group"
                asChild
              >
                <a href="/about" className="flex items-center space-x-2">
                  <span>Our Full Story</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button 
                variant="outline" 
                className="border-ruby text-ruby hover:bg-ruby hover:text-white"
                asChild
              >
                <a href="/request-quote#page-header">Work With Us</a>
              </Button>
            </div>
          </div>

          {/* Images */}
          <div className="relative order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-4">
              {/* Main Chef Image */}
              <div className="col-span-2">
                <Card className="overflow-hidden border-2 border-ruby/20">
                  <OptimizedImage
                    src="/lovable-uploads/31195e1f-92d1-4d88-9466-00bb2d439661.png"
                    alt="Chef Train and team in professional kitchen"
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                </Card>
              </div>
              
              {/* Kitchen Scene */}
              <Card className="overflow-hidden border border-border/20">
                <OptimizedImage
                  src="/lovable-uploads/36237032-ff09-485e-9a44-179ac279864f.png"
                  alt="Professional kitchen in action"
                  className="w-full h-32 sm:h-36 object-cover"
                />
              </Card>
              
              {/* Pastry Creation */}
              <Card className="overflow-hidden border border-border/20">
                <OptimizedImage
                  src="/lovable-uploads/1cd54e2e-3991-4795-ad2a-6e8c18fb530f.png"
                  alt="Tanya's custom dessert creation"
                  className="w-full h-32 sm:h-36 object-cover"
                />
              </Card>
            </div>

            {/* Floating Badge */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl p-3 shadow-xl border border-ruby/20">
              <div className="flex items-center space-x-2">
                <ChefHat className="h-5 w-5 text-ruby" />
                <div className="text-center">
                  <div className="text-sm font-bold text-ruby">20+</div>
                  <div className="text-xs text-muted-foreground">Years</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};