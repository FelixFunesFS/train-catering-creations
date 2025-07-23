
import { Skeleton } from "@/components/ui/skeleton";

interface GalleryLoadingStateProps {
  viewMode?: "grid" | "masonry" | "featured";
  itemCount?: number;
}

export const GalleryLoadingState = ({ 
  viewMode = "masonry", 
  itemCount = 12 
}: GalleryLoadingStateProps) => {
  const getGridClasses = () => {
    switch (viewMode) {
      case "grid":
        return "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5";
      case "featured":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6";
      case "masonry":
        return "columns-1 xs:columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 sm:gap-4 md:gap-5 space-y-3 sm:space-y-4 md:space-y-5";
      default:
        return "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5";
    }
  };

  const getSkeletonHeight = (index: number) => {
    const heights = ["h-48", "h-56", "h-40", "h-52", "h-44"];
    return heights[index % heights.length];
  };

  if (viewMode === "masonry") {
    return (
      <div className={getGridClasses()}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <div key={`skeleton-${index}`} className="break-inside-avoid mb-3 sm:mb-4 md:mb-5">
            <div className="rounded-xl overflow-hidden bg-card border border-border/20 p-2 sm:p-3 lg:p-4">
              <Skeleton className={`w-full ${getSkeletonHeight(index)} rounded-lg`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={getGridClasses()}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={`skeleton-${index}`} className="rounded-xl overflow-hidden bg-card border border-border/20 p-2 sm:p-3 lg:p-4">
          <Skeleton className={`w-full ${getSkeletonHeight(index)} rounded-lg`} />
        </div>
      ))}
    </div>
  );
};
