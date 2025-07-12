import { Card, CardContent } from "@/components/ui/card";
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface ImageGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const ImageGrid = ({ images, onImageClick }: ImageGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 mb-12">
      {images.map((image, index) => (
        <div 
          key={index} 
          className="shadow-card hover:shadow-elegant bg-card border-2 border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer group min-h-[240px] sm:min-h-[280px] xl:min-h-[240px] rounded-lg overflow-hidden"
          onClick={() => onImageClick(image.src)}
        >
          <div className="relative min-h-[240px] sm:min-h-[280px] xl:min-h-[240px] group">
            <OptimizedImage
              src={image.src}
              alt={image.title}
              aspectRatio="aspect-[5/4]"
              className="group-hover:scale-105 brightness-105 contrast-105"
              onImageError={() => {
                console.error(`Failed to load image: ${image.src}`);
              }}
              onImageLoad={() => console.log(`Successfully loaded: ${image.src}`)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end">
              <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <h3 className="font-elegant font-semibold text-white contrast-150">{image.title}</h3>
                <p className="text-sm text-white/90 contrast-150">{image.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};