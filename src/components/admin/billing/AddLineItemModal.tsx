import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateLineItems } from '@/hooks/useLineItems';
import { Loader2 } from 'lucide-react';

interface AddLineItemModalProps {
  invoiceId: string;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'service', label: 'Service' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'other', label: 'Other' },
];

export function AddLineItemModal({ invoiceId, onClose }: AddLineItemModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('0.00');
  const [category, setCategory] = useState('food');

  const createLineItems = useCreateLineItems();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceCents = Math.round(parseFloat(unitPrice) * 100);
    
    await createLineItems.mutateAsync({
      invoiceId,
      items: [{
        title,
        description,
        quantity,
        unit_price: priceCents,
        total_price: priceCents * quantity,
        category,
      }],
    });
    
    onClose();
  };

  const isValid = title.trim() && quantity > 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Line Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Additional Appetizers"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Fried Green Tomatoes, Hushpuppies"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price ($)</Label>
              <Input
                id="unitPrice"
                type="text"
                inputMode="decimal"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || createLineItems.isPending}>
              {createLineItems.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
