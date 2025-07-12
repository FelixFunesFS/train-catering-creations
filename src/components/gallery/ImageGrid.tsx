import { Card, CardContent } from "@/components/ui/card";
import { GalleryImage } from "@/data/gallery/types";

interface ImageGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const ImageGrid = ({ images, onImageClick }: ImageGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-12">
      {images.map((image, index) => (
        <Card 
          key={index} 
          className="shadow-card hover:shadow-elegant transition-shadow cursor-pointer group"
          onClick={() => onImageClick(image.src)}
        >
          <CardContent className="p-0">
            <div className="relative overflow-hidden rounded-lg aspect-square">
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  console.error(`Failed to load image: ${image.src}`, e);
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.alt = 'Image failed to load';
                }}
                onLoad={() => console.log(`Successfully loaded: ${image.src}`)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
                <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="font-elegant font-semibold">{image.title}</h3>
                  <p className="text-sm">{image.description}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};