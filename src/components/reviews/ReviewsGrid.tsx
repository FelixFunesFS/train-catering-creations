import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface Review {
  name: string;
  event: string;
  rating: number;
  text: string;
  date: string;
}

interface ReviewsGridProps {
  reviews: Review[];
  renderStars: (rating: number) => JSX.Element[];
}

export const ReviewsGrid = ({ reviews, renderStars }: ReviewsGridProps) => {
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation({ 
    variant: 'fade-up', 
    delay: 100 
  });
  const gridAnimationClass = useAnimationClass('fade-up', gridVisible);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div 
        ref={gridRef}
        className={`grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 ${gridAnimationClass}`}
      >
        {reviews.map((review, index) => (
          <NeumorphicCard key={index} level={2} className="hover:scale-105 transition-transform duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-elegant font-semibold text-foreground">{review.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{review.event}</p>
                </div>
                <div className="flex space-x-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              <p className="text-sm sm:text-base text-foreground mb-2 sm:mb-3 leading-relaxed">
                "{review.text}"
              </p>
              <p className="text-xs text-muted-foreground">{review.date}</p>
            </div>
          </NeumorphicCard>
        ))}
      </div>
    </div>
  );
};
