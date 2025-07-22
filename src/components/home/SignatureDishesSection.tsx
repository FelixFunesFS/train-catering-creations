import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

export const SignatureDishesSection = () => {
  const { ref: card1Ref, isVisible: card1Visible, variant: card1Variant } = useScrollAnimation({ delay: 0, variant: 'strong' });
  const { ref: card2Ref, isVisible: card2Visible, variant: card2Variant } = useScrollAnimation({ delay: 200, variant: 'strong' });
  const { ref: card3Ref, isVisible: card3Visible, variant: card3Variant } = useScrollAnimation({ delay: 400, variant: 'strong' });
  
  const card1AnimationClass = useAnimationClass(card1Variant, card1Visible);
  const card2AnimationClass = useAnimationClass(card2Variant, card2Visible);
  const card3AnimationClass = useAnimationClass(card3Variant, card3Visible);

  return (
    <section className="py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 bg-gradient-card shadow-card rounded-lg mx-3 sm:mx-4 lg:mx-6 xl:mx-8 my-6 sm:my-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 xl:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-3 sm:mb-4 lg:mb-6 leading-tight text-fade-up">
            Signature Dishes
          </h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-fade-up-delay-1">
            Taste the South with our carefully crafted menu featuring both traditional favorites and creative specialties.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div 
            ref={card1Ref}
            className={`neumorphic-card-2 hover:neumorphic-card-3 rounded-lg p-3 sm:p-4 transition-all duration-300 ${card1AnimationClass}`}
          >
            <div className="relative h-40 sm:h-48 rounded-xl overflow-hidden mb-3 sm:mb-4 group">
              <img 
                src="/lovable-uploads/ea7d03d8-7085-4847-b9d1-ebb3b0dd070a.png" 
                alt="Perfectly sliced brisket showcase" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="px-2 pb-2">
              <h3 className="text-base sm:text-lg lg:text-xl font-elegant font-semibold text-foreground mb-3 sm:mb-4">Southern Classics</h3>
              <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
                <li>• Slow-Smoked Brisket</li>
                <li>• Good Old-Fashioned Ribs</li>
                <li>• Red Beans & Rice</li>
                <li>• Southern-Style Cabbage</li>
                <li>• Creamy Mac & Cheese</li>
              </ul>
            </div>
          </div>

          <div 
            ref={card2Ref}
            className={`neumorphic-card-2 hover:neumorphic-card-3 rounded-lg p-3 sm:p-4 transition-all duration-300 ${card2AnimationClass}`}
          >
            <div className="relative h-40 sm:h-48 rounded-xl overflow-hidden mb-3 sm:mb-4 group">
              <img 
                src="/lovable-uploads/7f22e72c-441b-4b6c-9525-56748107fdd5.png" 
                alt="Gourmet salmon and creamy casserole presentation" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="px-2 pb-2">
              <h3 className="text-base sm:text-lg lg:text-xl font-elegant font-semibold text-foreground mb-3 sm:mb-4">Seafood & Specialties</h3>
              <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
                <li>• Shrimp Alfredo</li>
                <li>• Baked Salmon</li>
                <li>• Jamaican Jerk Chicken</li>
                <li>• Customizable Taco Platters</li>
                <li>• Vegetarian Options</li>
              </ul>
            </div>
          </div>

          <div 
            ref={card3Ref}
            className={`neumorphic-card-2 hover:neumorphic-card-3 rounded-lg p-3 sm:p-4 transition-all duration-300 ${card3AnimationClass}`}
          >
            <div className="relative h-40 sm:h-48 rounded-xl overflow-hidden mb-3 sm:mb-4 group">
              <img 
                src="/lovable-uploads/eecf9726-8cce-48e5-8abb-f0dd78ebcb4e.png" 
                alt="Elegant layered dessert cups arrangement" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="px-2 pb-2">
              <h3 className="text-base sm:text-lg lg:text-xl font-elegant font-semibold text-foreground mb-3 sm:mb-4">Tanya's Desserts</h3>
              <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
                <li>• Custom Cupcakes</li>
                <li>• Dessert Shots</li>
                <li>• Pastry Creations</li>
                <li>• Wedding Cakes</li>
                <li>• Special Occasion Treats</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 sm:mt-10 lg:mt-12 xl:mt-16">
          <Link to="/menu#page-header">
            <Button variant="cta" size="responsive-md" className="w-4/5 sm:w-auto hover-float">
              View Full Menu
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
