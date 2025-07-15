import { ReactNode, HTMLAttributes, createElement } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface AnimatedSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  animation?: 'fade-in-up' | 'fade-in-left' | 'fade-in-right' | 'scale-in' | 'slide-in-up';
  delay?: number;
  duration?: 'fast' | 'normal' | 'slow';
  easing?: 'ease-out' | 'ease-in-out' | 'bounce';
  as?: keyof JSX.IntrinsicElements;
}

const animationClasses = {
  'fade-in-up': 'animate-fade-in-up',
  'fade-in-left': 'animate-fade-in-left',
  'fade-in-right': 'animate-fade-in-right',
  'scale-in': 'animate-scale-in',
  'slide-in-up': 'animate-slide-in-up',
};

const durationClasses = {
  fast: 'duration-300',
  normal: 'duration-500',
  slow: 'duration-700',
};

const easingClasses = {
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  'bounce': 'ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]',
};

export const AnimatedSection = ({
  children,
  animation = 'fade-in-up',
  delay = 0,
  duration = 'normal',
  easing = 'ease-out',
  as: Component = 'section',
  className,
  ...props
}: AnimatedSectionProps) => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    delay,
  });

  return createElement(
    Component,
    {
      ref: elementRef,
      className: cn(
        'transition-all transform-gpu',
        durationClasses[duration],
        easingClasses[easing],
        isIntersecting ? animationClasses[animation] : 'opacity-0 translate-y-4',
        className
      ),
      ...props,
    },
    children
  );
};

// Card animation component
export const AnimatedCard = ({
  children,
  delay = 0,
  className,
  ...props
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    delay,
  });

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={cn(
        'transition-all duration-500 ease-out transform-gpu',
        isIntersecting 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-6 scale-95',
        'hover:scale-105 hover:shadow-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Staggered grid animation
export const AnimatedGrid = ({
  children,
  className,
  staggerDelay = 100,
  ...props
}: {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
} & HTMLAttributes<HTMLDivElement>) => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={cn('grid', className)}
      {...props}
    >
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(
            'transition-all duration-500 ease-out transform-gpu',
            isIntersecting 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-6'
          )}
          style={{
            transitionDelay: isIntersecting ? `${index * staggerDelay}ms` : '0ms',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};