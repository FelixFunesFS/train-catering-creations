import { GalleryImage } from "@/data/gallery/types";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface MasonryGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const MasonryGrid = ({ images, onImageClick }: MasonryGridProps) => {
  // Create columns for masonry layout
  const columns: GalleryImage[][] = [[], [], [], [], []];
  
  // Distribute images across columns
  images.forEach((image, index) => {
    const columnIndex = index % columns.length;
    columns[columnIndex].push(image);
  });

  return (
    <div className="hidden sm:flex gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12">
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="flex-1 space-y-2 sm:space-y-3 md:space-y-4">
          {column.map((image, imageIndex) => {
            // Vary the aspect ratios for more visual interest
            const aspectRatios = ["aspect-[4/5]", "aspect-[5/6]", "aspect-[3/4]", "aspect-[4/3]", "aspect-[5/4]"];
            const aspectRatio = aspectRatios[imageIndex % aspectRatios.length];
            
            return (
              <div 
                key={`masonry-${columnIndex}-${imageIndex}`}
                className="shadow-card hover:shadow-elegant bg-card border-2 border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer group rounded-lg overflow-hidden"
                onClick={() => onImageClick(image.src)}
              >
                <div className="relative w-full">
                  <OptimizedImage
                    src={image.src}
                    alt={image.title}
                    aspectRatio={aspectRatio as any}
                    className="group-hover:scale-105 transition-transform duration-200"
                    priority={columnIndex === 0 && imageIndex < 2}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end">
                    <div className="p-3 md:p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex items-center gap-2 mb-1">
                        {image.quality >= 8 && (
                          <span className="bg-primary/80 text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                            {image.quality >= 9 ? 'Premium' : 'High Quality'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-elegant font-semibold text-white text-sm md:text-base">{image.title}</h3>
                      <p className="text-xs md:text-sm text-white/90 hidden md:block">{image.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};