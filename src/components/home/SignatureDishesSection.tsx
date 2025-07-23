
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Chef, Award, Clock, Users } from "lucide-react";

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
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-3 sm:mb-4 leading-tight">
            Culinary Excellence
          </h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience the artistry of Southern cuisine crafted by Chef 'Train' Ward and our dedicated family team.
          </p>
        </div>

        <div className="grid gap-6 lg:gap-8">
          {/* Featured Hero Card - Full width */}
          <div
            ref={heroRef}
            className={`neumorphic-card-2 hover:neumorphic-card-3 bg-card transition-all duration-300 overflow-hidden group rounded-xl p-4 sm:p-6 ${heroAnimationClass}`}
          >
            <Badge className="absolute top-4 right-4 bg-gradient-primary text-primary-foreground z-10">
              <Award className="w-3 h-3 mr-1 fill-current" />
              Family Recipe
            </Badge>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image Section */}
              <div className="relative">
                <OptimizedImage
                  src="/lovable-uploads/ea7d03d8-7085-4847-b9d1-ebb3b0dd070a.png"
                  alt="Chef Train Ward's signature dishes"
                  aspectRatio="aspect-[4/3]"
                  className="group-hover:scale-105 transition-transform duration-300 rounded-lg"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              </div>

              {/* Content Section */}
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-elegant font-bold text-foreground mb-3 sm:mb-4">
                    Chef 'Train' Ward's Legacy
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    With over 20 years of culinary excellence, Chef Ward brings authentic Southern flavors and 
                    innovative techniques to every dish. Our family-owned business combines traditional recipes 
                    with modern presentation for unforgettable dining experiences.
                  </p>

                  {/* Feature highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Chef className="w-4 h-4 text-primary" />
                      <span>20+ Years Experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 text-primary" />
                      <span>Family-Owned Business</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Fresh Daily Preparation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="w-4 h-4 text-primary" />
                      <span>Award-Winning Recipes</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/menu#page-header">
                    <Button variant="cta" size="responsive-sm" className="w-full sm:w-auto">
                      View Full Menu
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Supporting Menu Cards - 3 cards in horizontal row */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div 
              ref={card1Ref}
              className={`neumorphic-card-2 hover:neumorphic-card-3 rounded-lg p-4 transition-all duration-300 ${card1AnimationClass}`}
            >
              <div className="relative h-40 sm:h-48 rounded-xl overflow-hidden mb-4 group">
                <OptimizedImage
                  src="/lovable-uploads/ea7d03d8-7085-4847-b9d1-ebb3b0dd070a.png"
                  alt="Southern Classics showcase"
                  aspectRatio="aspect-[4/3]"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <Badge className="bg-primary/90 text-primary-foreground text-xs mb-2">
                    Most Popular
                  </Badge>
                </div>
              </div>
              <div className="px-2 pb-2">
                <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-3">Southern Classics</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Slow-Smoked Brisket</li>
                  <li>• Good Old-Fashioned Ribs</li>
                  <li>• Red Beans & Rice</li>
                  <li>• Creamy Mac & Cheese</li>
                </ul>
              </div>
            </div>

            <div 
              ref={card2Ref}
              className={`neumorphic-card-2 hover:neumorphic-card-3 rounded-lg p-4 transition-all duration-300 ${card2AnimationClass}`}
            >
              <div className="relative h-40 sm:h-48 rounded-xl overflow-hidden mb-4 group">
                <OptimizedImage
                  src="/lovable-uploads/7f22e72c-441b-4b6c-9525-56748107fdd5.png"
                  alt="Gourmet specialties presentation"
                  aspectRatio="aspect-[4/3]"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <Badge className="bg-secondary/90 text-secondary-foreground text-xs mb-2">
                    Chef's Choice
                  </Badge>
                </div>
              </div>
              <div className="px-2 pb-2">
                <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-3">Seafood & Specialties</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Shrimp Alfredo</li>
                  <li>• Baked Salmon</li>
                  <li>• Jamaican Jerk Chicken</li>
                  <li>• Customizable Taco Platters</li>
                </ul>
              </div>
            </div>

            <div 
              ref={card3Ref}
              className={`neumorphic-card-2 hover:neumorphic-card-3 rounded-lg p-4 transition-all duration-300 md:col-span-2 lg:col-span-1 ${card3AnimationClass}`}
            >
              <div className="relative h-40 sm:h-48 rounded-xl overflow-hidden mb-4 group">
                <OptimizedImage
                  src="/lovable-uploads/eecf9726-8cce-48e5-8abb-f0dd78ebcb4e.png"
                  alt="Tanya's elegant dessert creations"
                  aspectRatio="aspect-[4/3]"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <Badge className="bg-accent/90 text-accent-foreground text-xs mb-2">
                    Tanya's Signature
                  </Badge>
                </div>
              </div>
              <div className="px-2 pb-2">
                <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-3">Tanya's Desserts</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Custom Wedding Cakes</li>
                  <li>• Artisan Dessert Shots</li>
                  <li>• Seasonal Pastries</li>
                  <li>• Special Occasion Treats</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
