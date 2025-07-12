import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageSkeleton } from "./loading-skeleton";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: "aspect-square" | "aspect-video" | "aspect-[4/3]" | "aspect-[3/2]" | "aspect-[5/4]" | "aspect-[5/3]";
  containerClassName?: string;
  priority?: boolean;
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

  return (
    <div className={cn("relative overflow-hidden", aspectRatio, containerClassName)}>
      {isLoading && (
        <ImageSkeleton aspectRatio={aspectRatio} className="absolute inset-0" />
      )}
      
      {hasError ? (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Image failed to load</div>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-all duration-200",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          loading={priority ? "eager" : "lazy"}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
};