
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface WeddingMenuCardProps {
  title: string;
  description: string;
  delay?: number;
}

export const WeddingMenuCard = ({ title, description, delay = 0 }: WeddingMenuCardProps) => {
  const { ref: cardRef, isVisible: cardVisible, variant: cardVariant } = useScrollAnimation({ 
    variant: 'elastic', 
    delay,
    mobile: { delay: delay * 0.75 },
    desktop: { delay: delay * 1.25 }
  });
  const cardAnimationClass = useAnimationClass(cardVariant, cardVisible);
  
  return (
    <div ref={cardRef} className={`neumorphic-card-2 transition-all duration-300 hover:neumorphic-card-3 rounded-lg ${cardAnimationClass}`}>
      <CardContent className="p-6">
        <h4 className="font-elegant font-semibold text-foreground mb-2">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </div>
  );
};
