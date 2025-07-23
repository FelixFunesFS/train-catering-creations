
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MenuSkeletonProps {
  itemCount?: number;
  isMobile?: boolean;
}

export const MenuSkeleton = ({ itemCount = 6, isMobile = false }: MenuSkeletonProps) => {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="text-center mb-4">
        <Skeleton className="h-7 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>

      {/* Filter skeleton */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      {/* Items skeleton */}
      <div className={cn(
        "gap-3 sm:gap-4",
        isMobile 
          ? "flex flex-col space-y-2" 
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "bg-background/50 border border-border/20 rounded-lg p-4",
              isMobile ? "min-h-[72px]" : "min-h-[120px]"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
              <div className="flex gap-1 ml-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-8 w-full mt-3" />
          </div>
        ))}
      </div>

      {/* Show more button skeleton */}
      <div className="flex justify-center mt-6">
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
};
