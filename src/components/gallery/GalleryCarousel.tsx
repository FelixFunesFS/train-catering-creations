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
                className="shadow-elegant hover:shadow-glow bg-gradient-card border-2 border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer group aspect-[5/4] rounded-lg overflow-hidden min-h-touch"
                onClick={() => onImageClick(image.src)}
              >
                <div className="relative w-full h-full">
                  <OptimizedImage
                    src={image.src}
                    alt={image.title}
                    aspectRatio="aspect-[5/4]"
                    className="group-hover:scale-105 transition-transform duration-200"
                    priority={index < 8}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end">
                    <div className="p-2 sm:p-3 md:p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <h3 className="font-elegant font-semibold text-white text-xs sm:text-sm md:text-base">{image.title}</h3>
                      <p className="text-xs sm:text-sm text-white/90 hidden sm:block">{image.description}</p>
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