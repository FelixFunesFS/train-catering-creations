import * as React from "react"
import { cn } from "@/lib/utils"

const SectionCard = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn(
      "py-section sm:py-section-sm lg:py-section-lg bg-gradient-card shadow-elegant hover:shadow-glow transition-all duration-200 rounded-lg mx-4 sm:mx-6 lg:mx-8 my-section sm:my-section-sm",
      className
    )}
    {...props}
  />
))
SectionCard.displayName = "SectionCard"

export { SectionCard }