import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Crown, ChefHat, Award } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
export const AboutPreviewSection = () => {
  const {
    ref: titleRef,
    isVisible: titleVisible,
    variant: titleVariant
  } = useScrollAnimation({
    variant: 'ios-spring',
    delay: 0,
    mobile: {
      delay: 0
    },
    desktop: {
      delay: 100
    }
  });
  const {
    ref: card1Ref,
    isVisible: card1Visible,
    variant: card1Variant
  } = useScrollAnimation({
    variant: 'elastic',
    delay: 200,
    mobile: {
      delay: 150
    },
    desktop: {
      delay: 250
    }
  });
  const {
    ref: card2Ref,
    isVisible: card2Visible,
    variant: card2Variant
  } = useScrollAnimation({
    variant: 'elastic',
    delay: 300,
    mobile: {
      delay: 250
    },
    desktop: {
      delay: 350
    }
  });
  const {
    ref: card3Ref,
    isVisible: card3Visible,
    variant: card3Variant
  } = useScrollAnimation({
    variant: 'elastic',
    delay: 400,
    mobile: {
      delay: 350
    },
    desktop: {
      delay: 450
    }
  });
  const {
    ref: card4Ref,
    isVisible: card4Visible,
    variant: card4Variant
  } = useScrollAnimation({
    variant: 'elastic',
    delay: 500,
    mobile: {
      delay: 450
    },
    desktop: {
      delay: 550
    }
  });
  const titleAnimationClass = useAnimationClass(titleVariant, titleVisible);
  const card1AnimationClass = useAnimationClass(card1Variant, card1Visible);
  const card2AnimationClass = useAnimationClass(card2Variant, card2Visible);
  const card3AnimationClass = useAnimationClass(card3Variant, card3Visible);
  const card4AnimationClass = useAnimationClass(card4Variant, card4Visible);
  return <section className="py-16 lg:py-20 bg-muted/20 border-t border-border/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div ref={titleRef} className={`${titleAnimationClass} relative`}>
            {/* Watermark Icon - Behind the content, big */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <div className="opacity-5 transform scale-150">
                <img 
                  src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                  alt="" 
                  className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 object-contain" 
                  aria-hidden="true"
                />
              </div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant text-foreground mb-6">Culinary Excellence</h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 leading-relaxed">
                Founded by Chef Dominick "Train" Ward and Pastry Chef Tanya Ward, Soul Train's Eatery is a family-run, community-rooted catering business serving Charleston's Lowcountry with love and precision.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-8 leading-relaxed">From intimate gatherings to grand celebrations, we bring over two decades of culinary expertise, Southern hospitality, and ServSafe certified professionalism to every event. Taste the love in every bite.</p>
              
              <Link to="/about#page-header">
                <Button variant="cta" size="responsive-md" className="w-3/5 sm:w-auto sm:min-w-[14rem]">
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 md:gap-10 lg:gap-12">
            <Card ref={card1Ref} className={`shadow-elegant hover:shadow-elevated transition-all duration-200 overflow-hidden group bg-card ${card1AnimationClass}`}>
              <CardContent className="p-4 sm:p-6 text-center">
                <ChefHat className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">Chef Train</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">20+ Years Experience</p>
              </CardContent>
            </Card>
            <Card ref={card2Ref} className={`shadow-elegant hover:shadow-elevated transition-all duration-200 overflow-hidden group bg-card ${card2AnimationClass}`}>
              <CardContent className="p-4 sm:p-6 text-center">
                <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">Tanya Ward</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Pastry Chef</p>
              </CardContent>
            </Card>
            <Card ref={card3Ref} className={`shadow-elegant hover:shadow-elevated transition-all duration-200 overflow-hidden group bg-card ${card3AnimationClass}`}>
              <CardContent className="p-4 sm:p-6 text-center">
                <Award className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">ServSafe</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Certified</p>
              </CardContent>
            </Card>
            <Card ref={card4Ref} className={`shadow-elegant hover:shadow-elevated transition-all duration-200 overflow-hidden group bg-card ${card4AnimationClass}`}>
              <CardContent className="p-4 sm:p-6 text-center">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">Family Run</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Community Rooted</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>;
};