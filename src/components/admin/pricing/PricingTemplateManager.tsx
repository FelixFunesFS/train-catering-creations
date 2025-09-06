import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Star, 
  Package, 
  DollarSign,
  Users,
  Search,
  Filter,
  Utensils
} from 'lucide-react';

interface PricingRule {
  id: string;
  category: string;
  item_name: string;
  base_price: number;
  price_per_person: number;
  minimum_quantity: number;
  service_type?: string;
  is_active: boolean;
}

interface PricingTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  items: PricingRule[];
  guest_count_range: { min: number; max: number };
  is_default: boolean;
}

interface PricingTemplateManagerProps {
  onSelectTemplate?: (template: PricingTemplate) => void;
  onAddItems?: (items: LineItem[]) => void;
  guestCount?: number;
  currentItems?: any[];
}

interface LineItem {
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export function PricingTemplateManager({ 
  onSelectTemplate, 
  onAddItems, 
  guestCount = 50,
  currentItems = [] 
}: PricingTemplateManagerProps) {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [templates, setTemplates] = useState<PricingTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchPricingRules();
    loadDefaultTemplates();
  }, []);

  const fetchPricingRules = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('item_name', { ascending: true });

      if (error) throw error;
      setPricingRules(data || []);
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
      toast({
        title: "Error",
        description: "Failed to load pricing rules",
        variant: "destructive"
      });
    }
  };

  const loadDefaultTemplates = () => {
    const defaultTemplates: PricingTemplate[] = [
      {
        id: 'casual-buffet',
        name: 'Casual Buffet Package',
        description: 'Perfect for informal gatherings and family events',
        category: 'buffet',
        items: [],
        guest_count_range: { min: 20, max: 100 },
        is_default: true
      },
      {
        id: 'formal-plated',
        name: 'Formal Plated Service',
        description: 'Elegant sit-down dining for special occasions',
        category: 'plated',
        items: [],
        guest_count_range: { min: 25, max: 150 },
        is_default: true
      },
      {
        id: 'corporate-lunch',
        name: 'Corporate Lunch Package',
        description: 'Professional catering for business events',
        category: 'corporate',
        items: [],
        guest_count_range: { min: 10, max: 75 },
        is_default: true
      },
      {
        id: 'bbq-outdoor',
        name: 'BBQ & Outdoor Events',
        description: 'Southern BBQ favorites for outdoor gatherings',
        category: 'bbq',
        items: [],
        guest_count_range: { min: 30, max: 200 },
        is_default: true
      }
    ];
    setTemplates(defaultTemplates);
  };

  const categories = [...new Set(pricingRules.map(rule => rule.category))];
  
  const filteredRules = pricingRules.filter(rule => {
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
    const matchesSearch = rule.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const calculateItemTotal = (rule: PricingRule) => {
    if (rule.price_per_person > 0) {
      return rule.base_price + (rule.price_per_person * guestCount);
    }
    return rule.base_price;
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(priceInCents / 100);
  };

  const handleSelectItem = (ruleId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(ruleId)) {
      newSelected.delete(ruleId);
    } else {
      newSelected.add(ruleId);
    }
    setSelectedItems(newSelected);
  };

  const handleAddSelectedItems = () => {
    const selectedRules = pricingRules.filter(rule => selectedItems.has(rule.id));
    const lineItems: LineItem[] = selectedRules.map(rule => ({
      title: rule.item_name,
      description: `${rule.category} - ${rule.service_type || 'Standard'}`,
      category: rule.category,
      quantity: rule.minimum_quantity || 1,
      unit_price: calculateItemTotal(rule),
      total_price: calculateItemTotal(rule) * (rule.minimum_quantity || 1)
    }));

    onAddItems?.(lineItems);
    setSelectedItems(new Set());
    toast({
      title: "Items Added",
      description: `Added ${selectedRules.length} items to estimate`,
    });
  };

  const handleApplyTemplate = (template: PricingTemplate) => {
    // For now, we'll use predefined template logic
    // In a real implementation, templates would store specific item configurations
    const templateItems = getTemplateItems(template.id);
    onAddItems?.(templateItems);
    
    toast({
      title: "Template Applied",
      description: `Applied ${template.name} template with ${templateItems.length} items`,
    });
  };

  const getTemplateItems = (templateId: string): LineItem[] => {
    // Predefined template configurations
    const templateConfigs: { [key: string]: string[] } = {
      'casual-buffet': ['Pulled Pork', 'Fried Chicken', 'Mac and Cheese', 'Coleslaw', 'Cornbread', 'Sweet Tea', 'Buffet Service'],
      'formal-plated': ['Beef Brisket', 'Green Beans', 'Mac and Cheese', 'Cornbread', 'Peach Cobbler', 'Coffee Service', 'Plated Service', 'Wait Staff Service'],
      'corporate-lunch': ['Fried Chicken', 'Potato Salad', 'Green Beans', 'Cornbread', 'Soft Drinks', 'Delivery & Setup'],
      'bbq-outdoor': ['Pulled Pork', 'Beef Brisket', 'Baked Beans', 'Coleslaw', 'Cornbread', 'Sweet Tea', 'Lemonade', 'Buffet Service']
    };

    const itemNames = templateConfigs[templateId] || [];
    return pricingRules
      .filter(rule => itemNames.includes(rule.item_name))
      .map(rule => ({
        title: rule.item_name,
        description: `${rule.category} - Template item`,
        category: rule.category,
        quantity: rule.minimum_quantity || 1,
        unit_price: calculateItemTotal(rule),
        total_price: calculateItemTotal(rule) * (rule.minimum_quantity || 1)
      }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'protein':
      case 'meal': return <Utensils className="h-4 w-4" />;
      case 'service': return <Users className="h-4 w-4" />;
      case 'equipment': return <Package className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const hasItemConflict = (rule: PricingRule) => {
    return currentItems.some(item => 
      item.title === rule.item_name || 
      (item.category === rule.category && ['protein', 'meal'].includes(rule.category))
    );
  };

  return (
    <div className="space-y-6">
      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Quick Templates ({guestCount} guests)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div 
                key={template.id}
                className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                onClick={() => handleApplyTemplate(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{template.name}</h4>
                  <Badge variant="outline">{template.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {template.guest_count_range.min}-{template.guest_count_range.max} guests
                  </span>
                  <Button size="sm" variant="outline">
                    Apply Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Individual Items
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedItems.size > 0 && (
                <Button onClick={handleAddSelectedItems} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Selected ({selectedItems.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredRules.map((rule) => {
              const isSelected = selectedItems.has(rule.id);
              const hasConflict = hasItemConflict(rule);
              const totalPrice = calculateItemTotal(rule);

              return (
                <div
                  key={rule.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : hasConflict 
                        ? 'border-orange-300 bg-orange-50' 
                        : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => !hasConflict && handleSelectItem(rule.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(rule.category)}
                      <h4 className="font-medium text-sm">{rule.item_name}</h4>
                    </div>
                    {hasConflict && (
                      <Badge variant="secondary" className="text-xs">
                        Exists
                      </Badge>
                    )}
                    {isSelected && (
                      <Badge className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                  
                  <Badge variant="outline" className="text-xs mb-2">
                    {rule.category}
                  </Badge>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {rule.base_price > 0 && (
                      <p>Base: {formatPrice(rule.base_price)}</p>
                    )}
                    {rule.price_per_person > 0 && (
                      <p>Per person: {formatPrice(rule.price_per_person)}</p>
                    )}
                    <p className="font-medium text-foreground">
                      Total: {formatPrice(totalPrice)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}