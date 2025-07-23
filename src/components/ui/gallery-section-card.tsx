
import * as React from "react";
import { cn } from "@/lib/utils";

interface GallerySectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const GallerySectionCard = React.forwardRef<HTMLDivElement, GallerySectionCardProps>(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative p-6 transition-all duration-300",
        "border border-border/5 rounded-lg",
        "shadow-sm hover:shadow-md",
        "bg-transparent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

GallerySectionCard.displayName = "GallerySectionCard";
