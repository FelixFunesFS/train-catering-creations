import { Button } from "@/components/ui/button";
import { galleryCategories } from "@/data/galleryCategories";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-12">
      {galleryCategories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          onClick={() => onCategoryChange(category.id)}
          className={selectedCategory === category.id 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:text-primary"
          }
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};