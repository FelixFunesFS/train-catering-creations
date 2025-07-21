
import { Link } from "react-router-dom";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { SectionContentCard } from "@/components/ui/section-content-card";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
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
    <section>
      <ResponsiveWrapper hasFullWidthCard>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div ref={titleRef} className={titleAnimationClass}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-elegant text-foreground mb-6">
              Culinary Excellence
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 leading-relaxed">
              Founded by Chef Dominick "Train" Ward and Pastry Chef Tanya Ward, Soul Train's Eatery is a family-run, community-rooted catering business serving Charleston's Lowcountry with love and precision.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed">
              From intimate gatherings to grand celebrations, we bring over two decades of culinary expertise, Southern hospitality, and ServSafe certified professionalism to every event. Taste the love in every bite.
            </p>
            <NeumorphicButton asChild variant="primary" size="lg">
              <Link to="/about#page-header">
                Learn More About Us
              </Link>
            </NeumorphicButton>
          </div>
          
          <div className="grid grid-cols-2 gap-6 md:gap-8 lg:gap-12">
            <SectionContentCard 
              ref={card1Ref}
              className={`text-center ${card1AnimationClass}`}
              interactive
            >
              <ChefHat className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-elegant font-semibold text-foreground mb-2 text-base sm:text-lg">Chef Train</h3>
              <p className="text-sm sm:text-base text-muted-foreground">20+ Years Experience</p>
            </SectionContentCard>
            
            <SectionContentCard 
              ref={card2Ref}
              className={`text-center ${card2AnimationClass}`}
              interactive
            >
              <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-elegant font-semibold text-foreground mb-2 text-base sm:text-lg">Tanya Ward</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Pastry Chef</p>
            </SectionContentCard>
            
            <SectionContentCard 
              ref={card3Ref}
              className={`text-center ${card3AnimationClass}`}
              interactive
            >
              <Award className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-elegant font-semibold text-foreground mb-2 text-base sm:text-lg">ServSafe</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Certified</p>
            </SectionContentCard>
            
            <SectionContentCard 
              ref={card4Ref}
              className={`text-center ${card4AnimationClass}`}
              interactive
            >
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-elegant font-semibold text-foreground mb-2 text-base sm:text-lg">Family Run</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Community Rooted</p>
            </SectionContentCard>
          </div>
        </div>
      </ResponsiveWrapper>
    </section>
  );
};
