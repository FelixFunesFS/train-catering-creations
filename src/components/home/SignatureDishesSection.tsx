
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ChefHat, Award, Clock, Users, Star, Heart } from "lucide-react";

export const SignatureDishesSection = () => {
  const { ref: heroRef, isVisible: heroVisible, variant: heroVariant } = useScrollAnimation({ delay: 0, variant: 'ios-spring' });
  const { ref: card1Ref, isVisible: card1Visible, variant: card1Variant } = useScrollAnimation({ delay: 200, variant: 'strong' });
  const { ref: card2Ref, isVisible: card2Visible, variant: card2Variant } = useScrollAnimation({ delay: 300, variant: 'strong' });
  const { ref: card3Ref, isVisible: card3Visible, variant: card3Variant } = useScrollAnimation({ delay: 400, variant: 'strong' });
  
  const heroAnimationClass = useAnimationClass(heroVariant, heroVisible);
  const card1AnimationClass = useAnimationClass(card1Variant, card1Visible);
  const card2AnimationClass = useAnimationClass(card2Variant, card2Visible);
  const card3AnimationClass = useAnimationClass(card3Variant, card3Visible);

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-card/30 border-t border-border/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="flex justify-center items-center gap-2 mb-4">
            <ChefHat className="w-5 h-5 text-primary" />
            <Heart className="w-4 h-4 text-primary" />
            <Star className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-3 sm:mb-4 leading-tight">
            Culinary Excellence
          </h2>
          <div className="w-16 h-1 bg-gradient-primary mx-auto mb-4 sm:mb-6 rounded-full" />
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience the artistry of Southern cuisine crafted by Chef 'Train' Ward and our dedicated family team.
          </p>
        </div>

        <div className="grid gap-6 lg:gap-8">
          {/* Featured Hero Card - Enhanced with better content */}
          <div
            ref={heroRef}
            className={`neumorphic-card-2 hover:neumorphic-card-3 bg-card transition-all duration-300 overflow-hidden group rounded-xl p-4 sm:p-6 lg:p-8 ${heroAnimationClass}`}
          >
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Image Section */}
              <div className="relative">
                <OptimizedImage
                  src="/lovable-uploads/ea7d03d8-7085-4847-b9d1-ebb3b0dd070a.png"
                  alt="Chef Train Ward's signature dishes"
                  aspectRatio="aspect-[4/3]"
                  className="group-hover:scale-105 transition-transform duration-300 rounded-lg"
                  priority
                />
                <div className="absolute top-4 right-4 bg-gradient-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  <Award className="w-3 h-3 mr-1 inline" />
                  Master Chef
                </div>
              </div>

              {/* Content Section */}
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-elegant font-bold text-foreground mb-4">
                    Chef 'Train' Ward's Culinary Legacy
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
                    With over 20 years of culinary excellence, Chef Ward brings authentic Southern flavors and 
                    innovative techniques to every dish. Our family-owned business combines traditional recipes 
                    with modern presentation for unforgettable dining experiences.
                  </p>

                  {/* Enhanced feature highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                      <ChefHat className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold text-foreground text-sm">20+ Years</div>
                        <div className="text-xs text-muted-foreground">Master Chef Experience</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold text-foreground text-sm">Family Business</div>
                        <div className="text-xs text-muted-foreground">Three Generations</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold text-foreground text-sm">Fresh Daily</div>
                        <div className="text-xs text-muted-foreground">Made to Order</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                      <Award className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold text-foreground text-sm">Award Winning</div>
                        <div className="text-xs text-muted-foreground">Signature Recipes</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/menu#page-header">
                    <Button variant="cta" size="responsive-md" className="w-full sm:w-auto">
                      View Full Menu
                    </Button>
                  </Link>
                  <Link to="/about#page-header">
                    <Button variant="outline" size="responsive-md" className="w-full sm:w-auto">
                      Meet Chef Train
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Supporting Menu Cards - Enhanced with better spacing */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div 
              ref={card1Ref}
              className={`neumorphic-card-2 hover:neumorphic-card-3 rounded-xl p-4 sm:p-5 transition-all duration-300 ${card1AnimationClass}`}
            >
              <div className="relative h-48 sm:h-52 rounded-lg overflow-hidden mb-4 group">
                <OptimizedImage
                  src="/lovable-uploads/ea7d03d8-7085-4847-b9d1-ebb3b0dd070a.png"
                  alt="Southern Classics showcase"
                  aspectRatio="aspect-[4/3]"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary/90 text-primary-foreground text-xs">
                    Most Popular
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-elegant font-semibold text-lg mb-2">Southern Classics</h3>
                </div>
              </div>
              <div className="space-y-2 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Slow-Smoked Brisket</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Good Old-Fashioned Ribs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Red Beans & Rice</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Creamy Mac & Cheese</span>
                </div>
              </div>
            </div>

            <div 
              ref={card2Ref}
              className={`neumorphic-card-2 hover:neumorphic-card-3 rounded-xl p-4 sm:p-5 transition-all duration-300 ${card2AnimationClass}`}
            >
              <div className="relative h-48 sm:h-52 rounded-lg overflow-hidden mb-4 group">
                <OptimizedImage
                  src="/lovable-uploads/7f22e72c-441b-4b6c-9525-56748107fdd5.png"
                  alt="Gourmet specialties presentation"
                  aspectRatio="aspect-[4/3]"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-secondary/90 text-secondary-foreground text-xs">
                    Chef's Choice
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-elegant font-semibold text-lg mb-2">Seafood & Specialties</h3>
                </div>
              </div>
              <div className="space-y-2 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Shrimp Alfredo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Baked Salmon</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Jamaican Jerk Chicken</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Customizable Taco Platters</span>
                </div>
              </div>
            </div>

            <div 
              ref={card3Ref}
              className={`neumorphic-card-2 hover:neumorphic-card-3 rounded-xl p-4 sm:p-5 transition-all duration-300 md:col-span-2 lg:col-span-1 ${card3AnimationClass}`}
            >
              <div className="relative h-48 sm:h-52 rounded-lg overflow-hidden mb-4 group">
                <OptimizedImage
                  src="/lovable-uploads/eecf9726-8cce-48e5-8abb-f0dd78ebcb4e.png"
                  alt="Tanya's elegant dessert creations"
                  aspectRatio="aspect-[4/3]"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-accent/90 text-accent-foreground text-xs">
                    Tanya's Signature
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-elegant font-semibold text-lg mb-2">Tanya's Desserts</h3>
                </div>
              </div>
              <div className="space-y-2 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Custom Wedding Cakes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Artisan Dessert Shots</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Seasonal Pastries</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Special Occasion Treats</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
