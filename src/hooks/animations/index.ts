// Main scroll animation hooks
export { useScrollAnimation } from '../useScrollAnimation';
export { useAnimationClass } from '../useAnimationClass';

// Specialized animation hooks
export { useMarqueeAnimation } from '../useMarqueeAnimation';
export { useParallaxEffect } from '../useParallaxEffect';
export { useStickyElement } from '../useStickyElement';
export { useImageZoom } from '../useImageZoom';
export { useStaggeredAnimation } from '../useStaggeredAnimation';

// Types
export type { AnimationVariant } from '../useScrollAnimation';

// Animation utilities
export const animationVariants = {
  // Basic variants
  subtle: 'subtle',
  medium: 'medium',
  strong: 'strong',
  elastic: 'elastic',
  'ios-spring': 'ios-spring',
  'fade-up': 'fade-up',
  'scale-fade': 'scale-fade',
  
  // Directional variants
  'slide-left': 'slide-left',
  'slide-right': 'slide-right',
  'slide-up': 'slide-up',
  'slide-down': 'slide-down',
  
  // Special effects
  'zoom-fade': 'zoom-fade',
  'bounce-in': 'bounce-in',
  'rotate-fade': 'rotate-fade',
  'flip-in': 'flip-in',
  'sticky-fade': 'sticky-fade'
} as const;

export const animationTimings = {
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 700
} as const;

export const animationEasings = {
  easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
} as const;