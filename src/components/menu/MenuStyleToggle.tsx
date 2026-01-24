import { cn } from "@/lib/utils";

export type MenuStyle = "regular" | "wedding";

interface MenuStyleToggleProps {
  activeStyle: MenuStyle;
  onStyleChange: (style: MenuStyle) => void;
  className?: string;
}

export const MenuStyleToggle = ({
  activeStyle,
  onStyleChange,
  className,
}: MenuStyleToggleProps) => {
  return (
    <div className={cn("flex justify-center py-6", className)}>
      <div className="inline-flex items-center bg-muted/50 rounded-full p-1.5 border border-border/50 shadow-sm">
        <button
          onClick={() => onStyleChange("regular")}
          className={cn(
            "relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 min-w-[120px] sm:min-w-[140px]",
            activeStyle === "regular"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
          aria-pressed={activeStyle === "regular"}
        >
          <span className="hidden sm:inline">Catering Menu</span>
          <span className="sm:hidden">Catering</span>
        </button>
        <button
          onClick={() => onStyleChange("wedding")}
          className={cn(
            "relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 min-w-[120px] sm:min-w-[140px]",
            activeStyle === "wedding"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
          aria-pressed={activeStyle === "wedding"}
        >
          <span className="hidden sm:inline">Wedding & Events</span>
          <span className="sm:hidden">Weddings</span>
        </button>
      </div>
    </div>
  );
};
