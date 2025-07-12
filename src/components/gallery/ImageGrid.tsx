import { Card, CardContent } from "@/components/ui/card";
import { GalleryImage } from "@/data/gallery/types";

interface ImageGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const ImageGrid = ({ images, onImageClick }: ImageGridProps) => {
  return (
    <div className="grid grid-auto-fit gap-2 lg:gap-3 mb-12">
      {images.map((image, index) => (
        <Card 
          key={index} 
          className="card-interactive shadow-card cursor-pointer group overflow-hidden animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => onImageClick(image.src)}
        >
          <CardContent className="!p-0">
            <div className="relative overflow-hidden aspect-square">
              <img
                src={image.src}
                alt={image.title}
                className="image-card group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  console.error(`Failed to load image: ${image.src}`, e);
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.alt = 'Image failed to load';
                }}
                onLoad={() => console.log(`Successfully loaded: ${image.src}`)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                <div className="p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-elegant font-semibold text-lg mb-1">{image.title}</h3>
                  <p className="text-sm opacity-90">{image.description}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};