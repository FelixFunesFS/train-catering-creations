import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-all duration-300 focus-visible-enhanced disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation select-none",
  {
    variants: {
      variant: {
        default: "neumorphic-button-primary hover:shadow-glow transform hover:scale-[1.02]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 neumorphic-card-2",
        outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground neumorphic-card-1",
        secondary: "neumorphic-button-secondary",
        ghost: "hover:bg-accent hover:text-accent-foreground neumorphic-card-1 font-medium",
        link: "text-primary underline-offset-4 hover:underline font-medium focus-visible-enhanced",
        cta: "neumorphic-button-primary shadow-glow hover:shadow-glow-strong transform hover:scale-[1.02] font-bold",
        "cta-outline": "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground neumorphic-card-2 hover:shadow-glow transform hover:scale-[1.02] font-bold",
        "cta-white": "border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary neumorphic-card-1 transform hover:scale-[1.01]",
        "cta-secondary": "neumorphic-button-secondary hover:shadow-glow",
        "cta-gold": "neumorphic-button-gold shadow-gold-glow hover:shadow-gold-glow transform hover:scale-[1.02] font-bold",
        accent: "bg-accent text-accent-foreground hover:bg-accent/80 neumorphic-card-2",
        gold: "neumorphic-button-gold transform hover:scale-[1.01]",
        navy: "bg-navy text-navy-foreground hover:bg-navy-light neumorphic-card-2 transform hover:scale-[1.01]",
        platinum: "bg-platinum text-platinum-foreground hover:bg-platinum-light neumorphic-card-2 transform hover:scale-[1.01]",
        "cta-platinum": "bg-platinum text-platinum-foreground hover:bg-platinum-dark neumorphic-card-2 hover:shadow-glow transform hover:scale-[1.02] font-bold",
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
