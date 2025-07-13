import { Button } from "@/components/ui/button";
import { Grid3X3, Play } from "lucide-react";

interface ViewToggleProps {
  viewMode: "grid" | "carousel";
  onViewChange: (view: "grid" | "carousel") => void;
}

export const ViewToggle = ({ viewMode, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex justify-center gap-2 mb-6 sm:mb-8">
      <Button
        variant={viewMode === "grid" ? "default" : "outline"}
        size="responsive-sm"
        onClick={() => onViewChange("grid")}
        className="flex items-center gap-2 text-xs sm:text-sm font-medium min-h-touch"
      >
        <Grid3X3 className="w-4 h-4" />
        Grid View
      </Button>
      <Button
        variant={viewMode === "carousel" ? "default" : "outline"}
        size="responsive-sm"
        onClick={() => onViewChange("carousel")}
        className="flex items-center gap-2 text-xs sm:text-sm font-medium min-h-touch"
      >
        <Play className="w-4 h-4" />
        Carousel View
      </Button>
    </div>
  );
};