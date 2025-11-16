import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Save } from 'lucide-react';

interface LineItem {
  id?: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
}

interface QuickPricingEditorProps {
  quoteId: string;
  invoiceId: string;
  guestCount: number;
}

export function QuickPricingEditor({ quoteId, invoiceId, guestCount }: QuickPricingEditorProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLineItems();
  }, [invoiceId]);

  const loadLineItems = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('category', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Create default line items
        setLineItems([
          {
            title: 'Catering Service',
            description: 'Food and beverage service',
            quantity: guestCount,
            unit_price: 2500, // $25.00 per person
            total_price: guestCount * 2500,
            category: 'Food & Beverage',
          },
        ]);
      } else {
        setLineItems(data.map(item => ({
          id: item.id,
          title: item.title || '',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          category: item.category || 'Other',
        })));
      }
    } catch (error) {
      console.error('Error loading line items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pricing',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };

    // Recalculate total if quantity or unit price changes
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total_price = updated[index].quantity * updated[index].unit_price;
    }

    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        title: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        category: 'Other',
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Delete existing line items
      if (lineItems.some(item => item.id)) {
        await supabase
          .from('invoice_line_items')
          .delete()
          .eq('invoice_id', invoiceId);
      }

      // Insert updated line items
      const { error } = await supabase
        .from('invoice_line_items')
        .insert(
          lineItems.map(item => ({
            invoice_id: invoiceId,
            title: item.title,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            category: item.category,
          }))
        );

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Pricing updated successfully',
      });

      loadLineItems();
    } catch (error) {
      console.error('Error saving line items:', error);
      toast({
        title: 'Error',
        description: 'Failed to save pricing',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading pricing...</div>;
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
  const tax = Math.round(subtotal * 0.08); // 8% tax
  const total = subtotal + tax;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Pricing Details</h4>
        <div className="flex gap-2">
          <Button onClick={addLineItem} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
          <Button onClick={saveChanges} disabled={saving} size="sm">
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {lineItems.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg border bg-card">
            <div className="col-span-4">
              <Label className="text-xs">Item</Label>
              <Input
                value={item.title}
                onChange={(e) => updateLineItem(index, 'title', e.target.value)}
                placeholder="Item name"
                className="h-8"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Qty</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                className="h-8"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Price</Label>
              <Input
                type="number"
                value={item.unit_price / 100}
                onChange={(e) => updateLineItem(index, 'unit_price', Math.round(parseFloat(e.target.value) * 100) || 0)}
                step="0.01"
                className="h-8"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Total</Label>
              <div className="h-8 flex items-center text-sm font-semibold">
                ${(item.total_price / 100).toFixed(2)}
              </div>
            </div>
            <div className="col-span-2 flex items-end">
              <Button
                onClick={() => removeLineItem(index)}
                variant="ghost"
                size="sm"
                className="h-8 w-full"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-semibold">${(subtotal / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (8%):</span>
          <span className="font-semibold">${(tax / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>Total:</span>
          <span>${(total / 100).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
