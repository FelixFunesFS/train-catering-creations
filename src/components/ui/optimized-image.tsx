import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageSkeleton } from "./loading-skeleton";
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: "aspect-square" | "aspect-video" | "aspect-[4/3]" | "aspect-[3/2]" | "aspect-[5/4]" | "aspect-[5/3]" | "aspect-[3/4]" | "aspect-[4/5]";
  containerClassName?: string;
  priority?: boolean;
  enableVignette?: boolean;
  enableVividCool?: boolean;
  disableFilters?: boolean;
  onImageLoad?: () => void;
  onImageError?: () => void;
}
export const OptimizedImage = ({
  src,
  alt,
  aspectRatio = "aspect-square",
  containerClassName,
  className,
  priority = false,
  enableVignette = true,
  enableVividCool = true,
  disableFilters = false,
  onImageLoad,
  onImageError,
  ...props
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const handleLoad = () => {
    setIsLoading(false);
    onImageLoad?.();
  };
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onImageError?.();
  };
  // Determine filter classes
  const shouldApplyFilters = !disableFilters && (enableVignette || enableVividCool);
  const vignette = enableVignette && !disableFilters;
  const vividCool = enableVividCool && !disableFilters;
  
  const filterClasses = cn(
    vignette && vividCool && "image-enhanced",
    vignette && !vividCool && "image-vignette", 
    !vignette && vividCool && "image-vivid-cool"
  );

  return (
    <div className={cn("relative overflow-hidden", aspectRatio, filterClasses, containerClassName)}>
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <ImageSkeleton />
        </div>
      )}
      {hasError ? (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Failed to load image</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          style={{
            imageRendering: 'crisp-edges',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden'
          }}
          {...props}
        />
      )}
    </div>
  );
};