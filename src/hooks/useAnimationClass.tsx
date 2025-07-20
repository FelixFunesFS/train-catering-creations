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
      case 'fade-up':
        return isVisible ? 'fade-up-visible' : 'fade-up-hidden';
      case 'scale-fade':
        return isVisible ? 'scale-fade-visible' : 'scale-fade-hidden';
      case 'slide-left':
        return isVisible ? 'slide-left-visible' : 'slide-left-hidden';
      case 'slide-right':
        return isVisible ? 'slide-right-visible' : 'slide-right-hidden';
      case 'slide-up':
        return isVisible ? 'slide-up-visible' : 'slide-up-hidden';
      case 'slide-down':
        return isVisible ? 'slide-down-visible' : 'slide-down-hidden';
      case 'zoom-fade':
        return isVisible ? 'zoom-fade-visible' : 'zoom-fade-hidden';
      case 'bounce-in':
        return isVisible ? 'bounce-in-visible' : 'bounce-in-hidden';
      case 'rotate-fade':
        return isVisible ? 'rotate-fade-visible' : 'rotate-fade-hidden';
      case 'flip-in':
        return isVisible ? 'flip-in-visible' : 'flip-in-hidden';
      case 'sticky-fade':
        return isVisible ? 'sticky-fade-visible' : 'sticky-fade-hidden';
      default:
        return isVisible ? 'ios-spring-visible' : 'ios-spring-hidden';
    }
  };

  return getVariantClass();
};