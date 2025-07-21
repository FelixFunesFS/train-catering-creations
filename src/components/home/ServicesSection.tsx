
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

export const ServicesSection = () => {
  const {
    ref: card1Ref,
    isVisible: card1Visible,
    variant: card1Variant
  } = useScrollAnimation({
    delay: 0,
    variant: 'ios-spring'
  });
  const {
    ref: card2Ref,
    isVisible: card2Visible,
    variant: card2Variant
  } = useScrollAnimation({
    delay: 150,
    variant: 'ios-spring'
  });
  const {
    ref: card3Ref,
    isVisible: card3Visible,
    variant: card3Variant
  } = useScrollAnimation({
    delay: 300,
    variant: 'ios-spring'
  });
  const {
    ref: card4Ref,
    isVisible: card4Visible,
    variant: card4Variant
  } = useScrollAnimation({
    delay: 450,
    variant: 'ios-spring'
  });
  const card1AnimationClass = useAnimationClass(card1Variant, card1Visible);
  const card2AnimationClass = useAnimationClass(card2Variant, card2Visible);
  const card3AnimationClass = useAnimationClass(card3Variant, card3Visible);
  const card4AnimationClass = useAnimationClass(card4Variant, card4Visible);

  return (
    <section className="bg-gradient-card/30 border-t border-border/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 xl:py-16">
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant text-foreground mb-4 text-fade-up">
            Our Catering Services
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-fade-up-delay-1">Elegant weddings, heartfelt celebrations, and corporate events—catered with care, Southern soul, and impeccable service.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-14">
          <Link to="/wedding-menu#page-header" className="block">
            <div ref={card1Ref} className={`neumorphic-card-2 hover:neumorphic-card-3 bg-card text-center transition-all duration-200 overflow-hidden group flex flex-col cursor-pointer rounded-lg ${card1AnimationClass}`}>
              <div className="relative flex-1">
                <OptimizedImage src="/lovable-uploads/546d7d1a-7987-4f44-a2d9-668efea60e51.png" alt="Wedding Reception Setup" aspectRatio="aspect-video" className="group-hover:scale-105 transition-transform duration-300 h-full" />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-4">Weddings</h3>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">Elegant receptions and intimate ceremonies with personalized menus</p>
                <span className="text-primary hover:text-primary/80 font-medium group inline-flex items-center gap-1">
                  Learn More 
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </span>
              </div>
            </div>
          </Link>

          <Link to="/wedding-menu#page-header" className="block">
            <div ref={card2Ref} className={`neumorphic-card-2 hover:neumorphic-card-3 bg-card text-center transition-all duration-200 overflow-hidden group flex flex-col cursor-pointer rounded-lg ${card2AnimationClass}`}>
              <div className="relative flex-1">
                <OptimizedImage src="/lovable-uploads/63832488-46ff-4d71-ade5-f871173c28ab.png" alt="Black Tie Event Catering" aspectRatio="aspect-video" className="group-hover:scale-105 transition-transform duration-300 h-full" />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-4">Black Tie Events</h3>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">Sophisticated catering for galas and formal celebrations</p>
                <span className="text-primary hover:text-primary/80 font-medium group inline-flex items-center gap-1">
                  Learn More 
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </span>
              </div>
            </div>
          </Link>

          <div ref={card3Ref} className={`neumorphic-card-2 hover:neumorphic-card-3 bg-card text-center transition-all duration-200 overflow-hidden group flex flex-col rounded-lg ${card3AnimationClass}`}>
            <div className="relative flex-1">
              <OptimizedImage src="/lovable-uploads/3226c955-a9b7-4c8d-a4c2-e5e7fc206f6f.png" alt="Military Function Catering" aspectRatio="aspect-video" className="group-hover:scale-105 transition-transform duration-300 h-full" />
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-4">Military Functions</h3>
              <p className="text-base sm:text-lg text-muted-foreground mb-6">Honoring service with promotions, ceremonies, and celebrations</p>
              <Link to="/wedding-menu#page-header" className="text-primary hover:text-primary/80 font-medium group inline-flex items-center gap-1">
                Learn More 
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </div>
          </div>

          <div ref={card4Ref} className={`neumorphic-card-2 hover:neumorphic-card-3 bg-card text-center transition-all duration-200 overflow-hidden group flex flex-col rounded-lg ${card4AnimationClass}`}>
            <div className="relative flex-1">
              <OptimizedImage src="/lovable-uploads/6cd766e3-21ce-4e88-a3a4-6c8835dc9654.png" alt="Private Event Catering" aspectRatio="aspect-video" className="group-hover:scale-105 transition-transform duration-300 h-full" />
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-4">Private Events</h3>
              <p className="text-base sm:text-lg text-muted-foreground mb-6">Corporate conferences, family gatherings, and special occasions</p>
              <Link to="/menu#page-header" className="text-primary hover:text-primary/80 font-medium group inline-flex items-center gap-1">
                View Menu 
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};
