
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { LucideIcon } from "lucide-react";

interface SupportingServiceCardProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  link: string;
  ctaText?: string;
  delay?: number;
  icon?: LucideIcon;
  feature?: string;
}

export const SupportingServiceCard = ({
  title,
  description,
  image,
  imageAlt,
  link,
  ctaText = "Get Quote",
  delay = 0,
  icon: Icon,
  feature
}: SupportingServiceCardProps) => {
  const { ref, isVisible, variant } = useScrollAnimation({
    delay,
    variant: 'ios-spring'
  });
  const animationClass = useAnimationClass(variant, isVisible);

  return (
    <Link to={link} className="block">
      <div
        ref={ref}
        className={`neumorphic-card-2 hover:neumorphic-card-3 bg-card transition-all duration-300 overflow-hidden group cursor-pointer rounded-lg p-4 h-full flex flex-col ${animationClass}`}
      >
        <div className="relative mb-4">
          <OptimizedImage
            src={image}
            alt={imageAlt}
            aspectRatio="aspect-video"
            className="group-hover:scale-105 transition-transform duration-300 rounded-lg"
          />
          {Icon && (
            <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground p-2 rounded-full">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="text-lg sm:text-xl font-elegant font-semibold text-foreground mb-2 sm:mb-3">
            {title}
          </h3>
          
          {feature && (
            <p className="text-xs text-primary font-medium mb-2 bg-primary/10 px-2 py-1 rounded-md w-fit">
              {feature}
            </p>
          )}
          
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">
            {description}
          </p>
          
          <div className="mt-auto">
            <span className="text-primary hover:text-primary/80 font-medium group inline-flex items-center gap-1 text-sm">
              {ctaText}
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
