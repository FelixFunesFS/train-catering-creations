import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-glow shadow-sm hover:shadow-glow transform hover:scale-[1.02]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground shadow-sm hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        cta: "bg-primary text-primary-foreground hover:bg-primary-glow shadow-glow hover:shadow-lg transform hover:scale-[1.02]",
        "cta-outline": "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground shadow-sm hover:shadow-md transform hover:scale-[1.01]",
        "cta-white": "border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary shadow-sm hover:shadow-md transform hover:scale-[1.01]",
        "cta-secondary": "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
        accent: "bg-accent text-accent-foreground hover:bg-accent/80 shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-8 px-4 py-2 text-sm sm:h-9",
        sm: "h-7 rounded-md px-3 text-sm sm:h-8",
        lg: "h-8 rounded-md px-6 text-base sm:h-9",
        xl: "h-9 rounded-md px-8 text-base font-semibold sm:h-10",
        icon: "h-8 w-8 sm:h-9 sm:w-9",
        "responsive-sm": "h-7 px-3 text-sm sm:h-8 sm:px-4 max-w-[200px] sm:max-w-none",
        "responsive-md": "h-7 px-3 text-sm sm:h-8 sm:px-4 max-w-[200px] sm:max-w-none",
        "responsive-lg": "h-8 px-4 text-sm sm:h-9 sm:px-5 sm:text-base max-w-[240px] sm:max-w-none",
        "responsive-xl": "h-9 px-5 text-base sm:h-10 sm:px-6 max-w-[280px] sm:max-w-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
