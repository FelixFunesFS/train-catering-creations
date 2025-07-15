import { AnimationVariant } from './useScrollAnimation';

export const useAnimationClass = (variant: AnimationVariant, isVisible: boolean) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'ios-spring':
        return isVisible ? 'ios-spring-visible' : 'ios-spring-hidden';
      case 'elastic':
        return isVisible ? 'elastic-visible' : 'elastic-hidden';
      case 'subtle':
        return isVisible ? 'subtle-visible' : 'subtle-hidden';
      case 'medium':
        return isVisible ? 'medium-visible' : 'medium-hidden';
      case 'strong':
        return isVisible ? 'strong-visible' : 'strong-hidden';
      default:
        return isVisible ? 'scroll-animate-visible' : 'scroll-animate-hidden';
    }
  };

  return getVariantClass();
};