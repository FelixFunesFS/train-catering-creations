import { useState, useMemo } from "react";
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { 
  Search, 
  Filter, 
  X, 
  Star, 
  Heart,
  Sparkles,
  TrendingUp,
  Grid,
  BarChart3
} from "lucide-react";

interface GallerySearchInterfaceProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  qualityFilter: number;
  setQualityFilter: (quality: number) => void;
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const GallerySearchInterface = ({
  searchQuery,
  setSearchQuery,
  qualityFilter,
  setQualityFilter,
  images,
  onImageClick
}: GallerySearchInterfaceProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'quality' | 'title' | 'relevance'>('relevance');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'slide-up', delay: 0 },
    desktop: { variant: 'ios-spring', delay: 0 }
  });
  
  const { ref: resultsRef, isVisible: resultsVisible, variant: resultsVariant } = useScrollAnimation({ 
    delay: 200, 
    variant: 'slide-up',
    mobile: { variant: 'medium', delay: 100 },
    desktop: { variant: 'elastic', delay: 200 }
  });

  // Get unique categories
  const allCategories = useMemo(() => {
    const categories = new Set(images.map(img => img.category));
    return Array.from(categories);
  }, [images]);

  // Filter and sort images
  const filteredImages = useMemo(() => {
    let filtered = [...images];
    
    // Text search
    if (searchQuery) {
      filtered = filtered.filter(img => 
        img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Quality filter
    if (qualityFilter > 0) {
      filtered = filtered.filter(img => img.quality >= qualityFilter);
    }
    
    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(img => selectedCategories.includes(img.category));
    }
    
    // Sort
    switch (sortBy) {
      case 'quality':
        filtered.sort((a, b) => b.quality - a.quality);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'relevance':
        // Simple relevance based on search query matches
        if (searchQuery) {
          filtered.sort((a, b) => {
            const aScore = (a.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 0) +
                          (a.description.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0);
            const bScore = (b.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 0) +
                          (b.description.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0);
            return bScore - aScore;
          });
        }
        break;
    }
    
    return filtered;
  }, [images, searchQuery, qualityFilter, selectedCategories, sortBy]);

  // Search analytics
  const searchStats = useMemo(() => {
    const totalImages = images.length;
    const foundImages = filteredImages.length;
    const avgQuality = filteredImages.length > 0 
      ? Math.round(filteredImages.reduce((sum, img) => sum + img.quality, 0) / filteredImages.length * 10) / 10
      : 0;
    const premiumCount = filteredImages.filter(img => img.quality >= 8).length;
    
    return {
      total: totalImages,
      found: foundImages,
      avgQuality,
      premium: premiumCount,
      coverage: Math.round((foundImages / totalImages) * 100)
    };
  }, [images, filteredImages]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

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

  const clearFilters = () => {
    setSearchQuery("");
    setQualityFilter(0);
    setSelectedCategories([]);
    setSortBy('relevance');
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'wedding': 'Weddings',
      'formal': 'Formal Events',
      'corporate': 'Corporate',
      'desserts': 'Desserts',
      'buffet': 'Buffet',
      'family': 'Family',
    };
    return categoryMap[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    return <Sparkles className="h-3 w-3" />;
  };

  return (
    <div>
      {/* Search Header */}
      <div 
        ref={headerRef}
        className={`mb-8 ${useAnimationClass(headerVariant, headerVisible)}`}
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-elegant font-bold mb-2">
            Smart Gallery Search
          </h2>
          <p className="text-muted-foreground text-lg">
            Find exactly what you're looking for with intelligent filters
          </p>
        </div>
        
        {/* Main Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by title, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 h-12 text-base"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Search Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-card rounded-lg border border-border/10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Grid className="h-4 w-4 text-primary" />
              <span className="font-bold text-lg">{searchStats.found}</span>
            </div>
            <span className="text-xs text-muted-foreground">Found</span>
          </div>
          
          <div className="text-center p-3 bg-card rounded-lg border border-border/10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="h-4 w-4 text-gold" />
              <span className="font-bold text-lg">{searchStats.avgQuality}</span>
            </div>
            <span className="text-xs text-muted-foreground">Avg Quality</span>
          </div>
          
          <div className="text-center p-3 bg-card rounded-lg border border-border/10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-bold text-lg">{searchStats.premium}</span>
            </div>
            <span className="text-xs text-muted-foreground">Premium</span>
          </div>
          
          <div className="text-center p-3 bg-card rounded-lg border border-border/10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-accent-foreground" />
              <span className="font-bold text-lg">{searchStats.coverage}%</span>
            </div>
            <span className="text-xs text-muted-foreground">Coverage</span>
          </div>
        </div>
        
        {/* Filters Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Advanced Filters
          </Button>
          
          {(searchQuery || qualityFilter > 0 || selectedCategories.length > 0) && (
            <Button variant="ghost" onClick={clearFilters} className="gap-2 text-muted-foreground">
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
        
        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="mt-6 p-6 bg-muted/30 rounded-lg border border-border/10 space-y-6">
            {/* Quality Filter */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Minimum Quality: {qualityFilter}/10
              </label>
              <Slider
                value={[qualityFilter]}
                onValueChange={(value) => setQualityFilter(value[0])}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-3">Categories</label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <label htmlFor={category} className="text-sm flex items-center gap-1">
                      {getCategoryIcon(category)}
                      {getCategoryDisplayName(category)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-3">Sort By</label>
              <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
      
      {/* Results */}
      <div 
        ref={resultsRef}
        className={`${useAnimationClass(resultsVariant, resultsVisible)}`}
      >
        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredImages.map((image, index) => {
              const isFavorite = favorites.has(image.src);
              
              return (
                <div
                  key={image.src}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-card border border-border/10 hover:shadow-elevated transition-all duration-300 cursor-pointer"
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
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-elegant font-semibold text-white text-base line-clamp-1">
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
                    
                    <p className="text-white/80 text-sm line-clamp-2 mb-3">
                      {image.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge className="bg-white/10 text-white border-white/20">
                        {getCategoryDisplayName(image.category)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-gold fill-gold" />
                        <span className="text-white text-xs">{image.quality}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quality indicator */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Badge className={`text-xs ${
                      image.quality >= 8 
                        ? 'bg-primary/20 text-white border-primary/30' 
                        : 'bg-white/10 text-white border-white/20'
                    }`}>
                      {image.quality >= 8 ? 'Premium' : `${image.quality}/10`}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-elegant font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or filters
            </p>
            <Button onClick={clearFilters} className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Clear Filters & Show All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};