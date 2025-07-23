
import * as React from "react"
import { cn } from "@/lib/utils"
import { FloatingCard } from "./floating-card"
import { OptimizedImage } from "./optimized-image"

interface OptimizedFloatingImageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image source */
  src: string
  /** Image alt text */
  alt: string
  /** Image title */
  title?: string
  /** Image description */
  description?: string
  /** Aspect ratio class */
  aspectRatio?: "aspect-square" | "aspect-video" | "aspect-[4/3]" | "aspect-[3/2]" | "aspect-[5/4]" | "aspect-[5/3]" | "aspect-[3/4]" | "aspect-[4/5]"
  /** Whether to show overlay content on hover */
  showOverlay?: boolean
  /** Loading priority for above-the-fold images */
  priority?: boolean
  /** Floating intensity */
  variant?: "subtle" | "medium" | "dramatic"
  /** Click handler */
  onImageClick?: () => void
}

const OptimizedFloatingImage = React.forwardRef<HTMLDivElement, OptimizedFloatingImageProps>(({
  className,
  src,
  alt,
  title,
  description,
  aspectRatio = "aspect-[4/3]",
  showOverlay = true,
  priority = false,
  variant = "medium",
  onImageClick,
  ...props
}, ref) => {
  const hasClickHandler = !!onImageClick
  
  return (
    <FloatingCard
      ref={ref}
      variant={variant}
      restingShadow="card"
      hoverShadow="elegant"
      highlightBorder
      className={cn(
        "overflow-hidden group bg-gradient-card rounded-xl transition-all duration-300",
        "p-2 sm:p-3 lg:p-4",
        hasClickHandler && "cursor-pointer active:scale-95 sm:active:scale-98",
        "border border-border/20 hover:border-primary/30",
        "shadow-card hover:shadow-elevated",
        "transform hover:scale-[1.02] sm:hover:scale-[1.01]",
        // Enhanced isolation and z-index management
        "isolate relative",
        className
      )}
      onClick={onImageClick}
      {...props}
    >
      <div className={cn("relative rounded-lg overflow-hidden", aspectRatio)}>
        <OptimizedImage
          src={src}
          alt={alt}
          aspectRatio={aspectRatio}
          className="group-hover:scale-105 transition-transform duration-300"
          priority={priority}
        />
        
        {showOverlay && (title || description) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div className="p-2 sm:p-3 lg:p-4 text-white w-full">
              {title && (
                <h3 className="font-elegant font-semibold text-white text-sm sm:text-base lg:text-lg mb-1 leading-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs sm:text-sm text-white/90 line-clamp-2 leading-tight">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </FloatingCard>
  )
})

OptimizedFloatingImage.displayName = "OptimizedFloatingImage"

export { OptimizedFloatingImage }
