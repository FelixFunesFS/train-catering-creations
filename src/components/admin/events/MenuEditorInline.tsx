import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckboxCardGrid, CardOption } from '@/components/ui/checkbox-card-grid';
import { useUpdateQuote } from '@/hooks/useQuotes';
import { useRegenerateLineItems } from '@/hooks/useRegenerateLineItems';
import { Loader2, Save, Leaf, ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { getMenuItems, additionalMenuItems } from '@/data/menuData';
import { cn } from '@/lib/utils';
import { ChangeContextModal } from './ChangeContextModal';
import { detectChanges, ChangeItem, ChangeContext } from '@/utils/changeSummaryGenerator';
import { HistoryLogger } from '@/services/HistoryLogger';

interface MenuEditorInlineProps {
  quote: any;
  invoiceId: string;
  onSave: () => void;
}

// Protein options
const REGULAR_PROTEINS: CardOption[] = [
  { id: "fried-chicken", name: "Fried Chicken", isPopular: true },
  { id: "bbq-chicken", name: "BBQ Chicken", isPopular: true },
  { id: "baked-chicken", name: "Baked Chicken" },
  { id: "chicken-tenders", name: "Chicken Tenders" },
  { id: "turkey-wings", name: "Turkey Wings" },
  { id: "chicken-alfredo", name: "Chicken Alfredo" },
  { id: "chicken-wings", name: "Chicken Wings" },
  { id: "pulled-pork", name: "Pulled Pork", isPopular: true },
  { id: "brisket", name: "Beef Brisket", isPremium: true },
  { id: "ribs", name: "BBQ Ribs", isPremium: true },
  { id: "smoked-sausage", name: "Smoked Sausage" },
  { id: "fried-pork-chops", name: "Fried Pork Chops" },
  { id: "smothered-pork-chops", name: "Smothered Pork Chops" },
  { id: "meatloaf", name: "Meatloaf" },
  { id: "hamburgers", name: "Hamburgers" },
  { id: "spaghetti", name: "Spaghetti" },
  { id: "lasagna", name: "Lasagna" },
  { id: "tacos", name: "Tacos" },
  { id: "catfish", name: "Fried Catfish" },
  { id: "shrimp-alfredo", name: "Shrimp Alfredo", isPremium: true },
  { id: "low-country-boil", name: "Low Country Boil", isPremium: true },
  { id: "crabs", name: "Crabs", isPremium: true },
  { id: "fried-fish", name: "Fried Fish" },
];

const WEDDING_PROTEINS: CardOption[] = [
  { id: "applewood-herb-chicken", name: "Applewood-Smoked Herb Chicken", isPopular: true },
  { id: "hickory-beef-brisket", name: "Hickory-Smoked Beef Brisket", isPopular: true },
  { id: "honey-bourbon-ham", name: "Glazed Honey-Bourbon Ham" },
  { id: "lemon-honey-salmon", name: "Lemon-Honey Seared Salmon", isPremium: true },
  { id: "pulled-pork-shoulder", name: "Hand-Pulled Smoked Pork Shoulder" },
  { id: "honey-glazed-ribs", name: "Honey-Glazed Ribs" },
  { id: "cajun-turkey-wings", name: "Cajun Slow Cooked Turkey Wings" },
  { id: "fettuccine-alfredo", name: "Creamy Fettuccine Alfredo" },
  { id: "glazed-meatloaf", name: "Homestyle Glazed Meatloaf" },
  { id: "smothered-pork-chops", name: "Smothered Pork Chops" },
  { id: "buttermilk-fried-chicken", name: "Buttermilk Fried Chicken", isPopular: true },
  { id: "lowcountry-boil", name: "Signature Lowcountry Boil", isPremium: true },
];

const REGULAR_VEGETARIAN: CardOption[] = [
  { id: "quinoa-power-bowl", name: "Quinoa Power Bowl", isDietary: true },
  { id: "stuffed-bell-peppers", name: "Stuffed Bell Peppers", isDietary: true },
  { id: "black-bean-burgers", name: "Black Bean Burgers", isDietary: true },
  { id: "roasted-vegetable-medley", name: "Roasted Vegetable Medley", isDietary: true },
  { id: "veggie-pasta-primavera", name: "Veggie Pasta Primavera", isDietary: true },
  { id: "garden-stir-fry", name: "Garden Stir Fry", isDietary: true },
];

const WEDDING_VEGETARIAN: CardOption[] = [
  { id: "vegetable-fettuccine-alfredo", name: "Creamy Vegetable Fettuccine Alfredo", isDietary: true },
  { id: "stuffed-portobello", name: "Herb-Stuffed Portobello Mushroom", isDietary: true },
  { id: "roasted-vegetable-medley", name: "Roasted Garden Vegetable Medley", isDietary: true },
  { id: "southern-veggie-plate", name: "Southern Vegetable Plate", isDietary: true },
  { id: "honey-glazed-carrots-yams", name: "Honey-Glazed Carrots & Yams", isDietary: true },
  { id: "caprese-stuffed-tomatoes", name: "Caprese Stuffed Heirloom Tomatoes", isDietary: true },
];

const SUPPLY_ITEMS: CardOption[] = [
  { id: 'plates', name: 'Disposable Plates' },
  { id: 'cups', name: 'Disposable Cups' },
  { id: 'napkins', name: 'Napkins' },
  { id: 'serving_utensils', name: 'Serving Utensils' },
  { id: 'chafers', name: 'Chafing Dishes with Fuel' },
  { id: 'ice', name: 'Ice' },
];

const TRACKED_FIELDS = [
  'proteins', 'sides', 'appetizers', 'desserts', 'drinks', 
  'vegetarian_entrees', 'guest_count_with_restrictions', 
  'special_requests', 'both_proteins_available'
];

interface CategorySectionProps {
  title: string;
  icon?: React.ReactNode;
  options: CardOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  showLimit?: number;
  defaultOpen?: boolean;
  className?: string;
}

function CategorySection({ 
  title, 
  icon, 
  options, 
  selected, 
  onChange, 
  showLimit = 6, 
  defaultOpen = false,
  className 
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn("border rounded-lg", className)}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          {icon}
          <span className="font-medium">{title}</span>
        </div>
        {selected.length > 0 && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {selected.length} selected
          </span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        <CheckboxCardGrid
          options={options}
          selected={selected}
          onChange={onChange}
          columns={2}
          showLimit={showLimit}
          categoryLabel={title}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}

export function MenuEditorInline({ quote, invoiceId, onSave }: MenuEditorInlineProps) {
  const isWedding = quote?.event_type === 'wedding';
  const menuItems = getMenuItems(isWedding ? 'wedding' : 'regular');
  
  const PROTEINS = isWedding ? WEDDING_PROTEINS : REGULAR_PROTEINS;
  const VEGETARIAN = isWedding ? WEDDING_VEGETARIAN : REGULAR_VEGETARIAN;
  
  const parseArray = (val: any): string[] => Array.isArray(val) ? val : [];
  
  const getInitialSupplies = () => {
    const supplies: string[] = [];
    if (quote?.plates_requested) supplies.push('plates');
    if (quote?.cups_requested) supplies.push('cups');
    if (quote?.napkins_requested) supplies.push('napkins');
    if (quote?.serving_utensils_requested) supplies.push('serving_utensils');
    if (quote?.chafers_requested) supplies.push('chafers');
    if (quote?.ice_requested) supplies.push('ice');
    return supplies;
  };

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
    supplies: getInitialSupplies(),
  });

  // Store original for change detection
  const originalData = useMemo(() => ({
    proteins: parseArray(quote?.proteins),
    sides: parseArray(quote?.sides),
    appetizers: parseArray(quote?.appetizers),
    desserts: parseArray(quote?.desserts),
    drinks: parseArray(quote?.drinks),
    vegetarian_entrees: parseArray(quote?.vegetarian_entrees),
    guest_count_with_restrictions: quote?.guest_count_with_restrictions || '',
    special_requests: quote?.special_requests || '',
    both_proteins_available: quote?.both_proteins_available || false,
  }), [quote]);

  const [showChangeModal, setShowChangeModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<ChangeItem[]>([]);
  const [isLogging, setIsLogging] = useState(false);

  const updateQuote = useUpdateQuote();
  const regenerateLineItems = useRegenerateLineItems();
  const isLoading = updateQuote.isPending || regenerateLineItems.isPending || isLogging;
  const historyLogger = useMemo(() => new HistoryLogger(), []);

  const handleSubmit = async () => {
    // Detect changes (excluding supplies which are separate fields)
    const changes = detectChanges(originalData, formData, TRACKED_FIELDS);
    
    if (changes.length > 0) {
      setPendingChanges(changes);
      setShowChangeModal(true);
    } else {
      await saveChanges();
    }
  };

  const saveChanges = async () => {
    // Convert supplies array back to individual booleans
    const suppliesUpdate = {
      plates_requested: formData.supplies.includes('plates'),
      cups_requested: formData.supplies.includes('cups'),
      napkins_requested: formData.supplies.includes('napkins'),
      serving_utensils_requested: formData.supplies.includes('serving_utensils'),
      chafers_requested: formData.supplies.includes('chafers'),
      ice_requested: formData.supplies.includes('ice'),
    };
    
    const { supplies, ...menuData } = formData;
    await updateQuote.mutateAsync({ quoteId: quote.id, updates: { ...menuData, ...suppliesUpdate } });
    await regenerateLineItems.mutateAsync({ invoiceId, quoteId: quote.id });
    onSave();
  };

  const handleConfirmChange = async (context: ChangeContext) => {
    setIsLogging(true);
    try {
      // Log changes with context
      await historyLogger.logChangeWithContext(
        quote.id,
        invoiceId,
        pendingChanges,
        context
      );

      // Save the actual changes
      await saveChanges();
      setShowChangeModal(false);
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsLogging(false);
    }
  };

  // Convert menu items to CardOption format
  const sidesOptions: CardOption[] = menuItems.sides.map(s => ({ id: s.id, name: s.name }));
  const appetizerOptions: CardOption[] = menuItems.appetizers.map(a => ({ id: a.id, name: a.name }));
  const dessertOptions: CardOption[] = menuItems.desserts.map(d => ({ id: d.id, name: d.name }));
  const drinkOptions: CardOption[] = additionalMenuItems.drinks.map(d => ({ id: d.id, name: d.name }));

  return (
    <>
      <ScrollArea className="max-h-[calc(90vh-8rem)] sm:max-h-[calc(85vh-8rem)]">
        <div className="space-y-4 pr-4">
          {/* Proteins */}
          <CategorySection
            title="Proteins"
            options={PROTEINS}
            selected={formData.proteins}
            onChange={(val) => setFormData(prev => ({ ...prev, proteins: val }))}
            showLimit={8}
            defaultOpen={false}
          />
          
          {/* Both Proteins Toggle */}
          <div 
            className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
            onClick={() => setFormData(prev => ({ ...prev, both_proteins_available: !prev.both_proteins_available }))}
          >
            {formData.both_proteins_available ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="text-sm">Serve both proteins to all guests</span>
          </div>

          {/* Vegetarian Section */}
          <div className="border-l-2 border-green-500 rounded-r-lg bg-green-50/50 dark:bg-green-950/20">
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-green-100/50 dark:hover:bg-green-900/30 rounded-r-lg">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-400">Vegetarian Options</span>
                </div>
                {(formData.vegetarian_entrees.length > 0 || formData.guest_count_with_restrictions) && (
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                    {formData.vegetarian_entrees.length} entrées
                  </span>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3 space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-green-700 dark:text-green-400">Vegetarian Portion Count</Label>
                  <Input
                    type="text"
                    value={formData.guest_count_with_restrictions}
                    onChange={(e) => setFormData(prev => ({ ...prev, guest_count_with_restrictions: e.target.value }))}
                    placeholder="e.g. 5"
                    className="max-w-[120px] border-green-300 dark:border-green-700"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-green-700 dark:text-green-400">Vegetarian Entrées</Label>
                  <CheckboxCardGrid
                    options={VEGETARIAN}
                    selected={formData.vegetarian_entrees}
                    onChange={(val) => setFormData(prev => ({ ...prev, vegetarian_entrees: val }))}
                    columns={1}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Sides */}
          <CategorySection
            title="Sides"
            options={sidesOptions}
            selected={formData.sides}
            onChange={(val) => setFormData(prev => ({ ...prev, sides: val }))}
            showLimit={6}
          />

          {/* Appetizers */}
          <CategorySection
            title="Appetizers"
            options={appetizerOptions}
            selected={formData.appetizers}
            onChange={(val) => setFormData(prev => ({ ...prev, appetizers: val }))}
            showLimit={6}
          />

          {/* Desserts */}
          <CategorySection
            title="Desserts"
            options={dessertOptions}
            selected={formData.desserts}
            onChange={(val) => setFormData(prev => ({ ...prev, desserts: val }))}
            showLimit={6}
          />

          {/* Beverages */}
          <CategorySection
            title="Beverages"
            options={drinkOptions}
            selected={formData.drinks}
            onChange={(val) => setFormData(prev => ({ ...prev, drinks: val }))}
            showLimit={6}
          />

          {/* Supply & Equipment */}
          <CategorySection
            title="Supply & Equipment"
            options={SUPPLY_ITEMS}
            selected={formData.supplies}
            onChange={(val) => setFormData(prev => ({ ...prev, supplies: val }))}
            showLimit={6}
          />

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
      </ScrollArea>

      <ChangeContextModal
        open={showChangeModal}
        onClose={() => setShowChangeModal(false)}
        onConfirm={handleConfirmChange}
        changes={pendingChanges}
        isLoading={isLoading}
      />
    </>
  );
}
