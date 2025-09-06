import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  DollarSign,
  Calculator,
  Users,
  Package
} from 'lucide-react';

interface LineItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  items: LineItem[];
  fixable: boolean;
  autoFixAction?: () => void;
}

interface PricingValidationProps {
  lineItems: LineItem[];
  guestCount?: number;
  onFixIssues?: (fixes: { itemId: string; fixes: Partial<LineItem> }[]) => void;
  onHighlightItems?: (itemIds: string[]) => void;
}

export function PricingValidation({ 
  lineItems, 
  guestCount = 0, 
  onFixIssues,
  onHighlightItems 
}: PricingValidationProps) {
  const validatePricing = (): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    // Check for zero-price items
    const zeroPriceItems = lineItems.filter(item => item.unit_price === 0 || item.total_price === 0);
    if (zeroPriceItems.length > 0) {
      issues.push({
        type: 'error',
        category: 'Pricing',
        message: `${zeroPriceItems.length} items have zero pricing`,
        items: zeroPriceItems,
        fixable: false
      });
    }

    // Check for missing quantities
    const zeroQuantityItems = lineItems.filter(item => item.quantity === 0);
    if (zeroQuantityItems.length > 0) {
      issues.push({
        type: 'error',
        category: 'Quantity',
        message: `${zeroQuantityItems.length} items have zero quantity`,
        items: zeroQuantityItems,
        fixable: true,
        autoFixAction: () => {
          const fixes = zeroQuantityItems.map(item => ({
            itemId: item.id || '',
            fixes: { quantity: 1, total_price: item.unit_price }
          }));
          onFixIssues?.(fixes);
        }
      });
    }

    // Check for calculation mismatches
    const calculationMismatches = lineItems.filter(item => 
      Math.abs(item.total_price - (item.unit_price * item.quantity)) > 1
    );
    if (calculationMismatches.length > 0) {
      issues.push({
        type: 'warning',
        category: 'Calculation',
        message: `${calculationMismatches.length} items have calculation mismatches`,
        items: calculationMismatches,
        fixable: true,
        autoFixAction: () => {
          const fixes = calculationMismatches.map(item => ({
            itemId: item.id || '',
            fixes: { total_price: item.unit_price * item.quantity }
          }));
          onFixIssues?.(fixes);
        }
      });
    }

    // Check for missing essential categories
    const categories = new Set(lineItems.map(item => item.category));
    const essentialCategories = ['protein', 'service'];
    const missingEssential = essentialCategories.filter(cat => !categories.has(cat));
    
    if (missingEssential.length > 0) {
      issues.push({
        type: 'warning',
        category: 'Completeness',
        message: `Missing essential categories: ${missingEssential.join(', ')}`,
        items: [],
        fixable: false
      });
    }

    // Check for duplicate items
    const itemNames = lineItems.map(item => item.title.toLowerCase());
    const duplicates = lineItems.filter((item, index) => 
      itemNames.indexOf(item.title.toLowerCase()) !== index
    );
    if (duplicates.length > 0) {
      issues.push({
        type: 'warning',
        category: 'Duplicates',
        message: `${duplicates.length} duplicate items found`,
        items: duplicates,
        fixable: false
      });
    }

    // Check pricing reasonableness (per person cost)
    if (guestCount > 0) {
      const totalCost = lineItems.reduce((sum, item) => sum + item.total_price, 0);
      const perPersonCost = totalCost / guestCount;
      
      if (perPersonCost < 1500) { // Less than $15 per person
        issues.push({
          type: 'info',
          category: 'Pricing Analysis',
          message: `Low per-person cost: ${formatCurrency(perPersonCost)} per guest`,
          items: [],
          fixable: false
        });
      } else if (perPersonCost > 8000) { // More than $80 per person
        issues.push({
          type: 'info',
          category: 'Pricing Analysis',
          message: `High per-person cost: ${formatCurrency(perPersonCost)} per guest`,
          items: [],
          fixable: false
        });
      }
    }

    // Check for incomplete item descriptions
    const incompleteDescriptions = lineItems.filter(item => 
      !item.description || item.description.trim().length < 10
    );
    if (incompleteDescriptions.length > 0) {
      issues.push({
        type: 'info',
        category: 'Descriptions',
        message: `${incompleteDescriptions.length} items have incomplete descriptions`,
        items: incompleteDescriptions,
        fixable: false
      });
    }

    return issues;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const getIssueIcon = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getIssueColor = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Pricing': return <DollarSign className="h-4 w-4" />;
      case 'Calculation': return <Calculator className="h-4 w-4" />;
      case 'Quantity': return <Package className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const issues = validatePricing();
  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const infoCount = issues.filter(i => i.type === 'info').length;

  const handleHighlightItems = (items: LineItem[]) => {
    const itemIds = items.map(item => item.id || '').filter(Boolean);
    onHighlightItems?.(itemIds);
  };

  if (issues.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-center">
            <div>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-700 mb-2">
                All Validations Passed
              </h3>
              <p className="text-green-600">
                Your pricing structure looks good! No issues detected.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Pricing Validation
          </div>
          <div className="flex gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive">{errorCount} Errors</Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {warningCount} Warnings
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="outline">{infoCount} Info</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {issues.map((issue, index) => (
          <Alert key={index} className={getIssueColor(issue.type)}>
            <div className="flex items-start gap-3">
              {getIssueIcon(issue.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(issue.category)}
                  <span className="font-medium">{issue.category}</span>
                </div>
                <AlertDescription className="mb-3">
                  {issue.message}
                </AlertDescription>
                
                {issue.items.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-medium">Affected items:</p>
                    <div className="flex flex-wrap gap-2">
                      {issue.items.slice(0, 5).map((item, itemIndex) => (
                        <Badge 
                          key={itemIndex} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => handleHighlightItems([item])}
                        >
                          {item.title}
                        </Badge>
                      ))}
                      {issue.items.length > 5 && (
                        <Badge 
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => handleHighlightItems(issue.items)}
                        >
                          +{issue.items.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {issue.fixable && issue.autoFixAction && (
                    <Button size="sm" onClick={issue.autoFixAction}>
                      Auto-Fix
                    </Button>
                  )}
                  {issue.items.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleHighlightItems(issue.items)}
                    >
                      Highlight Items
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}