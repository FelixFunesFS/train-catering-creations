import * as React from "react"
import { cn } from "@/lib/utils"

const SectionCard = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn(
      "py-6 md:py-8 lg:py-10 bg-gradient-card shadow-card rounded-lg mx-4 sm:mx-6 lg:mx-8 my-4 md:my-6",
      className
    )}
    {...props}
  />
))
SectionCard.displayName = "SectionCard"

export { SectionCard }