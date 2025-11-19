import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, AlertCircle, DollarSign, Percent } from "lucide-react";
import { PricingCalculation } from "@/services/PricingEngine";
import { formatCurrency } from "@/lib/utils";

interface PricingBreakdownProps {
  calculation: PricingCalculation;
  className?: string;
}

export const PricingBreakdown = ({ calculation, className }: PricingBreakdownProps) => {
  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
    const variants = {
      high: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-red-100 text-red-700'
    };
    return (
      <Badge className={variants[confidence]}>
        {confidence} confidence
      </Badge>
    );
  };

  const confidencePercent = Math.round(calculation.confidenceScore * 100);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Smart Pricing Breakdown
          </CardTitle>
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {confidencePercent}% Confidence
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Line Items */}
        <div className="space-y-3">
          {calculation.lineItems.map((item, index) => (
            <div key={index} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/30">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{item.description}</span>
                  {getConfidenceBadge(item.confidence)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                </div>
                {item.notes && (
                  <div className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    {item.notes}
                  </div>
                )}
              </div>
              <div className="font-semibold">{formatCurrency(item.total)}</div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(calculation.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax ({(calculation.taxRate * 100).toFixed(0)}%)</span>
            <span className="font-medium">{formatCurrency(calculation.taxAmount)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(calculation.total)}</span>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-primary/5 p-3 rounded-lg flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm">
            Estimated Profit Margin: <strong>{calculation.profitMargin.toFixed(1)}%</strong>
          </span>
        </div>

        {/* Suggestions */}
        {calculation.suggestions.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-yellow-800 font-medium">
              <AlertCircle className="h-4 w-4" />
              Suggestions
            </div>
            <ul className="text-sm text-yellow-700 space-y-1 ml-6 list-disc">
              {calculation.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
