import { GalleryImage } from "@/data/gallery/types";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { OptimizedImage } from "@/components/ui/optimized-image";
import Autoplay from "embla-carousel-autoplay";

interface GalleryCarouselProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const GalleryCarousel = ({ images, onImageClick }: GalleryCarouselProps) => {
  return (
    <div className="relative mb-8 sm:mb-12">
      <Carousel 
        opts={{
          align: "start",
          loop: true
        }} 
        plugins={[Autoplay({
          delay: 4000,
          stopOnInteraction: true
        })]} 
        className="w-full"
      >
        <CarouselContent className="-ml-1 gap-2">
          {images.map((image, index) => (
            <CarouselItem 
              key={index} 
              className="pl-1 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <div 
                className="group neumorphic-card-2 hover:neumorphic-card-3 p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 aspect-[5/4] min-h-touch"
                onClick={() => onImageClick(image.src)}
              >
                <div className="relative rounded-xl overflow-hidden">
                  <div className="aspect-[5/4]">
                    <img 
                      src={image.src} 
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading={index < 8 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-left">
                      <h3 className="text-white font-elegant font-semibold text-base sm:text-lg mb-1 sm:mb-2">
                        {image.title}
                      </h3>
                      <p className="text-white/90 text-xs sm:text-sm leading-tight">
                        {image.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};