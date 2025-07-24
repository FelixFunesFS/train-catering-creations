import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { faqCategories, type FAQItem } from "@/data/faqData";
import { 
  Info, 
  Shield, 
  Utensils, 
  DollarSign, 
  Calendar, 
  FileText
} from "lucide-react";

const iconMap = {
  Info,
  Shield,
  Utensils,
  DollarSign,
  Calendar,
  FileText
};

interface FAQAccordionProps {
  faqs: FAQItem[];
  searchTerm: string;
}

export const FAQAccordion = ({ faqs, searchTerm }: FAQAccordionProps) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const getCategoryInfo = (categoryId: string) => {
    return faqCategories.find(cat => cat.id === categoryId);
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Info className="h-4 w-4" />;
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-primary/20 text-foreground rounded px-1">
          {part}
        </mark>
      ) : part
    );
  };

  if (faqs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="neumorphic-card-2 rounded-xl p-8 max-w-md mx-auto">
          <p className="text-muted-foreground text-lg mb-2">No FAQs found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search terms or filter selection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Accordion 
        type="multiple" 
        value={openItems} 
        onValueChange={setOpenItems}
        className="space-y-4"
      >
        {faqs.map((faq) => {
          const categoryInfo = getCategoryInfo(faq.category);
          
          return (
            <AccordionItem 
              key={faq.id} 
              value={faq.id}
              className="neumorphic-card-2 rounded-xl px-6 py-2 border-none"
            >
              <AccordionTrigger className="text-left hover:no-underline group py-4">
                <div className="flex items-start gap-3 text-left w-full pr-4">
                  <div className="flex items-center gap-2 mt-1">
                    {categoryInfo && getIcon(categoryInfo.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                      {highlightSearchTerm(faq.question, searchTerm)}
                    </h3>
                    {categoryInfo && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {categoryInfo.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="pl-9 text-muted-foreground leading-relaxed">
                  {highlightSearchTerm(faq.answer, searchTerm)}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};