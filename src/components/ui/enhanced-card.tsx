import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useHover } from "@/hooks/useHover";

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tilt?: boolean;
  magnetic?: boolean;
  glowOnHover?: boolean;
  children: React.ReactNode;
}

export const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, tilt = false, magnetic = false, glowOnHover = false, children, ...props }, ref) => {
    const { ref: hoverRef, isHovered } = useHover();
    const [tiltStyle, setTiltStyle] = React.useState({ transform: "perspective(1000px)" });

    const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!tilt) return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const rotateX = (e.clientY - centerY) / 10;
      const rotateY = (centerX - e.clientX) / 10;
      
      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
      });
    }, [tilt]);

    const handleMouseLeave = React.useCallback(() => {
      if (tilt) {
        setTiltStyle({ transform: "perspective(1000px)" });
      }
    }, [tilt]);

    const combinedRef = React.useCallback((node: HTMLDivElement) => {
      (hoverRef as React.MutableRefObject<HTMLDivElement>).current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [hoverRef, ref]);

    return (
      <Card
        ref={combinedRef}
        className={cn(
          "transition-all duration-300 ease-out",
          tilt && "transform-gpu",
          glowOnHover && isHovered && "shadow-glow",
          className
        )}
        style={tilt ? tiltStyle : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";