import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import buffetOrchidSetup from "@/assets/gallery/buffet-orchid-setup.jpg";
import dessertMiniCheesecakes from "@/assets/gallery/dessert-mini-cheesecakes.jpg";
import formalGoldReception from "@/assets/gallery/formal-gold-reception.jpg";
import bbqOutdoorCarving from "@/assets/gallery/bbq-outdoor-carving.jpg";
import buffetHolidayWings from "@/assets/gallery/buffet-holiday-wings.jpg";

const images = [
  { src: buffetOrchidSetup, alt: "Elegant orchid buffet setup" },
  { src: dessertMiniCheesecakes, alt: "Gourmet mini cheesecakes" },
  { src: formalGoldReception, alt: "Formal gold reception setting" },
  { src: bbqOutdoorCarving, alt: "BBQ outdoor carving station" },
  { src: buffetHolidayWings, alt: "Holiday wings display" },
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
      className={`w-full py-4 ${useAnimationClass(variant, isVisible)}`}
    >
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 flex-shrink-0 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
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
