import { GalleryImage } from "@/data/gallery/types";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface ImageGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const ImageGrid = ({ images, onImageClick }: ImageGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12">
      {images.map((image, index) => (
        <div 
          key={index} 
          className="shadow-card hover:shadow-elegant bg-card border-2 border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer group aspect-[5/4] rounded-lg overflow-hidden min-h-touch"
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
      ))}
    </div>
  );
};