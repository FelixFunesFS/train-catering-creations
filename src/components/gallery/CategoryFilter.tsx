import { Button } from "@/components/ui/button";
import { galleryCategories } from "@/data/galleryCategories";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12 px-2">
      {galleryCategories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="responsive-sm"
          onClick={() => onCategoryChange(category.id)}
          className="font-medium flex-shrink-0"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};