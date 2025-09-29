import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calculator, 
  DollarSign, 
  Users, 
  Utensils,
  Coffee,
  Cake,
  Sparkles,
  ChefHat
} from 'lucide-react';
import { type LineItem } from '@/utils/invoiceFormatters';

interface CategoryPricingHelperProps {
  lineItems: LineItem[];
  guestCount: number;
  updateLineItem: (itemId: string, updates: Partial<LineItem>) => void;
  onBulkPricing: (category: string, pricePerPerson: number) => void;
}

interface PricingTemplate {
  name: string;
  eventType: string;
  categories: {
    package: number;
    appetizers: number;
    sides: number;
    beverages: number;
    desserts: number;
    service: number;
  };
}

const PRICING_TEMPLATES: PricingTemplate[] = [
  {
    name: 'Casual Buffet',
    eventType: 'Corporate/Casual',
    categories: {
      package: 18.00,
      appetizers: 4.50,
      sides: 3.00,
      beverages: 2.50,
      desserts: 4.00,
      service: 125.00
    }
  },
  {
    name: 'Formal Dinner',
    eventType: 'Wedding/Formal',
    categories: {
      package: 28.00,
      appetizers: 7.50,
      sides: 5.00,
      beverages: 4.00,
      desserts: 6.50,
      service: 250.00
    }
  },
  {
    name: 'Corporate Lunch',
    eventType: 'Business Meeting',
    categories: {
      package: 15.50,
      appetizers: 3.50,
      sides: 2.50,
      beverages: 2.00,
      desserts: 3.50,
      service: 75.00
    }
  }
];

export function CategoryPricingHelper({ 
  lineItems, 
  guestCount, 
  updateLineItem, 
  onBulkPricing 
}: CategoryPricingHelperProps) {
  
  const groupedItems = lineItems.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, LineItem[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'package': return <ChefHat className="h-4 w-4" />;
      case 'appetizers': return <Utensils className="h-4 w-4" />;
      case 'sides': return <Utensils className="h-4 w-4" />;
      case 'beverages': return <Coffee className="h-4 w-4" />;
      case 'desserts': return <Cake className="h-4 w-4" />;
      case 'service': return <Sparkles className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const names: Record<string, string> = {
      package: 'Catering Package',
      appetizers: 'Appetizers',
      sides: 'Sides & Beverages',
      beverages: 'Beverages',
      desserts: 'Desserts',
      service: 'Service Fees',
      other: 'Other Items'
    };
    return names[category] || category;
  };

  const calculateCategoryTotal = (category: string) => {
    return groupedItems[category]?.reduce((sum, item) => sum + item.total_price, 0) || 0;
  };

  const applyTemplate = (template: PricingTemplate) => {
    Object.entries(groupedItems).forEach(([category, items]) => {
      const categoryPrice = template.categories[category as keyof typeof template.categories];
      if (categoryPrice) {
        items.forEach(item => {
          const isPerPerson = category !== 'service';
          const unitPrice = isPerPerson ? Math.round(categoryPrice * 100) : Math.round(categoryPrice * 100);
          updateLineItem(item.id, { unit_price: unitPrice });
        });
      }
    });
  };

  const handleQuickPrice = (category: string, pricePerPerson: string) => {
    const price = parseFloat(pricePerPerson);
    if (!isNaN(price) && price > 0) {
      onBulkPricing(category, price);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Smart Pricing Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Quick Templates */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Pricing Templates</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PRICING_TEMPLATES.map((template) => (
              <Button
                key={template.name}
                variant="outline"
                className="h-auto p-3 flex flex-col items-start"
                onClick={() => applyTemplate(template)}
              >
                <span className="font-medium">{template.name}</span>
                <span className="text-xs text-muted-foreground">{template.eventType}</span>
                <span className="text-xs text-primary">
                  ${template.categories.package}/person
                </span>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Category Breakdown */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Category-Based Pricing</Label>
          
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  <span className="font-medium">{getCategoryDisplayName(category)}</span>
                  <Badge variant="secondary">{items.length} items</Badge>
                </div>
                <div className="text-sm font-medium">
                  ${(calculateCategoryTotal(category) / 100).toFixed(2)}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Price per person"
                  className="w-32"
                  step="0.50"
                  min="0"
                  onBlur={(e) => handleQuickPrice(category, e.target.value)}
                />
                <span className="text-xs text-muted-foreground">per person</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const input = document.querySelector(`input[placeholder="Price per person"]`) as HTMLInputElement;
                    if (input?.value) handleQuickPrice(category, input.value);
                  }}
                >
                  Apply
                </Button>
              </div>
              
              {/* Show items in category */}
              <div className="pl-6 space-y-1 text-sm text-muted-foreground">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.title}</span>
                    <span>${(item.total_price / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Pricing Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <Label className="text-sm font-medium">Pricing Summary</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Guest Count:</span>
                <span className="font-medium">{guestCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="font-medium">{lineItems.length}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">
                  ${(lineItems.reduce((sum, item) => sum + item.total_price, 0) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Per Guest:</span>
                <span className="font-medium text-primary">
                  ${guestCount > 0 ? (lineItems.reduce((sum, item) => sum + item.total_price, 0) / 100 / guestCount).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}