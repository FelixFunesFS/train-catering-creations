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
      className="py-8 sm:py-12 lg:py-16 bg-gradient-pattern-a"
    >
      <div className="container mx-auto px-3 sm:px-4">
        {/* Section Header */}
        <div className={`text-center mb-6 lg:mb-10 space-y-3 ${animationClass}`}>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Star className="h-5 w-5 text-gold fill-gold" />
            <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
              Featured Partnership
            </Badge>
            <Star className="h-5 w-5 text-gold fill-gold" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground">
            108 W Main Street
          </h2>
          <p className="text-xl sm:text-2xl font-script text-ruby font-medium">
            Where Dreams Come to Life
          </p>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience the perfect blend of rustic charm and elegant sophistication at this stunning venue, 
            where Soul Train's Eatery brings culinary excellence to your most important celebrations.
          </p>
        </div>

        {/* Main Content */}
        <div className={`grid lg:grid-cols-2 gap-6 lg:gap-10 items-center ${animationClass}`}>
          {/* Image */}
          <div className="relative group">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <OptimizedImage
                src="/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png"
                alt="108 W Main Street rustic wedding venue with elegant chandeliers and string lights"
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle Ruby Accent Overlay */}
              <div className="absolute inset-0 bg-gradient-ruby-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-3 -right-3 bg-white rounded-xl p-3 shadow-xl border border-border/20">
              <div className="flex items-center space-x-2">
                <div className="text-center">
                  <div className="text-base font-bold text-ruby">150+</div>
                  <div className="text-xs text-muted-foreground">Events</div>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="text-center">
                  <div className="text-base font-bold text-ruby">★ 5.0</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-base">Charleston, SC Historic District</span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-elegant font-bold text-foreground">
                A Perfect Setting for Your Perfect Day
              </h3>
              
              <p className="text-base text-muted-foreground leading-relaxed">
                This enchanting venue combines the warmth of rustic wood beams with the elegance of 
                crystal chandeliers and twinkling string lights. Our partnership with 108 W Main ensures 
                that every detail of your celebration is seamlessly coordinated, from the stunning ambiance 
                to our exceptional culinary offerings.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 bg-white/60 border-ruby/20">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-ruby" />
                  <div>
                    <div className="font-semibold text-foreground text-base">Capacity</div>
                    <div className="text-sm text-muted-foreground">Up to 200 guests</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3 bg-white/60 border-ruby/20">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-ruby fill-ruby" />
                  <div>
                    <div className="font-semibold text-foreground text-base">Style</div>
                    <div className="text-sm text-muted-foreground">Rustic Elegance</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col space-y-3">
              <Button 
                size="lg"
                className="w-full bg-gradient-ruby-primary hover:bg-gradient-ruby-accent text-white font-semibold min-h-[44px]"
                asChild
              >
                <a href="/request-quote#page-header">Book This Venue</a>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="w-full border-ruby text-ruby hover:bg-ruby hover:text-white min-h-[44px]"
                asChild
              >
                <a href="/gallery?category=wedding">View Wedding Gallery</a>
              </Button>
            </div>

            {/* Partnership Note */}
            <div className="pt-3 border-t border-border/20">
              <p className="text-sm text-muted-foreground italic">
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