import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calculator, CheckCircle, AlertCircle } from 'lucide-react';

interface PricingProgressCardProps {
  lineItems: any[];
  totalAmount: number;
}

export function PricingProgressCard({ lineItems, totalAmount }: PricingProgressCardProps) {
  const pricedItems = lineItems.filter(item => item.unit_price > 0);
  const unpricedItems = lineItems.filter(item => item.unit_price === 0);
  const progressPercentage = lineItems.length > 0 ? (pricedItems.length / lineItems.length) * 100 : 0;
  const isComplete = progressPercentage === 100 && totalAmount > 0;

  return (
    <Card className={`transition-colors ${isComplete ? 'border-green-200 bg-green-50/50' : 'border-orange-200 bg-orange-50/50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Calculator className="h-4 w-4 text-orange-600" />
            )}
            <span className="font-medium">
              {isComplete ? 'Pricing Complete' : 'Pricing Progress'}
            </span>
          </div>
          <Badge variant={isComplete ? "default" : "secondary"}>
            {pricedItems.length}/{lineItems.length}
          </Badge>
        </div>
        
        <Progress value={progressPercentage} className="mb-3" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Priced Items</div>
            <div className="font-medium text-green-600">{pricedItems.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Needs Pricing</div>
            <div className="font-medium text-orange-600">{unpricedItems.length}</div>
          </div>
        </div>
        
        {!isComplete && unpricedItems.length > 0 && (
          <div className="mt-3 p-2 bg-orange-100 rounded text-xs">
            <div className="flex items-center gap-1 text-orange-700">
              <AlertCircle className="h-3 w-3" />
              <span className="font-medium">Items needing pricing:</span>
            </div>
            <div className="mt-1 text-orange-600">
              {unpricedItems.slice(0, 3).map(item => item.description.split(' ').slice(0, 3).join(' ')).join(', ')}
              {unpricedItems.length > 3 && ` and ${unpricedItems.length - 3} more...`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}