
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 neumorphic-outset hover:shadow-neumorphic-elevated transform hover:scale-[1.02]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 neumorphic-outset hover:shadow-neumorphic-elevated",
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground neumorphic-soft hover:shadow-neumorphic-elevated",
        secondary:
          "neumorphic-button text-secondary-foreground hover:bg-secondary/80 hover:shadow-neumorphic-elevated",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-neumorphic-soft font-medium",
        link: "text-primary underline-offset-4 hover:underline font-medium",
        cta: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-neumorphic-elevated hover:shadow-glow-strong transform hover:scale-[1.02] font-bold",
        "cta-outline": "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground neumorphic-soft hover:shadow-neumorphic-elevated transform hover:scale-[1.02] font-bold",
        "cta-white": "border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary neumorphic-soft hover:shadow-neumorphic-elevated transform hover:scale-[1.01]",
        "cta-secondary": "neumorphic-button text-secondary-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-neumorphic-elevated",
        accent: "bg-accent text-accent-foreground hover:bg-accent/80 neumorphic-outset hover:shadow-neumorphic-elevated",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm font-medium",
        sm: "h-9 px-3 text-sm font-medium",
        lg: "h-11 px-6 text-base font-semibold",
        xl: "h-12 px-8 text-lg font-bold",
        icon: "h-10 w-10",
        "responsive-sm": "min-h-[48px] px-6 py-3 text-sm font-medium sm:text-base sm:px-8 w-full sm:w-auto justify-center",
        "responsive-md": "min-h-[48px] px-8 py-3 text-base font-semibold sm:text-base sm:px-10 w-full sm:w-auto justify-center",
        "responsive-lg": "min-h-[48px] px-10 py-3 text-base font-bold sm:text-lg sm:px-12 w-full sm:w-auto justify-center",
        "responsive-xl": "min-h-[52px] px-12 py-4 text-lg font-bold sm:text-xl sm:px-16 w-full sm:w-auto justify-center",
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
