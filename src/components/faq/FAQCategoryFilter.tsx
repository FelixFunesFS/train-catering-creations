import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { faqCategories, type FAQCategory } from "@/data/faqData";
import { 
  Info, 
  Shield, 
  Utensils, 
  DollarSign, 
  Calendar, 
  FileText,
  Filter
} from "lucide-react";

const iconMap = {
  Info,
  Shield,
  Utensils,
  DollarSign,
  Calendar,
  FileText
};

interface FAQCategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categoryMemberCounts: Record<string, number>;
}

export const FAQCategoryFilter = ({ 
  selectedCategory, 
  onCategoryChange,
  categoryMemberCounts 
}: FAQCategoryFilterProps) => {
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Info className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filter by category:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => onCategoryChange(null)}
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          className="neumorphic-button-secondary"
        >
          All Categories
          <Badge variant="secondary" className="ml-2">
            {Object.values(categoryMemberCounts).reduce((sum, count) => sum + count, 0)}
          </Badge>
        </Button>
        
        {faqCategories.map((category: FAQCategory) => (
          <Button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            className="neumorphic-button-secondary flex items-center gap-2"
          >
            {getIcon(category.icon)}
            {category.name}
            <Badge variant="secondary" className="ml-1">
              {categoryMemberCounts[category.id] || 0}
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  );
};