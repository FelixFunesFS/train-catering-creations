import { useMarqueeAnimation } from '@/hooks/useMarqueeAnimation';

export const BrandMarquee = () => {
  const { ref, className, style } = useMarqueeAnimation({
    speed: 'normal',
    direction: 'left',
    pauseOnHover: true
  });

  const marqueeContent = (
    <div className="flex items-center gap-12 text-xl font-script text-primary/80">
      <span className="whitespace-nowrap">Soul Train's Eatery</span>
      <img src="/lovable-uploads/d5bcd865-8652-4b1c-a055-cf38d61e578e.png" alt="Soul Train's logo" className="h-6 w-6 flex-shrink-0" />
      <span className="whitespace-nowrap">Where Southern Flavor Meets Family & Celebration</span>
      <img src="/lovable-uploads/d5bcd865-8652-4b1c-a055-cf38d61e578e.png" alt="Soul Train's logo" className="h-6 w-6 flex-shrink-0" />
      <span className="whitespace-nowrap">Charleston's Premier Catering</span>
      <img src="/lovable-uploads/d5bcd865-8652-4b1c-a055-cf38d61e578e.png" alt="Soul Train's logo" className="h-6 w-6 flex-shrink-0" />
      <span className="whitespace-nowrap">Taste the Love in Every Bite</span>
      <img src="/lovable-uploads/d5bcd865-8652-4b1c-a055-cf38d61e578e.png" alt="Soul Train's logo" className="h-6 w-6 flex-shrink-0" />
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-background via-muted/30 to-background py-12 lg:py-16 border-y border-border/20">
      <div 
        ref={ref}
        className={`flex items-center ${className}`}
        style={style}
      >
        {marqueeContent}
        {marqueeContent}
        {marqueeContent}
      </div>
    </div>
  );
};