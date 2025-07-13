import { Eye, Calendar, Users } from "lucide-react";
import { GalleryImage } from "@/data/gallery/types";

interface ImagePreviewOverlayProps {
  image: GalleryImage;
  isVisible: boolean;
}

const getEventTypeIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'wedding':
      return '💒';
    case 'corporate':
      return '🏢';
    case 'formal':
      return '🎭';
    case 'buffet':
      return '🍽️';
    case 'desserts':
      return '🍰';
    case 'signature-dishes':
      return '⭐';
    case 'bbq':
      return '🔥';
    case 'family':
      return '👨‍👩‍👧‍👦';
    case 'grazing':
      return '🧀';
    default:
      return '🎉';
  }
};

const getCategoryDisplayName = (category: string) => {
  switch (category) {
    case 'signature-dishes':
      return 'Signature Dishes';
    case 'bbq':
      return 'BBQ Events';
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
};

export const ImagePreviewOverlay = ({ image, isVisible }: ImagePreviewOverlayProps) => {
  return (
    <div className={`
      absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent
      flex flex-col justify-end p-4 sm:p-6
      transition-all duration-300 ease-out
      ${isVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0'}
    `}>
      {/* Event type badge */}
      <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-xs font-medium border border-border/50">
        <span className="text-sm">{getEventTypeIcon(image.category)}</span>
        <span className="text-foreground/80">{getCategoryDisplayName(image.category)}</span>
      </div>

      {/* Quality badge for high-quality images */}
      {image.quality >= 8 && (
        <div className="absolute top-3 left-3 bg-gradient-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-semibold flex items-center gap-1">
          <span>✨</span>
          <span>Featured</span>
        </div>
      )}

      {/* Main content */}
      <div className="space-y-2">
        <h3 className="text-white font-bold text-lg sm:text-xl leading-tight">
          {image.title}
        </h3>
        
        <p className="text-white/90 text-sm sm:text-base leading-relaxed line-clamp-2">
          {image.description}
        </p>

        {/* Action hint */}
        <div className="flex items-center gap-2 text-white/70 text-sm mt-3">
          <Eye className="h-4 w-4" />
          <span>Click to view full size</span>
        </div>
      </div>

      {/* Hover effect indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
    </div>
  );
};