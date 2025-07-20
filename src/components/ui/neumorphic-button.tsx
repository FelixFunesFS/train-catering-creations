
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const neumorphicButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-all duration-300 focus-visible-enhanced disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "neumorphic-button-primary",
        secondary: "neumorphic-button-secondary",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground neumorphic-card-1",
        ghost: "hover:bg-accent hover:text-accent-foreground neumorphic-card-1",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface NeumorphicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neumorphicButtonVariants> {
  asChild?: boolean;
}

const NeumorphicButton = React.forwardRef<HTMLButtonElement, NeumorphicButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(neumorphicButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

NeumorphicButton.displayName = "NeumorphicButton";

export { NeumorphicButton, neumorphicButtonVariants };
