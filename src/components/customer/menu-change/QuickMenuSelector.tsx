/**
 * QuickMenuSelector - Simplified menu change interface for customer portal
 * Handles menu swaps with minimal clicks
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UtensilsCrossed, Plus, X, ArrowRight } from 'lucide-react';

interface QuickMenuSelectorProps {
  quote: any;
  onChange: (changes: any) => void;
}

export function QuickMenuSelector({ quote, onChange }: QuickMenuSelectorProps) {
  const [swaps, setSwaps] = useState<{ remove: string; add: string }[]>([]);

  const currentProteins = [
    quote.primary_protein,
    quote.secondary_protein
  ].filter(Boolean);

  const availableProteins = [
    'Fried Chicken',
    'BBQ Chicken',
    'Fried Fish',
    'Baked Fish',
    'Meatloaf',
    'Oxtails',
    'BBQ Ribs',
    'Beef Stroganoff'
  ];

  const handleAddSwap = () => {
    setSwaps([...swaps, { remove: '', add: '' }]);
  };

  const handleUpdateSwap = (index: number, field: 'remove' | 'add', value: string) => {
    const updated = [...swaps];
    updated[index] = { ...updated[index], [field]: value };
    setSwaps(updated);
    
    // Convert to menu_changes format
    const validSwaps = updated.filter(s => s.remove && s.add);
    if (validSwaps.length > 0) {
      onChange({
        proteins: {
          remove: validSwaps.map(s => s.remove),
          add: validSwaps.map(s => s.add)
        }
      });
    }
  };

  const handleRemoveSwap = (index: number) => {
    const updated = swaps.filter((_, i) => i !== index);
    setSwaps(updated);
    
    if (updated.length === 0) {
      onChange(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 font-semibold">
          <UtensilsCrossed className="h-4 w-4" />
          Menu Swaps
        </Label>
        <Badge variant="outline">{swaps.length} swap{swaps.length !== 1 ? 's' : ''}</Badge>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-4 space-y-2">
          <p className="text-sm font-medium">Current Menu:</p>
          <div className="flex flex-wrap gap-2">
            {currentProteins.map((protein, idx) => (
              <Badge key={idx} variant="secondary">{protein}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {swaps.map((swap, index) => (
        <Card key={index} className="bg-background">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">Remove</Label>
                <Select 
                  value={swap.remove} 
                  onValueChange={(v) => handleUpdateSwap(index, 'remove', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item to remove" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentProteins.map((protein) => (
                      <SelectItem key={protein} value={protein}>
                        {protein}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground mt-6" />

              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">Add</Label>
                <Select 
                  value={swap.add} 
                  onValueChange={(v) => handleUpdateSwap(index, 'add', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select replacement" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProteins
                      .filter(p => !currentProteins.includes(p))
                      .map((protein) => (
                        <SelectItem key={protein} value={protein}>
                          {protein}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveSwap(index)}
                className="mt-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button 
        variant="outline" 
        onClick={handleAddSwap} 
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Menu Swap
      </Button>
    </div>
  );
}
