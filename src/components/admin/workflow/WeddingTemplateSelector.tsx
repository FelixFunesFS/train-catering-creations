import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Crown, Flag, Sparkles } from 'lucide-react';

interface WeddingTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  basePrice: number;
  items: Array<{
    title: string;
    description: string;
    category: string;
    quantity: number;
  }>;
}

interface WeddingTemplateSelectorProps {
  guestCount: number;
  onSelectTemplate: (template: WeddingTemplate) => void;
  onSkip: () => void;
}

export function WeddingTemplateSelector({
  guestCount,
  onSelectTemplate,
  onSkip
}: WeddingTemplateSelectorProps) {
  const templates: WeddingTemplate[] = [
    {
      id: 'classic-wedding',
      name: 'Classic Wedding Package',
      description: 'Perfect for traditional wedding celebrations',
      icon: Heart,
      basePrice: 45,
      items: [
        {
          title: 'Ceremony Reception Service',
          description: 'Full service for ceremony and reception',
          category: 'service',
          quantity: 1
        },
        {
          title: 'Cocktail Hour Service',
          description: 'Appetizers and drink service',
          category: 'service',
          quantity: 1
        },
        {
          title: 'Dual Protein Dinner Service',
          description: 'Choice of two protein options',
          category: 'food',
          quantity: guestCount
        },
        {
          title: 'Premium Sides Selection',
          description: '3-4 gourmet side dishes',
          category: 'food',
          quantity: guestCount
        },
        {
          title: 'Professional Wait Staff',
          description: 'Experienced wedding service staff',
          category: 'staffing',
          quantity: Math.ceil(guestCount / 25)
        },
        {
          title: 'Setup & Breakdown',
          description: 'Complete event setup and cleanup',
          category: 'service',
          quantity: 1
        }
      ]
    },
    {
      id: 'black-tie-wedding',
      name: 'Black Tie Wedding Package',
      description: 'Elegant formal wedding service',
      icon: Crown,
      basePrice: 65,
      items: [
        {
          title: 'Premium Plated Service',
          description: 'Multi-course plated dinner service',
          category: 'service',
          quantity: 1
        },
        {
          title: 'Champagne Toast Service',
          description: 'Champagne service for toasts',
          category: 'beverage',
          quantity: guestCount
        },
        {
          title: 'Premium Dual Protein',
          description: 'Filet mignon and seafood options',
          category: 'food',
          quantity: guestCount
        },
        {
          title: 'Gourmet Sides & Salad',
          description: 'Premium sides with garden salad course',
          category: 'food',
          quantity: guestCount
        },
        {
          title: 'Black Tie Wait Staff',
          description: 'Formal attire service staff',
          category: 'staffing',
          quantity: Math.ceil(guestCount / 20)
        },
        {
          title: 'Premium Linens & Presentation',
          description: 'Elegant table settings and linens',
          category: 'equipment',
          quantity: Math.ceil(guestCount / 8)
        }
      ]
    },
    {
      id: 'military-wedding',
      name: 'Military/Government Wedding',
      description: 'Special pricing and protocol for military events',
      icon: Flag,
      basePrice: 40,
      items: [
        {
          title: 'Military Protocol Service',
          description: 'Service following military traditions',
          category: 'service',
          quantity: 1
        },
        {
          title: 'Ceremonial Service',
          description: 'Support for military ceremonies (sword arch, etc)',
          category: 'service',
          quantity: 1
        },
        {
          title: 'Classic Protein Selection',
          description: 'Choice of protein options',
          category: 'food',
          quantity: guestCount
        },
        {
          title: 'Traditional Sides',
          description: 'Classic Southern side dishes',
          category: 'food',
          quantity: guestCount
        },
        {
          title: 'Professional Service Staff',
          description: 'Experienced event staff',
          category: 'staffing',
          quantity: Math.ceil(guestCount / 25)
        }
      ]
    }
  ];

  const calculateEstimatedTotal = (template: WeddingTemplate) => {
    return template.basePrice * guestCount;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Wedding Event Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select a pre-configured wedding package to quickly populate line items, 
            or skip to create a custom estimate.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((template) => {
              const Icon = template.icon;
              const estimatedTotal = calculateEstimatedTotal(template);

              return (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:border-primary transition-all"
                  onClick={() => onSelectTemplate(template)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="outline">
                        ${template.basePrice}/guest
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Includes:
                      </p>
                      <ul className="text-xs space-y-1">
                        {template.items.slice(0, 4).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{item.title}</span>
                          </li>
                        ))}
                        {template.items.length > 4 && (
                          <li className="text-muted-foreground italic">
                            + {template.items.length - 4} more items
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">
                          Estimated Total
                        </span>
                        <span className="text-xl font-bold">
                          ${estimatedTotal.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on {guestCount} guests
                      </p>
                    </div>

                    <Button className="w-full" size="sm">
                      Use This Template
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center pt-4">
            <Button onClick={onSkip} variant="outline">
              Skip - Create Custom Estimate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
