import * as React from "react"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

export type FloatingCardVariant = "subtle" | "medium" | "dramatic" | "interactive" | "none"
export type FloatingCardShadow = "card" | "elegant" | "elevated" | "glow"

interface FloatingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The floating effect intensity */
  variant?: FloatingCardVariant
  /** The shadow level when not hovering */
  restingShadow?: FloatingCardShadow
  /** The shadow level when hovering */
  hoverShadow?: FloatingCardShadow
  /** Whether to add a border highlight on hover */
  highlightBorder?: boolean
  /** Custom lift amount in pixels (overrides variant) */
  liftAmount?: number
  /** Custom scale amount (overrides variant) */
  scaleAmount?: number
  /** Whether this should render as a child component */
  asChild?: boolean
  /** Disable floating effects (respects reduced motion automatically) */
  disabled?: boolean
}

const FloatingCard = React.forwardRef<HTMLDivElement, FloatingCardProps>(({
  className,
  variant = "medium",
  restingShadow = "card",
  hoverShadow = "elegant",
  highlightBorder = false,
  liftAmount,
  scaleAmount,
  asChild = false,
  disabled = false,
  children,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "div"
  
  // Variant-based lift and scale amounts
  const getVariantStyles = () => {
    if (disabled || variant === "none") return {}
    
    const variants = {
      subtle: { lift: 2, scale: 1.005 },
      medium: { lift: 4, scale: 1.01 },
      dramatic: { lift: 8, scale: 1.02 },
      interactive: { lift: 6, scale: 1.015 }
    }
    
    const { lift, scale } = variants[variant]
    
    return {
      "--lift-amount": liftAmount ? `${liftAmount}px` : `${lift}px`,
      "--scale-amount": scaleAmount || scale
    } as React.CSSProperties
  }
  
  const shadowClasses = {
    card: "shadow-card",
    elegant: "shadow-elegant", 
    elevated: "shadow-elevated",
    glow: "shadow-glow"
  }
  
  const baseClasses = [
    // Performance optimizations
    "will-change-transform",
    "transform-gpu",
    // Base styling
    "transition-all duration-250 ease-out",
    "rounded-lg",
    // Resting shadow
    shadowClasses[restingShadow],
    // Base transform for hardware acceleration
    "translate-z-0"
  ]
  
  const hoverClasses = !disabled && variant !== "none" ? [
    // Hover transform with CSS custom properties
    "hover:translate-y-[calc(-1*var(--lift-amount))]",
    "hover:scale-[var(--scale-amount)]",
    // Hover shadow
    `hover:${shadowClasses[hoverShadow]}`,
    // Border highlight
    highlightBorder && "hover:border-primary/20",
    // Focus handling
    "focus-visible:translate-y-[calc(-1*var(--lift-amount))]",
    "focus-visible:scale-[var(--scale-amount)]",
    `focus-visible:${shadowClasses[hoverShadow]}`,
    highlightBorder && "focus-visible:border-primary/20"
  ].filter(Boolean) : []
  
  return (
    <Comp
      ref={ref}
      className={cn(
        ...baseClasses,
        ...hoverClasses,
        // Reduced motion support - disable transforms but keep shadow changes
        "motion-reduce:transition-shadow motion-reduce:hover:transform-none motion-reduce:focus-visible:transform-none",
        className
      )}
      style={getVariantStyles()}
      {...props}
    >
      {children}
    </Comp>
  )
})

FloatingCard.displayName = "FloatingCard"

// Convenience components for common patterns
const FloatingImageCard = React.forwardRef<HTMLDivElement, FloatingCardProps>(
  ({ className, ...props }, ref) => (
    <FloatingCard
      ref={ref}
      variant="medium"
      restingShadow="card"
      hoverShadow="elegant"
      highlightBorder
      className={cn("overflow-hidden cursor-pointer", className)}
      {...props}
    />
  )
)

FloatingImageCard.displayName = "FloatingImageCard"

const FloatingServiceCard = React.forwardRef<HTMLDivElement, FloatingCardProps>(
  ({ className, ...props }, ref) => (
    <FloatingCard
      ref={ref}
      variant="subtle"
      restingShadow="card"
      hoverShadow="elegant"
      className={cn("bg-card border border-border p-6", className)}
      {...props}
    />
  )
)

FloatingServiceCard.displayName = "FloatingServiceCard"

const FloatingCTACard = React.forwardRef<HTMLDivElement, FloatingCardProps>(
  ({ className, ...props }, ref) => (
    <FloatingCard
      ref={ref}
      variant="dramatic"
      restingShadow="elegant"
      hoverShadow="glow"
      highlightBorder
      className={cn("bg-gradient-card border border-border", className)}
      {...props}
    />
  )
)

FloatingCTACard.displayName = "FloatingCTACard"

export { 
  FloatingCard, 
  FloatingImageCard, 
  FloatingServiceCard, 
  FloatingCTACard
}
