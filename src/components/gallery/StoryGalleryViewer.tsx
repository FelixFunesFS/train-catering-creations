import { useState, useEffect } from "react";
import { GalleryImage } from "@/data/gallery/types";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  Share2, 
  Heart,
  Maximize2,
  ArrowLeft,
  Sparkles
} from "lucide-react";

interface StoryGalleryViewerProps {
  images: GalleryImage[];
  category: string;
  onImageClick: (imageSrc: string) => void;
  onCategoryChange: (category: string | null) => void;
}

export const StoryGalleryViewer = ({
  images,
  category,
  onImageClick,
  onCategoryChange
}: StoryGalleryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const isMobile = useIsMobile();
  const currentImage = images[currentIndex];
  const totalImages = images.length;
  const progressPercentage = ((currentIndex + 1) / totalImages) * 100;
  
  const { ref: contentRef, isVisible: contentVisible, variant: contentVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'slide-up', delay: 0 },
    desktop: { variant: 'ios-spring', delay: 0 }
  });

  // Auto-advance functionality
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentIndex(current => {
            if (current >= totalImages - 1) {
              setIsPlaying(false);
              return current;
            }
            return current + 1;
          });
          return 0;
        }
        return prev + 2; // Increment every 100ms for smooth progress
      });
    }, 100);
    
    return () => clearInterval(timer);
  }, [isPlaying, totalImages]);

  // Reset progress when changing images manually
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : totalImages - 1);
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % totalImages);
    setProgress(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
    if (!isPlaying) {
      setProgress(0);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setProgress(0);
    setIsPlaying(true);
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

  const handleShare = async () => {
    if (navigator.share && currentImage) {
      try {
        await navigator.share({
          title: currentImage.title,
          text: currentImage.description,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
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

  if (!currentImage || totalImages === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No images found for this category.</p>
        <Button 
          variant="outline" 
          onClick={() => onCategoryChange(null)}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div 
      ref={contentRef}
      className={`${useAnimationClass(contentVariant, contentVisible)}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCategoryChange(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div>
            <h2 className="text-xl sm:text-2xl font-elegant font-bold">
              {getCategoryDisplayName(category)}
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1} of {totalImages} images
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {!isMobile && "Restart"}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs text-muted-foreground">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* Main Story Container */}
      <div className="relative">
        {isMobile ? (
          // Mobile: Full-width story format
          <div className="relative h-[70vh] rounded-xl overflow-hidden">
            <OptimizedImage
              src={currentImage.src}
              alt={currentImage.title}
              className="w-full h-full object-cover"
              containerClassName="w-full h-full"
              priority
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-navy-dark/20" />
            
            {/* Progress bar for current image */}
            {isPlaying && (
              <div className="absolute top-4 left-4 right-4">
                <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Navigation areas */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 flex items-center justify-start pl-4" onClick={handlePrevious}>
                <ChevronLeft className="h-8 w-8 text-white/60" />
              </div>
              <div className="flex-1" />
              <div className="flex-1 flex items-center justify-end pr-4" onClick={handleNext}>
                <ChevronRight className="h-8 w-8 text-white/60" />
              </div>
            </div>
            
            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-2">
                {currentImage.quality >= 8 && (
                  <Badge className="bg-primary/20 text-white border-primary/20 gap-1">
                    <Sparkles className="h-3 w-3" />
                    Featured
                  </Badge>
                )}
                <Badge className="bg-white/10 text-white border-white/20">
                  {category}
                </Badge>
              </div>
              
              <h3 className="text-xl font-elegant font-bold text-white mb-2">
                {currentImage.title}
              </h3>
              <p className="text-white/80 text-sm mb-4">
                {currentImage.description}
              </p>
              
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="glass-white"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant={favorites.has(currentImage.src) ? "default" : "glass-white"}
                  onClick={() => toggleFavorite(currentImage.src)}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="glass-white"
                  onClick={() => onImageClick(currentImage.src)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="glass-white"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Desktop: Split layout
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image */}
            <div className="lg:col-span-2">
              <div className="relative h-96 lg:h-[600px] rounded-xl overflow-hidden">
                <OptimizedImage
                  src={currentImage.src}
                  alt={currentImage.title}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  containerClassName="w-full h-full"
                  onClick={() => onImageClick(currentImage.src)}
                  priority
                />
                
                {/* Progress overlay */}
                {isPlaying && (
                  <div className="absolute top-4 left-4 right-4">
                    <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Navigation */}
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <Button
                    variant="glass-white"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="absolute inset-y-0 right-4 flex items-center">
                  <Button
                    variant="glass-white"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentIndex === totalImages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Details */}
            <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {currentImage.quality >= 8 && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                    <Sparkles className="h-3 w-3" />
                    Featured
                  </Badge>
                )}
                <Badge variant="outline">
                  {category}
                </Badge>
              </div>
                
                <h3 className="text-2xl font-elegant font-bold mb-3">
                  {currentImage.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {currentImage.description}
                </p>
              </div>
              
              {/* Controls */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={togglePlayPause}
                    className="flex-1 gap-2"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? 'Pause Story' : 'Play Story'}
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFavorite(currentImage.src)}
                    className={favorites.has(currentImage.src) ? 'bg-primary/10 text-primary' : ''}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onImageClick(currentImage.src)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Image thumbnails */}
              <div>
                <h4 className="font-semibold mb-3">Other Images in {getCategoryDisplayName(category)}</h4>
                <div className="grid grid-cols-3 gap-2">
                  {images.slice(0, 6).map((image, index) => (
                    <div
                      key={image.src}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                        index === currentIndex 
                          ? 'ring-2 ring-primary ring-offset-2' 
                          : 'hover:scale-105'
                      }`}
                      onClick={() => setCurrentIndex(index)}
                    >
                      <OptimizedImage
                        src={image.src}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};