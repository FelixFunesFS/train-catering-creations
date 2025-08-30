import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign,
  Plus,
  Trash2,
  Calculator,
  FileText,
  Save
} from 'lucide-react';

interface PricingLineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: 'food' | 'service' | 'equipment' | 'other';
}

interface ManualPricingFormProps {
  quote: any;
  onPricingUpdate?: (total: number) => void;
}

export function ManualPricingForm({ quote, onPricingUpdate }: ManualPricingFormProps) {
  const [lineItems, setLineItems] = useState<PricingLineItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxRate, setTaxRate] = useState(8.5); // Default 8.5% tax
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  // Common line item templates
  const getCommonLineItems = () => [
    { title: 'Per-Person Catering', category: 'food' as const, description: 'Catering service per guest' },
    { title: 'Service Fee', category: 'service' as const, description: 'Professional service and setup' },
    { title: 'Equipment Rental', category: 'equipment' as const, description: 'Tables, chairs, linens, etc.' },
    { title: 'Wait Staff', category: 'service' as const, description: 'Professional wait staff service' },
    { title: 'Delivery Fee', category: 'service' as const, description: 'Delivery and setup' },
    { title: 'Cleanup Service', category: 'service' as const, description: 'Post-event cleanup' }
  ];

  useEffect(() => {
    // Initialize with common line items if empty
    if (lineItems.length === 0) {
      addLineItem('Per-Person Catering', 'food', 'Catering service per guest', quote?.guest_count || 1, 2500);
    }
  }, [quote?.guest_count]);

  useEffect(() => {
    // Recalculate totals when line items change
    const newSubtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
    const newTaxAmount = Math.round(newSubtotal * (taxRate / 100));
    const newTotal = newSubtotal + newTaxAmount;
    
    setSubtotal(newSubtotal);
    setTaxAmount(newTaxAmount);
    setTotal(newTotal);
    
    onPricingUpdate?.(newTotal);
  }, [lineItems, taxRate, onPricingUpdate]);

  const addLineItem = (title = '', category: PricingLineItem['category'] = 'food', description = '', quantity = 1, unitPrice = 0) => {
    const newItem: PricingLineItem = {
      id: Date.now().toString(),
      title,
      description,
      quantity,
      unit_price: unitPrice,
      total_price: quantity * unitPrice,
      category
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof PricingLineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updated.total_price = updated.quantity * updated.unit_price;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const quickCalculatePerPerson = () => {
    if (!quote?.guest_count) {
      toast({
        title: "Guest Count Required",
        description: "Please ensure guest count is set in the quote details",
        variant: "destructive"
      });
      return;
    }

    // Quick per-person calculation
    const perPersonAmount = 3500; // $35.00 default
    const servicePercentage = 0.15; // 15% service fee
    
    const foodTotal = quote.guest_count * perPersonAmount;
    const serviceTotal = Math.round(foodTotal * servicePercentage);
    
    setLineItems([
      {
        id: '1',
        title: 'Per-Person Catering',
        description: 'Complete catering service per guest',
        quantity: quote.guest_count,
        unit_price: perPersonAmount,
        total_price: foodTotal,
        category: 'food'
      },
      {
        id: '2',
        title: 'Service Fee',
        description: 'Professional service and coordination',
        quantity: 1,
        unit_price: serviceTotal,
        total_price: serviceTotal,
        category: 'service'
      }
    ]);
  };

  // Load existing line items from database
  useEffect(() => {
    const loadLineItems = async () => {
      if (!quote?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('quote_line_items')
          .select('*')
          .eq('quote_request_id', quote.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setLineItems(data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            category: item.category as PricingLineItem['category']
          })));
        }
      } catch (error) {
        console.error('Error loading line items:', error);
      }
    };

    loadLineItems();
  }, [quote?.id]);

  // Auto-save line items to database
  const saveLineItemsToDatabase = async (items: PricingLineItem[]) => {
    if (!quote?.id) return;

    try {
      // Delete existing line items
      await supabase
        .from('quote_line_items')
        .delete()
        .eq('quote_request_id', quote.id);

      // Insert new line items if any exist
      if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
          quote_request_id: quote.id,
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          category: item.category
        }));

        const { error } = await supabase
          .from('quote_line_items')
          .insert(itemsToInsert);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving line items:', error);
    }
  };

  // Auto-save when line items change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (lineItems.length > 0) {
        saveLineItemsToDatabase(lineItems);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [lineItems, quote?.id]);

  const markStepCompleted = async (stepId: string, stepName: string) => {
    if (!quote?.id) return;

    try {
      await supabase
        .from('workflow_step_completion')
        .upsert({
          quote_request_id: quote.id,
          step_id: stepId,
          step_name: stepName,
          completed_by: 'admin'
        }, {
          onConflict: 'quote_request_id,step_id'
        });
    } catch (error) {
      console.error('Error marking step completed:', error);
    }
  };

  const savePricing = async () => {
    setLoading(true);
    try {
      // Save line items to database
      await saveLineItemsToDatabase(lineItems);
      
      // Update quote with estimated total
      const { error } = await supabase
        .from('quote_requests')
        .update({ 
          estimated_total: total,
          updated_at: new Date().toISOString()
        })
        .eq('id', quote.id);

      if (error) throw error;

      // Mark pricing step as completed
      await markStepCompleted('pricing_completed', 'Pricing Completed');

      toast({
        title: "Pricing Saved",
        description: "Pricing information has been saved successfully",
      });

      // Trigger pricing completion callback
      onPricingUpdate?.(total);
    } catch (error: any) {
      console.error('Error saving pricing:', error);
      toast({
        title: "Error",
        description: "Failed to save pricing information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'service': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'equipment': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Manual Pricing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={quickCalculatePerPerson}
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Quick Per-Person ({quote?.guest_count || 0} guests)
          </Button>
          
          {getCommonLineItems().map((template, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => addLineItem(template.title, template.category, template.description)}
            >
              + {template.title}
            </Button>
          ))}
        </div>

        {/* Line Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Line Items</h4>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => addLineItem()}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          {lineItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-3 p-4 border rounded-lg">
              <div className="col-span-4 space-y-2">
                <Label className="text-xs">Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) => updateLineItem(item.id, 'title', e.target.value)}
                  placeholder="Item title"
                />
                <Badge className={getCategoryColor(item.category)} variant="outline">
                  {item.category}
                </Badge>
              </div>
              
              <div className="col-span-3 space-y-2">
                <Label className="text-xs">Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  placeholder="Description"
                />
              </div>
              
              <div className="col-span-1 space-y-2">
                <Label className="text-xs">Qty</Label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label className="text-xs">Unit Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={(item.unit_price / 100).toFixed(2)}
                    onChange={(e) => updateLineItem(item.id, 'unit_price', Math.round(parseFloat(e.target.value || '0') * 100))}
                    className="pl-7"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="col-span-1 space-y-2">
                <Label className="text-xs">Total</Label>
                <div className="pt-2 text-sm font-medium">
                  ${(item.total_price / 100).toFixed(2)}
                </div>
              </div>
              
              <div className="col-span-1 flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeLineItem(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Subtotal:</span>
            <span className="font-medium">${(subtotal / 100).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm">Tax Rate:</span>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-20 h-7 text-sm"
                step="0.1"
                min="0"
                max="20"
              />
              <span className="text-sm">%</span>
            </div>
            <span className="font-medium">${(taxAmount / 100).toFixed(2)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total:</span>
            <span className="text-green-600">${(total / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Pricing Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any pricing notes or special considerations..."
            rows={3}
          />
        </div>

        {/* Save Button */}
        <Button 
          onClick={savePricing}
          disabled={loading || total === 0}
          className="w-full"
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Pricing'}
        </Button>
      </CardContent>
    </Card>
  );
}