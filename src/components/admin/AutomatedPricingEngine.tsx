import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Calculator,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { calculateAutomatedPricing, validateQuote, PricingCalculation, ValidationResult } from '@/utils/businessLogic';

interface AutomatedPricingEngineProps {
  quote: any;
  onPricingUpdate: (pricing: PricingCalculation) => void;
  onValidationComplete: (validation: ValidationResult) => void;
}

export function AutomatedPricingEngine({ quote, onPricingUpdate, onValidationComplete }: AutomatedPricingEngineProps) {
  const [pricing, setPricing] = useState<PricingCalculation | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (quote) {
      runAutomatedPricing();
      runValidation();
    }
  }, [quote]);

  const runAutomatedPricing = async () => {
    setLoading(true);
    try {
      const pricingResult = await calculateAutomatedPricing(quote);
      setPricing(pricingResult);
      onPricingUpdate(pricingResult);
    } catch (error) {
      console.error('Error calculating pricing:', error);
      toast({
        title: "Pricing Error",
        description: "Unable to calculate automated pricing",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runValidation = () => {
    const validationResult = validateQuote(quote);
    setValidation(validationResult);
    onValidationComplete(validationResult);
  };

  const applyOverride = (category: string, newPrice: number) => {
    if (!pricing) return;

    const updatedOverrides = { ...overrides, [category]: newPrice };
    setOverrides(updatedOverrides);

    // Recalculate totals with overrides
    const updatedBreakdown = pricing.breakdown.map(item => {
      if (item.category === category) {
        return { ...item, total_price: newPrice };
      }
      return item;
    });

    const newSubtotal = updatedBreakdown.reduce((sum, item) => sum + item.total_price, 0);
    const newTaxAmount = Math.round(newSubtotal * 0.08);
    const newTotal = newSubtotal + newTaxAmount;

    const updatedPricing: PricingCalculation = {
      ...pricing,
      breakdown: updatedBreakdown,
      subtotal: newSubtotal,
      tax_amount: newTaxAmount,
      total_amount: newTotal
    };

    setPricing(updatedPricing);
    onPricingUpdate(updatedPricing);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getValidationIcon = (type: 'error' | 'warning' | 'suggestion') => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'suggestion':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Results */}
      {validation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validation.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Quote Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {validation.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">Errors</h4>
                <div className="space-y-1">
                  {validation.errors.map((error, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {getValidationIcon('error')}
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-700 dark:text-yellow-300 mb-2">Warnings</h4>
                <div className="space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {getValidationIcon('warning')}
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validation.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Suggestions</h4>
                <div className="space-y-1">
                  {validation.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {getValidationIcon('suggestion')}
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validation.isValid && validation.warnings.length === 0 && validation.suggestions.length === 0 && (
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Quote validation passed successfully</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pricing Calculation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Automated Pricing
            <Button
              variant="outline"
              size="sm"
              onClick={runAutomatedPricing}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Recalculate
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : pricing ? (
            <div className="space-y-4">
              {/* Pricing Breakdown */}
              <div className="space-y-3">
                <h4 className="font-medium">Pricing Breakdown</h4>
                {pricing.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unit_price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {item.category}
                      </Badge>
                      <div className="w-24">
                        <Input
                          type="number"
                          value={overrides[item.category] || item.total_price}
                          onChange={(e) => applyOverride(item.category, parseInt(e.target.value) || 0)}
                          className="text-right"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span className="font-medium">{formatCurrency(pricing.tax_amount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(pricing.total_amount)}</span>
                </div>
              </div>

              {/* Per Person Cost */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Per Guest: {formatCurrency(pricing.total_amount / quote.guest_count)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Unable to calculate pricing</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Insights */}
      {pricing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pricing Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-lg font-bold">{formatCurrency(pricing.per_person_price)}</div>
                <div className="text-sm text-muted-foreground">Per Guest</div>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-lg font-bold">{quote.guest_count}</div>
                <div className="text-sm text-muted-foreground">Total Guests</div>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-lg font-bold">
                  {((pricing.service_charge / pricing.subtotal) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Service Fee</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}