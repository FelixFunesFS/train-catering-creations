import * as React from "react"
import { cn } from "@/lib/utils"

const SectionCard = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn(
      "py-8 md:py-12 lg:py-16 bg-gradient-card shadow-card rounded-lg mx-4 sm:mx-6 lg:mx-8 my-4",
      className
    )}
    {...props}
  />
))
SectionCard.displayName = "SectionCard"

export { SectionCard }