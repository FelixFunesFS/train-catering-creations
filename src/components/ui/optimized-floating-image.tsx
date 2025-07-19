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
  aspectRatio?: "aspect-square" | "aspect-video" | "aspect-[4/3]" | "aspect-[3/2]" | "aspect-[5/4]" | "aspect-[5/3]" | "aspect-[3/4]"
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
        "overflow-hidden group",
        hasClickHandler && "cursor-pointer",
        className
      )}
      onClick={onImageClick}
      {...props}
    >
      <div className={cn("relative", aspectRatio)}>
        <OptimizedImage
          src={src}
          alt={alt}
          aspectRatio={aspectRatio}
          className="group-hover:scale-105 transition-transform duration-250"
          priority={priority}
        />
        
        {showOverlay && (title || description) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-end">
            <div className="p-3 md:p-4 text-white">
              {title && (
                <h3 className="font-elegant font-semibold text-white text-sm md:text-base mb-1">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs md:text-sm text-white/90 line-clamp-2">
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