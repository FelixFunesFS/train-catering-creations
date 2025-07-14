import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-glow shadow-card hover:shadow-glow transform hover:scale-[1.02]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-card hover:shadow-elegant",
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground shadow-card hover:shadow-elegant",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-card hover:shadow-elegant",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-card",
        link: "text-primary underline-offset-4 hover:underline",
        cta: "bg-primary text-primary-foreground hover:bg-primary-glow shadow-glow hover:shadow-float transform hover:scale-[1.02]",
        "cta-outline": "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground shadow-card hover:shadow-elegant transform hover:scale-[1.01]",
        "cta-white": "border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary shadow-card hover:shadow-elegant transform hover:scale-[1.01]",
        "cta-secondary": "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground shadow-card hover:shadow-elegant",
        accent: "bg-accent text-accent-foreground hover:bg-accent/80 shadow-card hover:shadow-elegant",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm sm:h-10",
        sm: "h-8 rounded-md px-3 text-sm sm:h-9",
        lg: "h-9 rounded-md px-6 text-base sm:h-10",
        xl: "h-10 rounded-md px-8 text-base font-semibold sm:h-11",
        icon: "h-9 w-9 sm:h-10 sm:w-10",
        "responsive-sm": "min-h-touch px-4 text-sm sm:text-base sm:px-5 w-full sm:w-auto justify-center whitespace-nowrap",
        "responsive-md": "min-h-touch px-5 text-sm sm:text-base sm:px-6 w-full sm:w-auto justify-center whitespace-nowrap",
        "responsive-lg": "min-h-touch px-6 text-base sm:px-8 w-full sm:w-auto justify-center whitespace-nowrap",
        "responsive-xl": "min-h-touch px-8 text-base sm:px-10 w-full sm:w-auto justify-center whitespace-nowrap",
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
