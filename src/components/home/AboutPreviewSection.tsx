
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Users, Crown, ChefHat, Award } from "lucide-react";
import { FloatingCard } from "@/components/ui/floating-card";
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
          <div ref={titleRef} className={titleAnimationClass}>
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant text-foreground mb-6">Culinary Excellence</h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 leading-relaxed">
                Founded by Chef Dominick "Train" Ward and Pastry Chef Tanya Ward, Soul Train's Eatery is a family-run, community-rooted catering business serving Charleston's Lowcountry with love and precision.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-8 leading-relaxed">From intimate gatherings to grand celebrations, we bring over two decades of culinary expertise, Southern hospitality, and ServSafe certified professionalism to every event. Taste the love in every bite.</p>
            </div>
            <Link to="/about#page-header">
              <Button variant="cta" size="responsive-md" className="w-3/5 sm:w-auto sm:min-w-[14rem]">
                Learn More About Us
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 md:gap-10 lg:gap-12">
            <FloatingCard 
              ref={card1Ref} 
              variant="medium"
              restingShadow="card"
              hoverShadow="elevated"
              highlightBorder
              className={`overflow-hidden group bg-card ${card1AnimationClass}`}
            >
              <div className="p-4 sm:p-6 text-center">
                <ChefHat className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">Chef Train</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">20+ Years Experience</p>
              </div>
            </FloatingCard>
            
            <FloatingCard 
              ref={card2Ref} 
              variant="medium"
              restingShadow="card"
              hoverShadow="elevated"
              highlightBorder
              className={`overflow-hidden group bg-card ${card2AnimationClass}`}
            >
              <div className="p-4 sm:p-6 text-center">
                <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">Tanya Ward</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Pastry Chef</p>
              </div>
            </FloatingCard>
            
            <FloatingCard 
              ref={card3Ref} 
              variant="medium"
              restingShadow="card"
              hoverShadow="elevated"
              highlightBorder
              className={`overflow-hidden group bg-card ${card3AnimationClass}`}
            >
              <div className="p-4 sm:p-6 text-center">
                <Award className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">ServSafe</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Certified</p>
              </div>
            </FloatingCard>
            
            <FloatingCard 
              ref={card4Ref} 
              variant="medium"
              restingShadow="card"
              hoverShadow="elevated"
              highlightBorder
              className={`overflow-hidden group bg-card ${card4AnimationClass}`}
            >
              <div className="p-4 sm:p-6 text-center">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">Family Run</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Community Rooted</p>
              </div>
            </FloatingCard>
          </div>
        </div>
      </div>
    </section>;
};
