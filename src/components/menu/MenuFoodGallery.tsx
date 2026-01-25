import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { Camera } from "lucide-react";

// Import high-quality images from gallery assets
import foodSalmon from '@/assets/gallery/food-salmon.jpg';
import foodMacCheese from '@/assets/gallery/food-mac-cheese.jpg';
import foodJerkChicken from '@/assets/gallery/food-jerk-chicken.jpg';
import buffetOutdoorTent from '@/assets/gallery/buffet-outdoor-tent.jpg';
import dessertHolidayCupcakes from '@/assets/gallery/dessert-holiday-cupcakes.jpg';

const galleryImages = [
  {
    src: foodSalmon,
    title: "Cajun-Spiced Salmon",
    description: "Beautifully seasoned salmon fillets"
  },
  {
    src: foodMacCheese,
    title: "Golden Mac & Cheese",
    description: "Creamy with a golden herbed crust"
  },
  {
    src: foodJerkChicken,
    title: "Herb-Roasted Chicken",
    description: "Our signature herb blend"
  },
  {
    src: buffetOutdoorTent,
    title: "Full Service Setup",
    description: "Beautiful outdoor event"
  },
  {
    src: dessertHolidayCupcakes,
    title: "Holiday Cupcakes",
    description: "Festive gourmet treats"
  }
];

export const MenuFoodGallery = () => {
  const staggered = useStaggeredAnimation({
    itemCount: galleryImages.length,
    staggerDelay: 100,
    baseDelay: 50,
    variant: 'fade-up'
  });

  return (
    <section className="py-10 sm:py-12 lg:py-16 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Camera className="h-5 w-5 text-ruby" />
            <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
              Our Signature Dishes
            </Badge>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold text-foreground">
            A Taste of What We Serve
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
            Authentic Southern cuisine crafted with passion
          </p>
        </div>

        {/* Image Grid */}
        <div 
          ref={staggered.ref}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className={staggered.getItemClassName(index)}
              style={staggered.getItemStyle(index)}
            >
              <Card className="group overflow-hidden border border-ruby/10 hover:border-ruby/30 transition-all duration-300">
                <div className="relative aspect-square overflow-hidden">
                  <OptimizedImage
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-3 bg-background">
                  <h3 className="text-sm font-medium text-foreground truncate">
                    {image.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {image.description}
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
