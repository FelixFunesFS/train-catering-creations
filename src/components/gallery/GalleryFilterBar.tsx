
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GalleryFilterBarProps {
  categories: Array<{ id: string; name: string; count: number }>;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (search: string) => void;
  searchTerm: string;
}

export const GalleryFilterBar = ({
  categories,
  selectedCategory,
  onCategoryChange,
  onSearchChange,
  searchTerm
}: GalleryFilterBarProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const clearSearch = () => {
    onSearchChange("");
  };

  return (
    <div className="mb-6 sm:mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search gallery..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 min-h-[44px]"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 min-h-[44px]"
        >
          <Filter className="w-4 h-4" />
          Filters
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="ml-1">
              1
            </Badge>
          )}
        </Button>
      </div>

      {/* Category Filters */}
      {showFilters && (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2 animate-fade-in">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className="font-medium min-h-[44px] flex items-center gap-1"
            >
              {category.name}
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
