import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import charcuterieSpread from "@/assets/gallery/charcuterie-spread.jpg";
import berryTartTower from "@/assets/gallery/berry-tart-tower.jpg";
import chafingDishRoses from "@/assets/gallery/chafing-dish-roses.jpg";
import foodMacCheese from "@/assets/gallery/food-mac-cheese.jpg";
import foodSalmon from "@/assets/gallery/food-salmon.jpg";

const images = [
  { src: charcuterieSpread, alt: "Elegant charcuterie and cheese spread" },
  { src: berryTartTower, alt: "Tiered fresh berry tart display" },
  { src: chafingDishRoses, alt: "Professional buffet setup with roses" },
  { src: foodMacCheese, alt: "Golden baked mac and cheese" },
  { src: foodSalmon, alt: "Cajun-spiced salmon fillets" },
];

export const ReviewsImageStrip = () => {
  const { ref, isVisible, variant } = useScrollAnimation({
    delay: 0,
    variant: "fade-up",
    mobile: { variant: "fade-up", delay: 0 },
    desktop: { variant: "ios-spring", delay: 0 },
  });

  return (
    <div 
      ref={ref} 
      className={`w-full overflow-x-auto scrollbar-hide py-4 ${useAnimationClass(variant, isVisible)}`}
    >
      <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 min-w-max">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 flex-shrink-0 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            style={{
              animationDelay: `${index * 75}ms`,
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
