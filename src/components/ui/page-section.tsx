
import * as React from "react";
import { cn } from "@/lib/utils";

export type SectionPattern = "a" | "b" | "c" | "d";

interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
  pattern?: SectionPattern;
  withBorder?: boolean;
  skipToContentId?: string;
}

const PageSection = React.forwardRef<HTMLElement, PageSectionProps>(
  ({ className, pattern, withBorder = false, skipToContentId, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        id={skipToContentId}
        className={cn(
          "py-10 sm:py-12 lg:py-16",
          pattern && `section-pattern-${pattern}`,
          withBorder && "section-border",
          className
        )}
        {...props}
      >
        {children}
      </section>
    );
  }
);

PageSection.displayName = "PageSection";

export { PageSection };
