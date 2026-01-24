import { useMarqueeAnimation } from '@/hooks/useMarqueeAnimation';
import { Star, Award, Shield, Heart, Users, Calendar } from 'lucide-react';

interface TrustItem {
  icon: React.ReactNode;
  text: string;
}

export const TrustMarquee = () => {
  const { ref, className, style } = useMarqueeAnimation({
    speed: 'normal',
    direction: 'left',
    pauseOnHover: true
  });

  const trustItems: TrustItem[] = [
    { icon: <Calendar className="h-4 w-4" />, text: "500+ Events Catered" },
    { icon: <Star className="h-4 w-4" />, text: "5-Star Reviews" },
    { icon: <Award className="h-4 w-4" />, text: "20+ Years Experience" },
    { icon: <Heart className="h-4 w-4" />, text: "Family-Owned & Operated" },
    { icon: <Users className="h-4 w-4" />, text: "Charleston's Choice" },
    { icon: <Shield className="h-4 w-4" />, text: "Fully Licensed & Insured" },
  ];

  const marqueeContent = (
    <div className="flex items-center gap-6 sm:gap-8 lg:gap-12">
      {trustItems.map((item, index) => (
        <div 
          key={index} 
          className="flex items-center gap-2 text-sm sm:text-base font-medium text-muted-foreground whitespace-nowrap"
        >
          <span className="text-ruby">{item.icon}</span>
          <span>{item.text}</span>
          <span className="ml-4 sm:ml-6 lg:ml-10 text-ruby/40">•</span>
        </div>
      ))}
    </div>
  );

  return (
    <section 
      aria-label="Trust indicators" 
      className="w-full relative overflow-hidden py-4 sm:py-5 lg:py-6 bg-secondary/30 border-y border-border/30"
    >
      <div 
        ref={ref}
        className={`flex items-center whitespace-nowrap ${className}`}
        style={{ ...style, width: 'max-content' }}
      >
        {/* Repeat content for seamless looping */}
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center">
            {marqueeContent}
          </div>
        ))}
      </div>
    </section>
  );
};
