import { useEffect, useRef, useState } from 'react';

interface UseMarqueeAnimationOptions {
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  autoStart?: boolean;
}

export const useMarqueeAnimation = (options: UseMarqueeAnimationOptions = {}) => {
  const {
    speed = 'normal',
    direction = 'left',
    pauseOnHover = true,
    autoStart = true
  } = options;

  const [isAnimating, setIsAnimating] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const getSpeedClass = () => {
    switch (speed) {
      case 'slow':
        return 'marquee-slow';
      case 'fast':
        return 'marquee-fast';
      default:
        return 'marquee';
    }
  };

  const getDirectionStyle = () => {
    return direction === 'right' ? { animationDirection: 'reverse' as const } : {};
  };

  const startAnimation = () => setIsAnimating(true);
  const stopAnimation = () => setIsAnimating(false);
  const pauseAnimation = () => setIsPaused(true);
  const resumeAnimation = () => setIsPaused(false);

  useEffect(() => {
    if (!ref.current || !pauseOnHover) return;

    const element = ref.current;
    
    const handleMouseEnter = () => pauseAnimation();
    const handleMouseLeave = () => resumeAnimation();

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [pauseOnHover]);

  const className = `${isAnimating ? getSpeedClass() : ''} ${isPaused ? 'paused' : ''}`.trim();
  const style = { ...getDirectionStyle(), animationPlayState: isPaused ? 'paused' : 'running' };

  return {
    ref,
    className,
    style,
    isAnimating,
    isPaused,
    startAnimation,
    stopAnimation,
    pauseAnimation,
    resumeAnimation
  };
};