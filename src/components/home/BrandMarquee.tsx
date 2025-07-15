import { useMarqueeAnimation } from '@/hooks/useMarqueeAnimation';
import { Train } from 'lucide-react';

export const BrandMarquee = () => {
  const { ref, className, style } = useMarqueeAnimation({
    speed: 'slow',
    direction: 'left',
    pauseOnHover: true
  });

  const marqueeContent = (
    <div className="flex items-center gap-8 text-xl font-script text-primary/80">
      <span className="whitespace-nowrap">Soul Train's Eatery</span>
      <Train className="h-6 w-6 text-primary" />
      <span className="whitespace-nowrap">Where passion meets Southern hospitality</span>
      <Train className="h-6 w-6 text-primary" />
      <span className="whitespace-nowrap">Soul Train's Eatery</span>
      <Train className="h-6 w-6 text-primary" />
      <span className="whitespace-nowrap">Where passion meets Southern hospitality</span>
      <Train className="h-6 w-6 text-primary" />
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-background via-muted/30 to-background py-4 border-y border-border/20">
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