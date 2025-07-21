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
    <section className="py-8 md:py-12 lg:py-16 bg-gradient-card shadow-card rounded-lg mx-4 sm:mx-6 lg:mx-8 my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-elegant font-bold text-foreground mb-6 leading-tight text-fade-up">
            Signature Dishes
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-fade-up-delay-1">
            Taste the South with our carefully crafted menu featuring both traditional favorites and creative specialties.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          <Card 
            ref={card1Ref}
            className={`shadow-card overflow-hidden group hover:shadow-elegant transition-all duration-200 hover-float ${card1AnimationClass}`}
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src="/lovable-uploads/ea7d03d8-7085-4847-b9d1-ebb3b0dd070a.png" 
                alt="Perfectly sliced brisket showcase" 
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Southern Classics</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Slow-Smoked Brisket</li>
                <li>• Good Old-Fashioned Ribs</li>
                <li>• Red Beans & Rice</li>
                <li>• Southern-Style Cabbage</li>
                <li>• Creamy Mac & Cheese</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            ref={card2Ref}
            className={`shadow-card overflow-hidden group hover:shadow-elegant transition-all duration-200 hover-float ${card2AnimationClass}`}
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src="/lovable-uploads/7f22e72c-441b-4b6c-9525-56748107fdd5.png" 
                alt="Gourmet salmon and creamy casserole presentation" 
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Seafood & Specialties</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Shrimp Alfredo</li>
                <li>• Baked Salmon</li>
                <li>• Jamaican Jerk Chicken</li>
                <li>• Customizable Taco Platters</li>
                <li>• Vegetarian Options</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            ref={card3Ref}
            className={`shadow-card overflow-hidden group hover:shadow-elegant transition-all duration-200 hover-float ${card3AnimationClass}`}
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src="/lovable-uploads/eecf9726-8cce-48e5-8abb-f0dd78ebcb4e.png" 
                alt="Elegant layered dessert cups arrangement" 
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Tanya's Desserts</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Custom Cupcakes</li>
                <li>• Dessert Shots</li>
                <li>• Pastry Creations</li>
                <li>• Wedding Cakes</li>
                <li>• Special Occasion Treats</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 lg:mt-16">
          <Link to="/menu#page-header">
            <Button variant="cta" size="responsive-sm" className="w-3/5 sm:w-auto hover-float">
              View Full Menu
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};