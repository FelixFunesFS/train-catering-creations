import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageSkeleton } from "./loading-skeleton";
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: "aspect-square" | "aspect-video" | "aspect-[4/3]" | "aspect-[3/2]" | "aspect-[5/4]" | "aspect-[5/3]" | "aspect-[3/4]" | "aspect-[4/5]";
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
  return;
};