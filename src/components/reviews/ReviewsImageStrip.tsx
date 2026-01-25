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
  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'bounce-in', 
    delay: 100 
  });
  const animationClass = useAnimationClass('bounce-in', isVisible);

  return (
    <div ref={ref} className={`w-full py-4 ${animationClass}`}>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8">
        {images.map((image, index) => (
          <div
            key={index}
            className="
              relative w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 
              flex-shrink-0 rounded-xl overflow-hidden 
              border-2 border-transparent hover:border-ruby/30
              shadow-md hover:shadow-glow-strong
              transition-all duration-500
              group cursor-pointer
            "
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            {/* Ruby gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-ruby-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
};
