import { GalleryImage } from "@/data/gallery/types";

interface ImageGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const ImageGrid = ({ images, onImageClick }: ImageGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0.5 mb-12">
      {images.map((image, index) => (
        <div 
          key={index} 
          className="shadow-card hover:shadow-elegant bg-card border-2 border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer group aspect-[5/4] rounded-lg overflow-hidden"
          onClick={() => onImageClick(image.src)}
        >
          <div className="relative w-full h-full">
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end">
              <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <h3 className="font-elegant font-semibold text-white">{image.title}</h3>
                <p className="text-sm text-white/90">{image.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};