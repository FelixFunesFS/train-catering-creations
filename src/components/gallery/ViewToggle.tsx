import { Button } from "@/components/ui/button";
import { Grid3X3, Play, LayoutGrid, Grid2X2, Columns3 } from "lucide-react";

interface ViewToggleProps {
  viewMode: "grid" | "carousel" | "featured" | "masonry";
  onViewChange: (view: "grid" | "carousel" | "featured" | "masonry") => void;
}

export const ViewToggle = ({ viewMode, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex justify-center gap-1 sm:gap-2 mb-6 sm:mb-8 flex-wrap">
      <Button
        variant={viewMode === "grid" ? "default" : "outline"}
        size="responsive-sm"
        onClick={() => onViewChange("grid")}
        className="flex items-center gap-1 sm:gap-2 font-medium min-h-touch"
      >
        <Grid3X3 className="w-4 h-4" />
        <span className="hidden sm:inline">Grid</span>
      </Button>
      <Button
        variant={viewMode === "featured" ? "default" : "outline"}
        size="responsive-sm"
        onClick={() => onViewChange("featured")}
        className="flex items-center gap-1 sm:gap-2 font-medium min-h-touch"
      >
        <Grid2X2 className="w-4 h-4" />
        <span className="hidden sm:inline">Featured</span>
      </Button>
      <Button
        variant={viewMode === "masonry" ? "default" : "outline"}
        size="responsive-sm"
        onClick={() => onViewChange("masonry")}
        className="flex items-center gap-1 sm:gap-2 font-medium min-h-touch"
      >
        <Columns3 className="w-4 h-4" />
        <span className="hidden sm:inline">Masonry</span>
      </Button>
      <Button
        variant={viewMode === "carousel" ? "default" : "outline"}
        size="responsive-sm"
        onClick={() => onViewChange("carousel")}
        className="flex items-center gap-1 sm:gap-2 font-medium min-h-touch"
      >
        <Play className="w-4 h-4" />
        <span className="hidden sm:inline">Carousel</span>
      </Button>
    </div>
  );
};