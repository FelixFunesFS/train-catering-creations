import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-size-200 rounded-md",
        className
      )}
      {...props}
    />
  )
}

interface ImageSkeletonProps {
  className?: string;
  aspectRatio?: string;
}

function ImageSkeleton({ className, aspectRatio = "aspect-square" }: ImageSkeletonProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg shadow-card hover:shadow-elegant transition-all duration-300", aspectRatio, className)}>
      <Skeleton className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
    </div>
  )
}

interface PageHeaderSkeletonProps {
  className?: string;
}

function PageHeaderSkeleton({ className }: PageHeaderSkeletonProps) {
  return (
    <div className={cn("text-center mb-12 sm:mb-16", className)}>
      <div className="flex justify-center mb-4">
        <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 mr-2" />
        <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 mx-2" />
        <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 ml-2" />
      </div>
      <Skeleton className="h-12 sm:h-16 w-80 max-w-full mx-auto mb-4 sm:mb-6" />
      <Skeleton className="w-16 sm:w-24 h-1 mx-auto mb-6 sm:mb-8" />
      <Skeleton className="h-6 w-96 max-w-full mx-auto mb-2" />
      <Skeleton className="h-6 w-80 max-w-full mx-auto" />
    </div>
  )
}

export { Skeleton, ImageSkeleton, PageHeaderSkeleton }