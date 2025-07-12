import { Card, CardContent } from "@/components/ui/card";
import { GalleryImage } from "@/data/gallery/types";

interface ImageGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const ImageGrid = ({ images, onImageClick }: ImageGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-12">
      {images.map((image, index) => (
        <Card 
          key={index} 
          className="shadow-card hover:shadow-elegant transition-all duration-200 cursor-pointer group min-h-[280px] sm:min-h-[320px]"
          onClick={() => onImageClick(image.src)}
        >
          <CardContent className="p-0">
            <div className="relative overflow-hidden rounded-lg aspect-square min-h-[280px] sm:min-h-[320px]">
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  console.error(`Failed to load image: ${image.src}`, e);
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.alt = 'Image failed to load';
                }}
                onLoad={() => console.log(`Successfully loaded: ${image.src}`)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end">
                <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <h3 className="font-elegant font-semibold text-white contrast-150">{image.title}</h3>
                  <p className="text-sm text-white/90 contrast-150">{image.description}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};