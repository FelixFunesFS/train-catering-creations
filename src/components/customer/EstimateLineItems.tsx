import { useMemo } from 'react';
import { formatCurrency } from '@/utils/formatters';

interface LineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
  sort_order?: number;
  created_at?: string;
}

interface EstimateLineItemsProps {
  lineItems: LineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
}

// Category display labels - friendlier names
const categoryLabels: Record<string, string> = {
  'package': 'Main Packages',
  'dietary': 'Dietary Options',
  'appetizers': 'Starters',
  'desserts': 'Desserts',
  'service': 'Service & Staffing',
  'supplies': 'Equipment & Supplies',
  'Proteins': 'Main Proteins',
  'Sides': 'Side Dishes',
  'Beverages': 'Drinks',
};

// Category icons for visual hierarchy
const categoryIcons: Record<string, string> = {
  'package': '📦',
  'dietary': '🌱',
  'appetizers': '🍤',
  'desserts': '🍰',
  'service': '🍴',
  'supplies': '🧊',
  'Proteins': '🥩',
  'Sides': '🥗',
  'Beverages': '🥤',
};

// Group line items by category for display, preserving sort order within each category
function groupByCategory(items: LineItem[]): Record<string, LineItem[]> {
  return items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, LineItem[]>);
}

// Check if we should skip the category header (single item that already describes category)
// Enhanced v2 - covers all common descriptive terms to prevent redundancy
function shouldSkipCategoryHeader(category: string, items: LineItem[]): boolean {
  if (items.length !== 1) return false;
  
  const firstItemTitle = items[0]?.title?.toLowerCase() || '';
  const categoryLower = category.toLowerCase();
  const labelLower = (categoryLabels[category] || category).toLowerCase();
  
  // Comprehensive list of descriptive terms that make headers redundant
  const descriptiveTerms = [
    'package', 'selection', 'service', 'catering',
    'supply', 'equipment', 'entrée', 'entree'
  ];
  
  // Skip if the item title already contains descriptive category info
  return (
    firstItemTitle.includes(categoryLower) ||
    firstItemTitle.includes(labelLower.split(' ')[0]) ||
    descriptiveTerms.some(term => firstItemTitle.includes(term))
  );
}

export function EstimateLineItems({ lineItems, subtotal, taxAmount, total }: EstimateLineItemsProps) {
  // Sort line items by sort_order first, then created_at for stable ordering
  // This matches the email template and admin view ordering
  const sortedLineItems = useMemo(() => {
    return [...lineItems].sort((a, b) => {
      const sortOrderA = a.sort_order ?? 999999;
      const sortOrderB = b.sort_order ?? 999999;
      if (sortOrderA !== sortOrderB) return sortOrderA - sortOrderB;
      // Secondary sort by created_at
      const createdAtA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const createdAtB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return createdAtA - createdAtB;
    });
  }, [lineItems]);

  const groupedItems = groupByCategory(sortedLineItems);
  const categories = Object.keys(groupedItems);
  
  // Calculate tax breakdown using same method as email template for consistency
  // 2% hospitality tax + 7% service tax = 9% total
  const hospitalityTax = Math.round(subtotal * 0.02);
  const serviceTax = Math.round(subtotal * 0.07);

  return (
    <div className="space-y-4">
      {/* Line Items by Category */}
      {categories.map((category) => {
        const items = groupedItems[category];
        const skipHeader = shouldSkipCategoryHeader(category, items);
        const displayLabel = categoryLabels[category] || category;
        const icon = categoryIcons[category] || '📋';
        
        return (
          <div key={category} className="space-y-1">
            {!skipHeader && (
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                <span>{icon}</span>
                <span className="uppercase tracking-wide">{displayLabel}</span>
              </h4>
            )}
            <div className="space-y-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-medium text-foreground flex items-center gap-1.5">
                      {skipHeader && <span className="text-base">{icon}</span>}
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.quantity} × {formatCurrency(item.unit_price)}
                      </p>
                    )}
                  </div>
                  <p className="font-medium text-foreground whitespace-nowrap">
                    {formatCurrency(item.total_price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Totals Section */}
      <div className="pt-4 border-t-2 border-border space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        
        {taxAmount > 0 && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hospitality Tax (2%)</span>
              <span>{formatCurrency(hospitalityTax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Tax (7%)</span>
              <span>{formatCurrency(serviceTax)}</span>
            </div>
          </>
        )}
        
        <div className="flex justify-between pt-2 border-t border-border">
          <span className="text-lg font-bold text-foreground">Total</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
