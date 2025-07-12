import { Button } from "@/components/ui/button";
import { galleryCategories } from "@/data/galleryCategories";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12">
      {galleryCategories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="responsive-md"
          onClick={() => onCategoryChange(category.id)}
          className="text-sm sm:text-base font-medium"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};