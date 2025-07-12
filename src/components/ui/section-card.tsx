import * as React from "react"
import { cn } from "@/lib/utils"

const SectionCard = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn(
      "py-4 md:py-6 lg:py-8 bg-gradient-card shadow-card rounded-lg mx-4 sm:mx-6 lg:mx-8 my-1 md:my-2 lg:my-3",
      className
    )}
    {...props}
  />
))
SectionCard.displayName = "SectionCard"

export { SectionCard }