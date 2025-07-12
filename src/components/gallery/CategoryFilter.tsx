import { Button } from "@/components/ui/button";
import { galleryCategories } from "@/data/galleryCategories";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
      {galleryCategories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="responsive-sm"
          onClick={() => onCategoryChange(category.id)}
          className={selectedCategory === category.id 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "text-muted-foreground hover:text-primary hover:border-primary/50"
          }
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};