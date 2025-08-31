import * as React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimplifiedActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function SimplifiedActionButton({
  variant = "secondary",
  isLoading = false,
  loadingText = "Loading...",
  icon,
  children,
  className,
  disabled,
  ...props
}: SimplifiedActionButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md";
      case "secondary":
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border";
      case "tertiary":
        return "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground";
      default:
        return "";
    }
  };

  const getSize = () => {
    switch (variant) {
      case "primary":
        return "h-11 px-6 text-base font-medium";
      case "secondary":
        return "h-10 px-4 text-sm";
      case "tertiary":
        return "h-9 px-3 text-sm";
      default:
        return "h-10 px-4 text-sm";
    }
  };

  return (
    <Button
      className={cn(
        getVariantStyles(),
        getSize(),
        "transition-all duration-200",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </Button>
  );
}