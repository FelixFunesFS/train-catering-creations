import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FAQSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

export const FAQSearch = ({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search frequently asked questions..." 
}: FAQSearchProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onSearchChange("");
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className={`relative neumorphic-card-2 rounded-xl transition-all duration-300 ${
        isFocused ? 'ring-2 ring-primary/20' : ''
      }`}>
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="pl-12 pr-12 py-3 text-base bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {searchTerm && (
          <Button
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};