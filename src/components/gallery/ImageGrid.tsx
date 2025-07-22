
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedFloatingImage } from "@/components/ui/optimized-floating-image";

interface ImageGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const ImageGrid = ({ images, onImageClick }: ImageGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12">
      {images.map((image, index) => (
        <OptimizedFloatingImage
          key={index}
          src={image.src}
          alt={image.title}
          title={image.title}
          description={image.description}
          aspectRatio="aspect-[5/4]"
          variant="medium"
          priority={index < 8}
          onImageClick={() => onImageClick(image.src)}
          className="min-h-touch"
        />
      ))}
    </div>
  );
};
