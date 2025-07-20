
import { useMarqueeAnimation } from '@/hooks/useMarqueeAnimation';
import { useIsMobile } from '@/hooks/use-mobile';

export const BrandMarquee = () => {
  const isMobile = useIsMobile();
  
  // Use slow speed for desktop/tablet, fast for mobile
  const { ref, className, style } = useMarqueeAnimation({
    speed: isMobile ? 'fast' : 'slow',
    direction: 'left',
    pauseOnHover: false
  });

  const marqueeContent = (
    <div className="flex items-center gap-8 lg:gap-12 text-lg sm:text-xl lg:text-2xl xl:text-3xl font-script text-white">
      <span className="whitespace-nowrap">Soul Train's Eatery</span>
      <img src="/lovable-uploads/d5bcd865-8652-4b1c-a055-cf38d61e578e.png" alt="Soul Train's logo" className="h-6 w-6 lg:h-8 lg:w-8 flex-shrink-0 brightness-0 saturate-100 invert-0 sepia-100 hue-rotate-0 contrast-200" style={{filter: 'brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7471%) hue-rotate(3deg) brightness(95%) contrast(118%)'}} />
      <span className="whitespace-nowrap">Where Southern Flavor Meets Family & Celebration</span>
      <img src="/lovable-uploads/d5bcd865-8652-4b1c-a055-cf38d61e578e.png" alt="Soul Train's logo" className="h-6 w-6 lg:h-8 lg:w-8 flex-shrink-0" style={{filter: 'brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7471%) hue-rotate(3deg) brightness(95%) contrast(118%)'}} />
      <span className="whitespace-nowrap">Charleston's Premier Catering</span>
      <img src="/lovable-uploads/d5bcd865-8652-4b1c-a055-cf38d61e578e.png" alt="Soul Train's logo" className="h-6 w-6 lg:h-8 lg:w-8 flex-shrink-0" style={{filter: 'brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7471%) hue-rotate(3deg) brightness(95%) contrast(118%)'}} />
      <span className="whitespace-nowrap">Taste the Love in Every Bite</span>
      <img src="/lovable-uploads/d5bcd865-8652-4b1c-a055-cf38d61e578e.png" alt="Soul Train's logo" className="h-6 w-6 lg:h-8 lg:w-8 flex-shrink-0" style={{filter: 'brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7471%) hue-rotate(3deg) brightness(95%) contrast(118%)'}} />
      <span className="whitespace-nowrap">Authentic Southern Cuisine</span>
      <img src="/lovable-uploads/d5bcd865-8652-4b1c-a055-cf38d61e578e.png" alt="Soul Train's logo" className="h-6 w-6 lg:h-8 lg:w-8 flex-shrink-0" style={{filter: 'brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7471%) hue-rotate(3deg) brightness(95%) contrast(118%)'}} />
      <span className="whitespace-nowrap">Creating Memories One Meal at a Time</span>
      <img src="/lovable-uploads/d5bcd865-8652-4b1c-a055-cf38d61e578e.png" alt="Soul Train's logo" className="h-6 w-6 lg:h-8 lg:w-8 flex-shrink-0" style={{filter: 'brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7471%) hue-rotate(3deg) brightness(95%) contrast(118%)'}} />
    </div>
  );

  return (
    <div className="w-full relative overflow-hidden bg-gradient-to-r from-background via-muted/30 to-background py-12 lg:py-16 border-y border-border/20">
      <div 
        ref={ref}
        className={`flex items-center whitespace-nowrap ${className}`}
        style={{...style, width: 'max-content'}}
      >
        {/* Repeat content 8 times for seamless looping across full screen width */}
        {marqueeContent}
        {marqueeContent}
        {marqueeContent}
        {marqueeContent}
        {marqueeContent}
        {marqueeContent}
        {marqueeContent}
        {marqueeContent}
      </div>
    </div>
  );
};
