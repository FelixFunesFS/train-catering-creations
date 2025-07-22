
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedFloatingImage } from "@/components/ui/optimized-floating-image";

interface ImageGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const ImageGrid = ({ images, onImageClick }: ImageGridProps) => {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4 lg:gap-5 mb-8 sm:mb-12 px-1 sm:px-0">
      {images.map((image, index) => (
        <OptimizedFloatingImage
          key={index}
          src={image.src}
          alt={image.title}
          title={image.title}
          description={image.description}
          aspectRatio={index % 4 === 0 ? "aspect-[4/5]" : index % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}
          variant="medium"
          priority={index < 6}
          onImageClick={() => onImageClick(image.src)}
          className="min-h-[44px] w-full"
        />
      ))}
    </div>
  );
};
