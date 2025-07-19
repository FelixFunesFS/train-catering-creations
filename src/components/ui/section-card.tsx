
import * as React from "react"
import { cn } from "@/lib/utils"

const SectionCard = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn(
      "py-4 sm:py-6 lg:py-8 bg-gradient-card shadow-elegant hover:shadow-elevated transition-all duration-200 rounded-lg mx-4 sm:mx-6 lg:mx-8 my-2 sm:my-3 lg:my-4",
      className
    )}
    {...props}
  />
))
SectionCard.displayName = "SectionCard"

export { SectionCard }
