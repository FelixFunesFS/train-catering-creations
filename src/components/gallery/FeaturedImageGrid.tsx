import { GalleryImage } from "@/data/gallery/types";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface FeaturedImageGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const FeaturedImageGrid = ({ images, onImageClick }: FeaturedImageGridProps) => {
  // Sort images by quality and separate high-quality ones for featured display
  const sortedImages = [...images].sort((a, b) => b.quality - a.quality);
  const featuredImages = sortedImages.filter(img => img.quality >= 9).slice(0, 3);
  const regularImages = sortedImages.filter(img => !featuredImages.includes(img));

  return (
    <div className="space-y-4 mb-8 sm:mb-12">
      {/* Featured Images Section - Only on desktop */}
      {featuredImages.length > 0 && (
        <div className="hidden lg:grid lg:grid-cols-6 gap-4 mb-8">
          {featuredImages.map((image, index) => (
            <div 
              key={`featured-${index}`}
              className={`${
                index === 0 ? 'col-span-3 row-span-2' : 'col-span-3'
              } shadow-card hover:shadow-elegant bg-card border-2 border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer group rounded-lg overflow-hidden`}
              onClick={() => onImageClick(image.src)}
            >
              <div className="relative w-full h-full">
                <OptimizedImage
                  src={image.src}
                  alt={image.title}
                  aspectRatio={index === 0 ? "aspect-[4/3]" : "aspect-[5/4]"}
                  className="group-hover:scale-105 transition-transform duration-200"
                  priority={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end">
                  <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary/80 text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                        Premium
                      </span>
                      <span className="bg-background/20 px-2 py-1 rounded text-xs">
                        Quality {image.quality}/10
                      </span>
                    </div>
                    <h3 className="font-elegant font-semibold text-white text-lg mb-1">{image.title}</h3>
                    <p className="text-sm text-white/90">{image.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Regular Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {regularImages.map((image, index) => (
          <div 
            key={`regular-${index}`}
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
    </div>
  );
};