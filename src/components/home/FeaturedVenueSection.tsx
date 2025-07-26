import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { MapPin, Star, Users, Heart } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";

export const FeaturedVenueSection = () => {
  const isMobile = useIsMobile();
  
  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 0 
  });

  const animationClass = useAnimationClass('ios-spring', isVisible);

  return (
    <section 
      ref={ref}
      id="featured-venue" 
      className="py-12 sm:py-16 lg:py-20 bg-gradient-pattern-a"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-8 lg:mb-12 space-y-4 ${animationClass}`}>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="h-5 w-5 text-gold fill-gold" />
            <Badge variant="outline" className="border-ruby text-ruby font-script">
              Featured Partnership
            </Badge>
            <Star className="h-5 w-5 text-gold fill-gold" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-foreground">
            108 W Main Street
          </h2>
          <p className="text-lg sm:text-xl font-script text-ruby font-medium">
            Where Dreams Come to Life
          </p>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience the perfect blend of rustic charm and elegant sophistication at this stunning venue, 
            where Soul Train's Eatery brings culinary excellence to your most important celebrations.
          </p>
        </div>

        {/* Main Content */}
        <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${animationClass}`}>
          {/* Image */}
          <div className="relative group">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <OptimizedImage
                src="/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png"
                alt="108 W Main Street rustic wedding venue with elegant chandeliers and string lights"
                className="w-full h-64 sm:h-80 lg:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle Ruby Accent Overlay */}
              <div className="absolute inset-0 bg-gradient-ruby-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-xl border border-border/20">
              <div className="flex items-center space-x-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-ruby">150+</div>
                  <div className="text-xs text-muted-foreground">Events</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <div className="text-lg font-bold text-ruby">★ 5.0</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Charleston, SC Historic District</span>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-elegant font-bold text-foreground">
                A Perfect Setting for Your Perfect Day
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                This enchanting venue combines the warmth of rustic wood beams with the elegance of 
                crystal chandeliers and twinkling string lights. Our partnership with 108 W Main ensures 
                that every detail of your celebration is seamlessly coordinated, from the stunning ambiance 
                to our exceptional culinary offerings.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-white/60 border-ruby/20">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-ruby" />
                  <div>
                    <div className="font-semibold text-foreground text-sm">Capacity</div>
                    <div className="text-xs text-muted-foreground">Up to 200 guests</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-white/60 border-ruby/20">
                <div className="flex items-center space-x-3">
                  <Heart className="h-5 w-5 text-ruby fill-ruby" />
                  <div>
                    <div className="font-semibold text-foreground text-sm">Style</div>
                    <div className="text-xs text-muted-foreground">Rustic Elegance</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                className="bg-gradient-ruby-primary hover:bg-gradient-ruby-accent text-white font-semibold"
                asChild
              >
                <a href="/request-quote#page-header">Book This Venue</a>
              </Button>
              <Button 
                variant="outline" 
                className="border-ruby text-ruby hover:bg-ruby hover:text-white"
                asChild
              >
                <a href="/gallery?category=wedding">View Wedding Gallery</a>
              </Button>
            </div>

            {/* Partnership Note */}
            <div className="pt-4 border-t border-border/20">
              <p className="text-xs text-muted-foreground italic">
                * Soul Train's Eatery is the preferred catering partner for 108 W Main Street, 
                bringing 20+ years of culinary excellence to your special day.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};