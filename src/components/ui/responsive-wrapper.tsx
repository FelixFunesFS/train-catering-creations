
import * as React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  hasFullWidthCard?: boolean;
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  className,
  hasFullWidthCard = false
}) => {
  return (
    <>
      {/* Desktop Full-Width Card */}
      {hasFullWidthCard && (
        <div className="hidden lg:block">
          <div className="neumorphic-card-2 mx-4 xl:mx-8 rounded-2xl overflow-hidden">
            <div className={cn("max-w-7xl mx-auto px-6 xl:px-12 py-12 xl:py-16", className)}>
              {children}
            </div>
          </div>
        </div>
      )}

      {/* Mobile/Tablet Layout */}
      <div className={hasFullWidthCard ? "block lg:hidden" : "block"}>
        <div className={cn("max-w-7xl mx-auto px-4 sm:px-6", className)}>
          {children}
        </div>
      </div>
    </>
  );
};
