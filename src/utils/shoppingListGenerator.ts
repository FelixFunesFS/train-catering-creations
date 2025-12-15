/**
 * Shopping List Generator
 * Auto-generates ingredient lists based on menu selections and guest count
 */

export interface ShoppingItem {
  id: string;
  name: string;
  category: 'proteins' | 'produce' | 'dairy' | 'dry_goods' | 'beverages' | 'supplies' | 'equipment' | 'other';
  quantity: string;
  unit: string;
  source: 'auto' | 'manual';
  checked: boolean;
}

export interface QuoteForShopping {
  guest_count: number;
  proteins?: string[];
  sides?: string[];
  appetizers?: string[];
  desserts?: string[];
  drinks?: string[];
  vegetarian_entrees?: string[];
  guest_count_with_restrictions?: string | null;
  plates_requested?: boolean;
  cups_requested?: boolean;
  napkins_requested?: boolean;
  serving_utensils_requested?: boolean;
  chafers_requested?: boolean;
  ice_requested?: boolean;
}

// Protein ingredient mappings (per 10 guests)
const proteinIngredients: Record<string, { items: { name: string; qty: number; unit: string; category: ShoppingItem['category'] }[] }> = {
  'pulled-pork': { items: [
    { name: 'Pork Shoulder', qty: 4, unit: 'lbs', category: 'proteins' },
    { name: 'BBQ Sauce', qty: 2, unit: 'cups', category: 'dry_goods' },
  ]},
  'smoked-chicken': { items: [
    { name: 'Whole Chicken', qty: 2, unit: 'each', category: 'proteins' },
    { name: 'Dry Rub Seasoning', qty: 0.5, unit: 'cup', category: 'dry_goods' },
  ]},
  'brisket': { items: [
    { name: 'Beef Brisket', qty: 5, unit: 'lbs', category: 'proteins' },
    { name: 'Beef Rub', qty: 0.5, unit: 'cup', category: 'dry_goods' },
  ]},
  'fried-chicken': { items: [
    { name: 'Chicken Pieces', qty: 3, unit: 'lbs', category: 'proteins' },
    { name: 'Flour', qty: 2, unit: 'cups', category: 'dry_goods' },
    { name: 'Buttermilk', qty: 2, unit: 'cups', category: 'dairy' },
  ]},
  'ribs': { items: [
    { name: 'Spare Ribs', qty: 6, unit: 'lbs', category: 'proteins' },
    { name: 'BBQ Sauce', qty: 2, unit: 'cups', category: 'dry_goods' },
  ]},
  'catfish': { items: [
    { name: 'Catfish Fillets', qty: 3, unit: 'lbs', category: 'proteins' },
    { name: 'Cornmeal', qty: 2, unit: 'cups', category: 'dry_goods' },
  ]},
  'shrimp': { items: [
    { name: 'Shrimp (21-25 count)', qty: 3, unit: 'lbs', category: 'proteins' },
    { name: 'Cocktail Sauce', qty: 1, unit: 'cup', category: 'dry_goods' },
  ]},
};

// Side dish ingredients (per 10 guests)
const sideIngredients: Record<string, { items: { name: string; qty: number; unit: string; category: ShoppingItem['category'] }[] }> = {
  'mac-and-cheese': { items: [
    { name: 'Elbow Macaroni', qty: 1.5, unit: 'lbs', category: 'dry_goods' },
    { name: 'Cheddar Cheese', qty: 1, unit: 'lb', category: 'dairy' },
    { name: 'Milk', qty: 2, unit: 'cups', category: 'dairy' },
    { name: 'Butter', qty: 0.5, unit: 'cup', category: 'dairy' },
  ]},
  'collard-greens': { items: [
    { name: 'Collard Greens', qty: 3, unit: 'bunches', category: 'produce' },
    { name: 'Smoked Ham Hock', qty: 1, unit: 'each', category: 'proteins' },
  ]},
  'coleslaw': { items: [
    { name: 'Cabbage', qty: 1, unit: 'head', category: 'produce' },
    { name: 'Carrots', qty: 2, unit: 'each', category: 'produce' },
    { name: 'Mayo', qty: 1, unit: 'cup', category: 'dry_goods' },
  ]},
  'baked-beans': { items: [
    { name: 'Navy Beans', qty: 2, unit: 'cans', category: 'dry_goods' },
    { name: 'Brown Sugar', qty: 0.5, unit: 'cup', category: 'dry_goods' },
    { name: 'Bacon', qty: 0.5, unit: 'lb', category: 'proteins' },
  ]},
  'cornbread': { items: [
    { name: 'Cornmeal', qty: 2, unit: 'cups', category: 'dry_goods' },
    { name: 'Flour', qty: 1, unit: 'cup', category: 'dry_goods' },
    { name: 'Buttermilk', qty: 1, unit: 'cup', category: 'dairy' },
  ]},
  'potato-salad': { items: [
    { name: 'Potatoes', qty: 3, unit: 'lbs', category: 'produce' },
    { name: 'Eggs', qty: 4, unit: 'each', category: 'dairy' },
    { name: 'Mayo', qty: 1, unit: 'cup', category: 'dry_goods' },
  ]},
  'green-beans': { items: [
    { name: 'Green Beans', qty: 2, unit: 'lbs', category: 'produce' },
    { name: 'Bacon', qty: 0.25, unit: 'lb', category: 'proteins' },
  ]},
  'rice': { items: [
    { name: 'Long Grain Rice', qty: 2, unit: 'cups', category: 'dry_goods' },
  ]},
};

// Drink ingredients (per 10 guests)
const drinkIngredients: Record<string, { items: { name: string; qty: number; unit: string; category: ShoppingItem['category'] }[] }> = {
  'sweet-tea': { items: [
    { name: 'Tea Bags', qty: 6, unit: 'each', category: 'beverages' },
    { name: 'Sugar', qty: 1, unit: 'cup', category: 'dry_goods' },
  ]},
  'lemonade': { items: [
    { name: 'Lemons', qty: 10, unit: 'each', category: 'produce' },
    { name: 'Sugar', qty: 1, unit: 'cup', category: 'dry_goods' },
  ]},
  'water': { items: [
    { name: 'Bottled Water', qty: 15, unit: 'bottles', category: 'beverages' },
  ]},
  'sodas': { items: [
    { name: 'Assorted Sodas', qty: 15, unit: 'cans', category: 'beverages' },
  ]},
};

function formatItemName(slug: string): string {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function generateShoppingList(quote: QuoteForShopping): ShoppingItem[] {
  const items: ShoppingItem[] = [];
  const guestMultiplier = Math.ceil(quote.guest_count / 10);

  // Process proteins
  const proteins = Array.isArray(quote.proteins) ? quote.proteins : [];
  proteins.forEach((protein) => {
    const ingredients = proteinIngredients[protein];
    if (ingredients) {
      ingredients.items.forEach((item) => {
        const qty = Math.ceil(item.qty * guestMultiplier);
        items.push({
          id: generateId(),
          name: item.name,
          category: item.category,
          quantity: qty.toString(),
          unit: item.unit,
          source: 'auto',
          checked: false,
        });
      });
    } else {
      // Generic entry for unknown protein
      items.push({
        id: generateId(),
        name: formatItemName(protein),
        category: 'proteins',
        quantity: `${guestMultiplier * 3}`,
        unit: 'lbs',
        source: 'auto',
        checked: false,
      });
    }
  });

  // Process vegetarian entrees
  const vegEntrees = Array.isArray(quote.vegetarian_entrees) ? quote.vegetarian_entrees : [];
  vegEntrees.forEach((entree) => {
    items.push({
      id: generateId(),
      name: formatItemName(entree),
      category: 'produce',
      quantity: `${Math.ceil(parseInt(quote.guest_count_with_restrictions || '0') / 5) || guestMultiplier}`,
      unit: 'servings',
      source: 'auto',
      checked: false,
    });
  });

  // Process sides
  const sides = Array.isArray(quote.sides) ? quote.sides : [];
  sides.forEach((side) => {
    const ingredients = sideIngredients[side];
    if (ingredients) {
      ingredients.items.forEach((item) => {
        const qty = Math.ceil(item.qty * guestMultiplier);
        // Check if item already exists, if so add to quantity
        const existing = items.find(i => i.name === item.name && i.category === item.category);
        if (existing) {
          existing.quantity = (parseFloat(existing.quantity) + qty).toString();
        } else {
          items.push({
            id: generateId(),
            name: item.name,
            category: item.category,
            quantity: qty.toString(),
            unit: item.unit,
            source: 'auto',
            checked: false,
          });
        }
      });
    }
  });

  // Process drinks
  const drinks = Array.isArray(quote.drinks) ? quote.drinks : [];
  drinks.forEach((drink) => {
    const ingredients = drinkIngredients[drink];
    if (ingredients) {
      ingredients.items.forEach((item) => {
        const qty = Math.ceil(item.qty * guestMultiplier);
        items.push({
          id: generateId(),
          name: item.name,
          category: item.category,
          quantity: qty.toString(),
          unit: item.unit,
          source: 'auto',
          checked: false,
        });
      });
    }
  });

  // Add supplies
  if (quote.plates_requested) {
    items.push({
      id: generateId(),
      name: 'Disposable Plates',
      category: 'supplies',
      quantity: `${Math.ceil(quote.guest_count * 1.2)}`,
      unit: 'each',
      source: 'auto',
      checked: false,
    });
  }
  if (quote.cups_requested) {
    items.push({
      id: generateId(),
      name: 'Disposable Cups',
      category: 'supplies',
      quantity: `${Math.ceil(quote.guest_count * 2)}`,
      unit: 'each',
      source: 'auto',
      checked: false,
    });
  }
  if (quote.napkins_requested) {
    items.push({
      id: generateId(),
      name: 'Napkins',
      category: 'supplies',
      quantity: `${Math.ceil(quote.guest_count * 3)}`,
      unit: 'each',
      source: 'auto',
      checked: false,
    });
  }
  if (quote.serving_utensils_requested) {
    items.push({
      id: generateId(),
      name: 'Serving Utensils Set',
      category: 'equipment',
      quantity: '1',
      unit: 'set',
      source: 'auto',
      checked: false,
    });
  }
  if (quote.chafers_requested) {
    const chaferCount = Math.ceil((proteins.length + sides.length) / 2);
    items.push({
      id: generateId(),
      name: 'Chafing Dishes',
      category: 'equipment',
      quantity: `${chaferCount}`,
      unit: 'each',
      source: 'auto',
      checked: false,
    });
    items.push({
      id: generateId(),
      name: 'Sterno Fuel',
      category: 'equipment',
      quantity: `${chaferCount * 2}`,
      unit: 'cans',
      source: 'auto',
      checked: false,
    });
  }
  if (quote.ice_requested) {
    items.push({
      id: generateId(),
      name: 'Bagged Ice',
      category: 'supplies',
      quantity: `${Math.ceil(quote.guest_count / 10)}`,
      unit: 'bags',
      source: 'auto',
      checked: false,
    });
  }

  return items;
}

export function groupShoppingItemsByCategory(items: ShoppingItem[]): Record<ShoppingItem['category'], ShoppingItem[]> {
  const groups: Record<ShoppingItem['category'], ShoppingItem[]> = {
    proteins: [],
    produce: [],
    dairy: [],
    dry_goods: [],
    beverages: [],
    supplies: [],
    equipment: [],
    other: [],
  };

  items.forEach((item) => {
    groups[item.category].push(item);
  });

  return groups;
}

export const categoryLabels: Record<ShoppingItem['category'], string> = {
  proteins: 'Proteins & Meats',
  produce: 'Produce',
  dairy: 'Dairy',
  dry_goods: 'Dry Goods & Pantry',
  beverages: 'Beverages',
  supplies: 'Disposable Supplies',
  equipment: 'Equipment',
  other: 'Other',
};

export const categoryIcons: Record<ShoppingItem['category'], string> = {
  proteins: '🥩',
  produce: '🥬',
  dairy: '🧀',
  dry_goods: '🥫',
  beverages: '🥤',
  supplies: '📦',
  equipment: '🔧',
  other: '📝',
};
