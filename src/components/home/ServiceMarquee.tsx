
import { useMarqueeAnimation } from '@/hooks/useMarqueeAnimation';

export const ServiceMarquee = () => {
  // Speed is 'normal' for readability - CSS handles responsive adjustments
  const { ref, className, style } = useMarqueeAnimation({
    speed: 'normal',
    direction: 'left',
    pauseOnHover: false
  });

  const services = [
    'Corporate Events',
    'Wedding Catering', 
    'Family Gatherings',
    'Special Events',
    'Promotion Ceremonies',
    'Military Functions'
  ];

  const marqueeContent = (
    <div className="flex items-center gap-8 lg:gap-12 text-sm sm:text-base lg:text-lg font-medium text-muted-foreground">
      {services.map((service, index) => (
        <div key={index} className="flex items-center gap-8 lg:gap-12">
          <span className="whitespace-nowrap">{service}</span>
          <div className="w-1 h-1 bg-primary/60 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full relative overflow-hidden py-3 lg:py-4 border-b border-border/20">
      <div 
        ref={ref}
        className={`flex items-center whitespace-nowrap ${className}`}
        style={{...style, width: 'max-content'}}
      >
        {/* Repeat content for seamless looping */}
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i}>
            {marqueeContent}
          </div>
        ))}
      </div>
    </div>
  );
};
