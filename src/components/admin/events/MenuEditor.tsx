import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MultiSelect } from '@/components/ui/multi-select';
import { useUpdateQuote } from '@/hooks/useQuotes';
import { useRegenerateLineItems } from '@/hooks/useRegenerateLineItems';
import { Loader2, Save, Leaf } from 'lucide-react';
import { getMenuItems, additionalMenuItems } from '@/data/menuData';
import type { Option } from '@/components/ui/multi-select';

interface MenuEditorProps {
  quote: any;
  invoiceId: string;
  onSave: () => void;
}

// Protein options
const REGULAR_PROTEINS = [
  { id: "fried-chicken", name: "Fried Chicken" },
  { id: "bbq-chicken", name: "BBQ Chicken" },
  { id: "baked-chicken", name: "Baked Chicken" },
  { id: "chicken-tenders", name: "Chicken Tenders" },
  { id: "turkey-wings", name: "Turkey Wings" },
  { id: "chicken-alfredo", name: "Chicken Alfredo" },
  { id: "chicken-wings", name: "Chicken Wings" },
  { id: "pulled-pork", name: "Pulled Pork" },
  { id: "brisket", name: "Beef Brisket" },
  { id: "ribs", name: "BBQ Ribs" },
  { id: "smoked-sausage", name: "Smoked Sausage" },
  { id: "fried-pork-chops", name: "Fried Pork Chops" },
  { id: "smothered-pork-chops", name: "Smothered Pork Chops" },
  { id: "meatloaf", name: "Meatloaf" },
  { id: "hamburgers", name: "Hamburgers" },
  { id: "spaghetti", name: "Spaghetti" },
  { id: "lasagna", name: "Lasagna" },
  { id: "tacos", name: "Tacos" },
  { id: "catfish", name: "Fried Catfish" },
  { id: "shrimp-alfredo", name: "Shrimp Alfredo" },
  { id: "low-country-boil", name: "Low Country Boil" },
  { id: "crabs", name: "Crabs" },
  { id: "fried-fish", name: "Fried Fish" },
];

const WEDDING_PROTEINS = [
  { id: "herb-roasted-chicken", name: "Herb-Roasted Chicken Breast" },
  { id: "chicken-marsala", name: "Chicken Marsala" },
  { id: "stuffed-chicken", name: "Stuffed Chicken Breast" },
  { id: "cornish-hen", name: "Cornish Hen" },
  { id: "filet-mignon", name: "Filet Mignon" },
  { id: "beef-wellington", name: "Beef Wellington" },
  { id: "prime-rib", name: "Prime Rib" },
  { id: "ribeye-steak", name: "Ribeye Steak" },
  { id: "short-ribs", name: "Braised Short Ribs" },
  { id: "lobster-tail", name: "Lobster Tail" },
  { id: "crab-cakes", name: "Jumbo Lump Crab Cakes" },
  { id: "grilled-salmon", name: "Grilled Salmon" },
  { id: "shrimp-scampi", name: "Shrimp Scampi" },
  { id: "seafood-medley", name: "Seafood Medley" },
  { id: "sea-bass", name: "Chilean Sea Bass" },
];

const REGULAR_VEGETARIAN = [
  { id: "quinoa-power-bowl", name: "Quinoa Power Bowl" },
  { id: "stuffed-bell-peppers", name: "Stuffed Bell Peppers" },
  { id: "black-bean-burgers", name: "Black Bean Burgers" },
  { id: "roasted-vegetable-medley", name: "Roasted Vegetable Medley" },
  { id: "veggie-pasta-primavera", name: "Veggie Pasta Primavera" },
  { id: "garden-stir-fry", name: "Garden Stir Fry" },
];

const WEDDING_VEGETARIAN = [
  { id: "stuffed-portobello", name: "Stuffed Portobello Mushroom" },
  { id: "vegetable-wellington", name: "Vegetable Wellington" },
  { id: "eggplant-parmesan", name: "Eggplant Parmesan" },
  { id: "wild-mushroom-risotto", name: "Wild Mushroom Risotto" },
  { id: "butternut-squash-ravioli", name: "Butternut Squash Ravioli" },
];

export function MenuEditor({ quote, invoiceId, onSave }: MenuEditorProps) {
  const isWedding = quote?.event_type === 'wedding';
  const menuItems = getMenuItems(isWedding ? 'wedding' : 'regular');
  
  const PROTEINS = isWedding ? WEDDING_PROTEINS : REGULAR_PROTEINS;
  const VEGETARIAN = isWedding ? WEDDING_VEGETARIAN : REGULAR_VEGETARIAN;
  
  const parseArray = (val: any): string[] => Array.isArray(val) ? val : [];
  
  const [formData, setFormData] = useState({
    proteins: parseArray(quote?.proteins),
    sides: parseArray(quote?.sides),
    appetizers: parseArray(quote?.appetizers),
    desserts: parseArray(quote?.desserts),
    drinks: parseArray(quote?.drinks),
    vegetarian_entrees: parseArray(quote?.vegetarian_entrees),
    guest_count_with_restrictions: quote?.guest_count_with_restrictions || '',
    special_requests: quote?.special_requests || '',
    both_proteins_available: quote?.both_proteins_available || false,
  });

  const updateQuote = useUpdateQuote();
  const regenerateLineItems = useRegenerateLineItems();
  const isLoading = updateQuote.isPending || regenerateLineItems.isPending;

  const handleSubmit = async () => {
    await updateQuote.mutateAsync({ quoteId: quote.id, updates: formData });
    await regenerateLineItems.mutateAsync({ invoiceId, quoteId: quote.id });
    onSave();
  };

  const proteinOptions: Option[] = PROTEINS.map(p => ({ value: p.id, label: p.name }));
  const vegetarianOptions: Option[] = VEGETARIAN.map(v => ({ value: v.id, label: v.name }));
  const sidesOptions: Option[] = menuItems.sides.map(s => ({ value: s.id, label: s.name }));
  const appetizerOptions: Option[] = menuItems.appetizers.map(a => ({ value: a.id, label: a.name }));
  const dessertOptions: Option[] = menuItems.desserts.map(d => ({ value: d.id, label: d.name }));
  const drinkOptions: Option[] = additionalMenuItems.drinks.map(d => ({ value: d.id, label: d.name }));

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Proteins */}
      <div className="space-y-2">
        <Label>Proteins</Label>
        <MultiSelect
          options={proteinOptions}
          selected={formData.proteins}
          onChange={(val) => setFormData(prev => ({ ...prev, proteins: val }))}
          placeholder="Select proteins..."
        />
        <div className="flex items-center gap-2 mt-2">
          <Checkbox 
            id="both-proteins"
            checked={formData.both_proteins_available}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, both_proteins_available: !!checked }))}
          />
          <Label htmlFor="both-proteins" className="text-sm cursor-pointer">
            Serve both proteins to all guests
          </Label>
        </div>
      </div>

      {/* Vegetarian Section */}
      <div className="space-y-2 border-l-2 border-green-500 pl-3 py-2 bg-green-50/50 dark:bg-green-950/20 rounded-r">
        <Label className="flex items-center gap-1 text-green-700 dark:text-green-400">
          <Leaf className="h-4 w-4" /> Vegetarian Options
        </Label>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Vegetarian Portion Count</Label>
          <Input
            type="text"
            value={formData.guest_count_with_restrictions}
            onChange={(e) => setFormData(prev => ({ ...prev, guest_count_with_restrictions: e.target.value }))}
            placeholder="e.g. 5"
            className="max-w-[120px]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Vegetarian Entrées</Label>
          <MultiSelect
            options={vegetarianOptions}
            selected={formData.vegetarian_entrees}
            onChange={(val) => setFormData(prev => ({ ...prev, vegetarian_entrees: val }))}
            placeholder="Select vegetarian entrées..."
          />
        </div>
      </div>

      {/* Sides */}
      <div className="space-y-2">
        <Label>Sides</Label>
        <MultiSelect
          options={sidesOptions}
          selected={formData.sides}
          onChange={(val) => setFormData(prev => ({ ...prev, sides: val }))}
          placeholder="Select sides..."
        />
      </div>

      {/* Appetizers */}
      <div className="space-y-2">
        <Label>Appetizers</Label>
        <MultiSelect
          options={appetizerOptions}
          selected={formData.appetizers}
          onChange={(val) => setFormData(prev => ({ ...prev, appetizers: val }))}
          placeholder="Select appetizers..."
        />
      </div>

      {/* Desserts */}
      <div className="space-y-2">
        <Label>Desserts</Label>
        <MultiSelect
          options={dessertOptions}
          selected={formData.desserts}
          onChange={(val) => setFormData(prev => ({ ...prev, desserts: val }))}
          placeholder="Select desserts..."
        />
      </div>

      {/* Beverages */}
      <div className="space-y-2">
        <Label>Beverages</Label>
        <MultiSelect
          options={drinkOptions}
          selected={formData.drinks}
          onChange={(val) => setFormData(prev => ({ ...prev, drinks: val }))}
          placeholder="Select beverages..."
        />
      </div>

      {/* Special Requests */}
      <div className="space-y-2">
        <Label>Special Requests</Label>
        <Textarea
          value={formData.special_requests}
          onChange={(e) => setFormData(prev => ({ ...prev, special_requests: e.target.value }))}
          placeholder="Any special requests or dietary notes..."
          rows={3}
        />
      </div>

      {/* Submit */}
      <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        Save & Update Estimate
      </Button>
    </div>
  );
}
