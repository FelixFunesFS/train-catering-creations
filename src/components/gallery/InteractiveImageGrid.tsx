import { useState, useEffect, useMemo } from "react";
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { 
  Grid3X3, 
  List, 
  LayoutGrid, 
  Filter, 
  SortAsc, 
  Star,
  Heart,
  Search,
  ArrowLeft
} from "lucide-react";

interface InteractiveImageGridProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
  category: string | null;
}

type ViewMode = 'masonry' | 'grid' | 'list';
type SortOption = 'quality' | 'title' | 'recent';
type FilterOption = 'all' | 'premium' | 'favorites';

export const InteractiveImageGrid = ({
  images,
  onImageClick,
  category
}: InteractiveImageGridProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [sortOption, setSortOption] = useState<SortOption>('quality');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  const isMobile = useIsMobile();
  
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'slide-up', delay: 0 },
    desktop: { variant: 'ios-spring', delay: 0 }
  });
  
  const { ref: gridRef, isVisible: gridVisible, variant: gridVariant } = useScrollAnimation({ 
    delay: 200, 
    variant: 'slide-up',
    mobile: { variant: 'medium', delay: 100 },
    desktop: { variant: 'elastic', delay: 200 }
  });

  // Process and filter images
  const processedImages = useMemo(() => {
    let filtered = [...images];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(img => 
        img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply quality filter
    switch (filterOption) {
      case 'premium':
        filtered = filtered.filter(img => img.quality >= 8);
        break;
      case 'favorites':
        filtered = filtered.filter(img => favorites.has(img.src));
        break;
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'quality':
        filtered.sort((a, b) => b.quality - a.quality);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'recent':
        // For demo purposes, randomize order
        filtered.sort(() => Math.random() - 0.5);
        break;
    }
    
    return filtered;
  }, [images, searchQuery, filterOption, sortOption, favorites]);

  const toggleFavorite = (imageSrc: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(imageSrc)) {
        newFavorites.delete(imageSrc);
      } else {
        newFavorites.add(imageSrc);
      }
      return newFavorites;
    });
  };

  const getGridClasses = () => {
    switch (viewMode) {
      case 'masonry':
        return isMobile 
          ? "columns-1 sm:columns-2 gap-3 sm:gap-4" 
          : "columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 lg:gap-5";
      case 'grid':
        return isMobile
          ? "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
          : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5";
      case 'list':
        return "space-y-4";
    }
  };

  const getCategoryDisplayName = (cat: string) => {
    const categoryMap: Record<string, string> = {
      'wedding': 'Wedding Celebrations',
      'formal': 'Formal & Black Tie Events',
      'corporate': 'Corporate Events',
      'desserts': 'Artisan Desserts',
      'buffet': 'Buffet Service',
      'family': 'Family Gatherings',
    };
    return categoryMap[cat] || cat;
  };

  const ImageCard = ({ image, index }: { image: GalleryImage; index: number }) => {
    const isFavorite = favorites.has(image.src);
    
    if (viewMode === 'list') {
      return (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border border-border/10 hover:shadow-elevated transition-all duration-300">
          <div className="flex-shrink-0 w-full sm:w-32 h-32">
            <OptimizedImage
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              containerClassName="w-full h-full rounded-lg overflow-hidden"
              onClick={() => onImageClick(image.src)}
            />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-elegant font-semibold text-lg">{image.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(image.src)}
                className={`${isFavorite ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
              >
                <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
              </Button>
            </div>
            
            <p className="text-muted-foreground text-sm line-clamp-2">
              {image.description}
            </p>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Quality: {image.quality}/10
              </Badge>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${
                      i < (image.quality / 2) ? 'text-gold fill-gold' : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        className={`group relative ${viewMode === 'masonry' ? 'break-inside-avoid mb-3 sm:mb-4' : 'aspect-square'} rounded-xl overflow-hidden bg-card border border-border/10 hover:shadow-elevated transition-all duration-300 cursor-pointer`}
        onClick={() => onImageClick(image.src)}
      >
        <OptimizedImage
          src={image.src}
          alt={image.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          containerClassName="w-full h-full"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-elegant font-semibold text-white text-sm sm:text-base line-clamp-1">
              {image.title}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(image.src);
              }}
              className={`${isFavorite ? 'text-primary' : 'text-white/60'} hover:text-white p-1`}
            >
              <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
            </Button>
          </div>
          
          <p className="text-white/80 text-xs sm:text-sm line-clamp-2 mb-2">
            {image.description}
          </p>
          
          <div className="flex items-center justify-between">
            <Badge className="bg-white/10 text-white border-white/20 text-xs">
              {image.quality}/10
            </Badge>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.round(image.quality / 2) }).map((_, i) => (
                <Star key={i} className="h-3 w-3 text-gold fill-gold" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div 
        ref={headerRef}
        className={`mb-6 sm:mb-8 ${useAnimationClass(headerVariant, headerVisible)}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-elegant font-bold">
              {category ? getCategoryDisplayName(category) : 'All Images'}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {processedImages.length} images found
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {!isMobile && "Filters"}
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border border-border/10">
            {/* View Mode */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'masonry' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('masonry')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Sort */}
            <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quality">Quality</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Filter */}
            <Select value={filterOption} onValueChange={(value: FilterOption) => setFilterOption(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Images</SelectItem>
                <SelectItem value="premium">Premium Only</SelectItem>
                <SelectItem value="favorites">Favorites</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Stats */}
            <div className="text-sm text-muted-foreground">
              <div>Total: {processedImages.length}</div>
              <div>Favorites: {favorites.size}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Grid */}
      <div 
        ref={gridRef}
        className={`${useAnimationClass(gridVariant, gridVisible)}`}
      >
        {processedImages.length > 0 ? (
          <div className={getGridClasses()}>
            {processedImages.map((image, index) => (
              <ImageCard key={image.src} image={image} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No images match your filters.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setFilterOption('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};