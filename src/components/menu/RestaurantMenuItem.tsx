import React from 'react';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface EnhancedMenuItem {
  name: string;
  description?: string;
  price?: string;
  isPopular?: boolean;
  isNew?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isFeatured?: boolean;
  imageUrl?: string;
}

interface RestaurantMenuItemProps {
  item: EnhancedMenuItem;
  index: number;
  categoryType?: 'signature' | 'premium' | 'classic';
}

export const RestaurantMenuItem: React.FC<RestaurantMenuItemProps> = ({
  item,
  index,
  categoryType = 'classic'
}) => {
  const animationDelay = index * 0.1;

  return (
    <div 
      className={`
        group relative p-6 rounded-xl border border-border/50 
        bg-card/50 backdrop-blur-sm hover:bg-card/80
        transition-all duration-300 hover:border-primary/20
        ${item.isFeatured ? 'ring-1 ring-primary/20 bg-primary/5' : ''}
      `}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* Featured ribbon */}
      {item.isFeatured && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-primary text-primary-foreground shadow-lg">
            Chef's Special
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Optional thumbnail image */}
        {item.imageUrl && (
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
            <OptimizedImage
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Item header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className={`
                font-elegant text-lg leading-tight mb-1
                ${categoryType === 'signature' ? 'text-primary' : 'text-card-foreground'}
                group-hover:text-primary transition-colors
              `}>
                {item.name}
              </h4>
              
              {/* Badges row */}
              <div className="flex flex-wrap gap-1 mb-2">
                {item.isPopular && (
                  <Badge variant="secondary" className="text-xs bg-gold/10 text-gold-dark border-gold/20">
                    Popular
                  </Badge>
                )}
                {item.isNew && (
                  <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                    New
                  </Badge>
                )}
                {item.isVegetarian && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                    V
                  </Badge>
                )}
                {item.isGlutenFree && (
                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                    GF
                  </Badge>
                )}
                {item.isSpicy && (
                  <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                    🌶️
                  </Badge>
                )}
              </div>
            </div>

            {/* Price */}
            {item.price && (
              <div className="flex-shrink-0 ml-4">
                <span className={`
                  font-elegant text-lg font-semibold
                  ${categoryType === 'signature' ? 'text-primary' : 'text-card-foreground'}
                `}>
                  {item.price}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Decorative element for signature items */}
      {categoryType === 'signature' && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      )}
    </div>
  );
};