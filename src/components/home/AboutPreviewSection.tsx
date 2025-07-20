
import { Link } from "react-router-dom";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { Heart, Users, Crown, ChefHat, Award } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

export const AboutPreviewSection = () => {
  const { ref: titleRef, isVisible: titleVisible, variant: titleVariant } = useScrollAnimation({
    variant: 'ios-spring',
    delay: 0,
    mobile: { delay: 0 },
    desktop: { delay: 100 }
  });
  
  const { ref: card1Ref, isVisible: card1Visible, variant: card1Variant } = useScrollAnimation({
    variant: 'elastic',
    delay: 200,
    mobile: { delay: 150 },
    desktop: { delay: 250 }
  });
  
  const { ref: card2Ref, isVisible: card2Visible, variant: card2Variant } = useScrollAnimation({
    variant: 'elastic',
    delay: 300,
    mobile: { delay: 250 },
    desktop: { delay: 350 }
  });
  
  const { ref: card3Ref, isVisible: card3Visible, variant: card3Variant } = useScrollAnimation({
    variant: 'elastic',
    delay: 400,
    mobile: { delay: 350 },
    desktop: { delay: 450 }
  });
  
  const { ref: card4Ref, isVisible: card4Visible, variant: card4Variant } = useScrollAnimation({
    variant: 'elastic',
    delay: 500,
    mobile: { delay: 450 },
    desktop: { delay: 550 }
  });

  const titleAnimationClass = useAnimationClass(titleVariant, titleVisible);
  const card1AnimationClass = useAnimationClass(card1Variant, card1Visible);
  const card2AnimationClass = useAnimationClass(card2Variant, card2Visible);
  const card3AnimationClass = useAnimationClass(card3Variant, card3Visible);
  const card4AnimationClass = useAnimationClass(card4Variant, card4Visible);

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div ref={titleRef} className={titleAnimationClass}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant text-foreground mb-6">
              Culinary Excellence
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 leading-relaxed">
              Founded by Chef Dominick "Train" Ward and Pastry Chef Tanya Ward, Soul Train's Eatery is a family-run, community-rooted catering business serving Charleston's Lowcountry with love and precision.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-8 leading-relaxed">
              From intimate gatherings to grand celebrations, we bring over two decades of culinary expertise, Southern hospitality, and ServSafe certified professionalism to every event. Taste the love in every bite.
            </p>
            <NeumorphicButton asChild variant="primary" size="lg">
              <Link to="/about#page-header">
                Learn More About Us
              </Link>
            </NeumorphicButton>
          </div>
          
          <div className="grid grid-cols-2 gap-6 md:gap-10 lg:gap-12">
            <NeumorphicCard 
              ref={card1Ref} 
              className={`text-center group hover:scale-105 transition-transform duration-300 ${card1AnimationClass}`}
              level={2}
              interactive
            >
              <ChefHat className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">Chef Train</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">20+ Years Experience</p>
            </NeumorphicCard>
            
            <NeumorphicCard 
              ref={card2Ref} 
              className={`text-center group hover:scale-105 transition-transform duration-300 ${card2AnimationClass}`}
              level={2}
              interactive
            >
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">Tanya Ward</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Pastry Chef</p>
            </NeumorphicCard>
            
            <NeumorphicCard 
              ref={card3Ref} 
              className={`text-center group hover:scale-105 transition-transform duration-300 ${card3AnimationClass}`}
              level={2}
              interactive
            >
              <Award className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">ServSafe</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Certified</p>
            </NeumorphicCard>
            
            <NeumorphicCard 
              ref={card4Ref} 
              className={`text-center group hover:scale-105 transition-transform duration-300 ${card4AnimationClass}`}
              level={2}
              interactive
            >
              <Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="font-elegant font-semibold text-foreground mb-2 text-sm sm:text-base">Family Run</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Community Rooted</p>
            </NeumorphicCard>
          </div>
        </div>
      </div>
    </section>
  );
};
