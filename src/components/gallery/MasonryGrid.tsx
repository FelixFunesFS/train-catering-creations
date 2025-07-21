
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface MasonryGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const MasonryGrid = ({ images, onImageClick }: MasonryGridProps) => {
  // Sort images by quality to prioritize high-quality ones for larger display
  const sortedImages = [...images].sort((a, b) => b.quality - a.quality);
  
  // Create responsive column counts
  const getColumnCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1280) return 4; // xl
      if (window.innerWidth >= 1024) return 3; // lg
      if (window.innerWidth >= 768) return 2;  // md
    }
    return 2; // sm and below
  };

  const columnCount = getColumnCount();
  const columns: GalleryImage[][] = Array(columnCount).fill(null).map(() => []);
  
  // Distribute images across columns with smart sizing
  sortedImages.forEach((image, index) => {
    const columnIndex = index % columns.length;
    columns[columnIndex].push(image);
  });

  const getSizeClasses = (image: GalleryImage, imageIndex: number, columnIndex: number) => {
    // Make high-quality images larger and some images span 2 columns on larger screens
    const isHighQuality = image.quality >= 9;
    const shouldSpanColumns = isHighQuality && columnIndex === 0 && imageIndex < 2 && columnCount >= 3;
    const isLargeImage = image.quality >= 8 && (imageIndex + columnIndex) % 7 === 0;
    
    if (shouldSpanColumns) {
      return {
        containerClass: "col-span-2",
        aspectRatio: "aspect-[16/10]"
      };
    } else if (isLargeImage) {
      return {
        containerClass: "",
        aspectRatio: "aspect-[4/6]"
      };
    } else {
      // Vary aspect ratios for visual interest
      const aspectRatios = ["aspect-[4/5]", "aspect-[5/6]", "aspect-[3/4]", "aspect-[5/4]"];
      const aspectRatio = aspectRatios[imageIndex % aspectRatios.length];
      return {
        containerClass: "",
        aspectRatio
      };
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12 auto-rows-max">
      {sortedImages.map((image, index) => {
        const columnIndex = index % columnCount;
        const imageIndex = Math.floor(index / columnCount);
        const { containerClass, aspectRatio } = getSizeClasses(image, imageIndex, columnIndex);
        
        return (
          <div 
            key={`masonry-${index}`}
            className={`group neumorphic-card-2 hover:neumorphic-card-3 p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 ${containerClass}`}
            onClick={() => onImageClick(image.src)}
          >
            <div className="relative rounded-xl overflow-hidden">
              <div className={aspectRatio}>
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
        );
      })}
    </div>
  );
};
