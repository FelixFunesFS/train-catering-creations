import React from 'react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus } from 'lucide-react';

interface MenuEditFormProps {
  quote: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const MENU_OPTIONS = {
  appetizers: ['Deviled Eggs', 'Pimento Cheese & Crackers', 'Shrimp & Grits Cups', 'Mini Crab Cakes', 'Bacon Wrapped Scallops'],
  sides: ['Mac & Cheese', 'Collard Greens', 'Red Rice', 'Green Bean Casserole', 'Cornbread', 'Mashed Potatoes'],
  desserts: ['Peach Cobbler', 'Sweet Potato Pie', 'Banana Pudding', 'Red Velvet Cake', 'Pralines'],
  drinks: ['Sweet Tea', 'Lemonade', 'Coffee', 'Punch', 'Water', 'Soda'],
  proteins: ['Fried Chicken', 'BBQ Ribs', 'Shrimp & Grits', 'Catfish', 'Pulled Pork', 'Brisket']
};

export function MenuEditForm({ quote, onSave, onCancel }: MenuEditFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      proteins: quote.proteins || [],
      both_proteins_available: quote.both_proteins_available || false,
      appetizers: quote.appetizers || [],
      sides: quote.sides || [],
      desserts: quote.desserts || [],
      drinks: quote.drinks || [],
      dietary_restrictions: quote.dietary_restrictions || [],
      guest_count_with_restrictions: quote.guest_count_with_restrictions || '',
      custom_menu_requests: quote.custom_menu_requests || ''
    }
  });

  const watchedValues = watch();

  const addMenuItem = (category: keyof typeof watchedValues, item: string) => {
    const current = watchedValues[category] || [];
    if (!current.includes(item)) {
      setValue(category as any, [...current, item]);
    }
  };

  const removeMenuItem = (category: keyof typeof watchedValues, item: string) => {
    const current = watchedValues[category] || [];
    setValue(category as any, current.filter((i: string) => i !== item));
  };

  const addCustomItem = (category: keyof typeof watchedValues, value: string) => {
    if (value.trim()) {
      addMenuItem(category, value.trim());
    }
  };

  const addDietaryRestriction = (restriction: string) => {
    const current = watchedValues.dietary_restrictions || [];
    if (!current.includes(restriction)) {
      setValue('dietary_restrictions', [...current, restriction]);
    }
  };

  const removeDietaryRestriction = (restriction: string) => {
    const current = watchedValues.dietary_restrictions || [];
    setValue('dietary_restrictions', current.filter((r: string) => r !== restriction));
  };

  const onSubmit = (data: any) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Proteins */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Proteins (Max 2)</h3>
          <div>
            <Label>Selected Proteins</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(watchedValues.proteins || []).map((protein: string, idx: number) => (
                <Badge key={idx} variant="default" className="flex items-center gap-1">
                  {protein}
                  <button 
                    type="button"
                    onClick={() => {
                      const updated = (watchedValues.proteins || []).filter((_: string, i: number) => i !== idx);
                      setValue('proteins', updated);
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            {(!watchedValues.proteins || watchedValues.proteins.length < 2) && (
              <Select 
                value=""
                onValueChange={(value) => {
                  const current = watchedValues.proteins || [];
                  if (!current.includes(value) && current.length < 2) {
                    setValue('proteins', [...current, value]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add protein..." />
                </SelectTrigger>
                <SelectContent>
                  {MENU_OPTIONS.proteins.map((protein) => (
                    <SelectItem key={protein} value={protein}>{protein}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="both_proteins" 
              checked={watchedValues.both_proteins_available}
              onCheckedChange={(checked) => setValue('both_proteins_available', checked)}
            />
            <Label htmlFor="both_proteins">Both proteins available for all guests</Label>
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Dietary Restrictions</h3>
          <div className="flex flex-wrap gap-2">
            {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut Allergies'].map((restriction) => (
              <Button
                key={restriction}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addDietaryRestriction(restriction)}
                disabled={watchedValues.dietary_restrictions?.includes(restriction)}
              >
                {restriction}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {watchedValues.dietary_restrictions?.map((restriction: string) => (
              <Badge key={restriction} variant="secondary" className="flex items-center gap-1">
                {restriction}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeDietaryRestriction(restriction)}
                />
              </Badge>
            ))}
          </div>
          <div>
            <Label>Guest Count with Restrictions</Label>
            <Input {...register('guest_count_with_restrictions')} placeholder="e.g., 5 vegetarian, 2 gluten-free" />
          </div>
        </div>
      </div>

      {/* Menu Categories */}
      {Object.entries(MENU_OPTIONS).filter(([key]) => key !== 'proteins').map(([category, options]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold capitalize">{category}</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {options.map((item) => (
              <Button
                key={item}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addMenuItem(category as keyof typeof watchedValues, item)}
                disabled={watchedValues[category]?.includes(item)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {item}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {watchedValues[category]?.map((item: string) => (
              <Badge key={item} variant="default" className="flex items-center gap-1">
                {item}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeMenuItem(category as keyof typeof watchedValues, item)}
                />
              </Badge>
            ))}
          </div>
        </div>
      ))}

      {/* Custom Menu Requests */}
      <div className="space-y-2">
        <Label>Custom Menu Requests</Label>
        <Textarea 
          {...register('custom_menu_requests')}
          placeholder="Special requests, custom items, or modifications..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Menu Changes
        </Button>
      </div>
    </form>
  );
}