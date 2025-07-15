import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amplitude?: number;
  speed?: number;
}

export const FloatingElement = ({ 
  children, 
  className, 
  delay = 0, 
  amplitude = 10, 
  speed = 3000 
}: FloatingElementProps) => {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const startTime = Date.now() + delay;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > 0) {
        const newPosition = Math.sin(elapsed / speed * 2 * Math.PI) * amplitude;
        setPosition(newPosition);
      }
      requestAnimationFrame(animate);
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [delay, amplitude, speed]);

  return (
    <div
      className={cn("transition-transform duration-100 ease-out", className)}
      style={{ transform: `translateY(${position}px)` }}
    >
      {children}
    </div>
  );
};

interface ParallaxElementProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  offset?: number;
}

export const ParallaxElement = ({ 
  children, 
  className, 
  speed = 0.5, 
  offset = 0 
}: ParallaxElementProps) => {
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      setTranslateY((scrolled + offset) * speed);
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [speed, offset]);

  return (
    <div
      className={cn("will-change-transform", className)}
      style={{ transform: `translateY(${translateY}px)` }}
    >
      {children}
    </div>
  );
};