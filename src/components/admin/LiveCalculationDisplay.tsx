import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  Calculator,
  Clock,
  CheckCircle
} from 'lucide-react';

interface LiveCalculationDisplayProps {
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  totalAmount: number;
  isCalculating?: boolean;
  lastUpdated?: Date;
  className?: string;
}

export function LiveCalculationDisplay({
  subtotal,
  taxAmount,
  taxRate,
  totalAmount,
  isCalculating = false,
  lastUpdated,
  className = ""
}: LiveCalculationDisplayProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getChangeIndicator = (amount: number, threshold = 0) => {
    if (amount > threshold) {
      return <TrendingUp className="h-4 w-4 text-success" />;
    }
    return null;
  };

  return (
    <Card className={`${className} ${isCalculating ? 'animate-pulse' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Live Calculations</h3>
            </div>
            {isCalculating && (
              <Badge variant="outline" className="animate-fade-in">
                <Clock className="h-3 w-3 mr-1 animate-spin" />
                Calculating...
              </Badge>
            )}
            {!isCalculating && lastUpdated && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-success" />
                Updated {formatTime(lastUpdated)}
              </div>
            )}
          </div>

          {/* Calculations */}
          <div className="space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Subtotal</span>
              </div>
              <div className="flex items-center gap-2">
                {getChangeIndicator(subtotal)}
                <span className="font-mono font-semibold">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            {/* Tax */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Tax ({taxRate}%)</span>
              </div>
              <div className="flex items-center gap-2">
                {getChangeIndicator(taxAmount)}
                <span className="font-mono font-semibold">
                  {formatCurrency(taxAmount)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">Total Amount</span>
              </div>
              <div className="flex items-center gap-2">
                {getChangeIndicator(totalAmount, 1000)}
                <span className="font-mono font-bold text-xl text-primary">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar for Visual Feedback */}
          {isCalculating && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Processing calculations...</span>
                <span>Real-time</span>
              </div>
              <Progress value={85} className="h-1" />
            </div>
          )}

          {/* Breakdown Visualization */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Breakdown</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div 
                  className="h-2 bg-primary rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.max(10, (subtotal / totalAmount) * 100)}%` 
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  Subtotal: {((subtotal / totalAmount) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="h-2 bg-secondary rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.max(5, (taxAmount / totalAmount) * 100)}%` 
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  Tax: {((taxAmount / totalAmount) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}