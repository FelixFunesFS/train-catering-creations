
import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  pattern?: "a" | "b" | "c" | "d";
  withBorder?: boolean;
}

const SectionWrapper = React.forwardRef<HTMLElement, SectionWrapperProps>(
  ({ className, pattern, withBorder = false, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(
        "py-8 sm:py-12 lg:py-16",
        pattern && `section-pattern-${pattern}`,
        withBorder && "section-border",
        className
      )}
      {...props}
    />
  )
);

SectionWrapper.displayName = "SectionWrapper";

export { SectionWrapper };
