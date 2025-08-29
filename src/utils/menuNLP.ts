// NLP utilities for converting menu IDs to readable text
export function convertMenuIdToReadableText(menuId: string): string {
  if (!menuId) return '';
  
  // Handle common menu item patterns
  const conversions: Record<string, string> = {
    // Proteins
    'fried-chicken': 'Fried Chicken',
    'baked-chicken': 'Baked Chicken',
    'grilled-chicken': 'Grilled Chicken',
    'chicken-alfredo': 'Chicken Alfredo',
    'bbq-chicken': 'BBQ Chicken',
    'chicken-tenders': 'Chicken Tenders',
    'black-bean-burgers': 'Black Bean Burgers',
    'turkey-breast': 'Turkey Breast',
    'ham-glazed': 'Glazed Ham',
    'pork-ribs': 'Pork Ribs',
    'beef-brisket': 'Beef Brisket',
    'pulled-pork': 'Pulled Pork',
    'salmon-fillet': 'Salmon Fillet',
    'catfish-fried': 'Fried Catfish',
    
    // Sides
    'mac-and-cheese': 'Mac & Cheese',
    'mashed-potatoes-gravy': 'Mashed Potatoes with Gravy',
    'green-beans': 'Green Beans',
    'collard-greens': 'Collard Greens',
    'corn-on-cob': 'Corn on the Cob',
    'black-eyed-peas': 'Black-Eyed Peas',
    'cornbread': 'Cornbread',
    'dinner-rolls': 'Dinner Rolls',
    'coleslaw': 'Coleslaw',
    'potato-salad': 'Potato Salad',
    'baked-beans': 'Baked Beans',
    'rice-pilaf': 'Rice Pilaf',
    'roasted-vegetables': 'Roasted Vegetables',
    
    // Appetizers
    'chicken-sliders': 'Chicken Sliders',
    'meatballs': 'Meatballs',
    'deviled-eggs': 'Deviled Eggs',
    'shrimp-cocktail': 'Shrimp Cocktail',
    'wings': 'Buffalo Wings',
    'stuffed-mushrooms': 'Stuffed Mushrooms',
    'spinach-dip': 'Spinach & Artichoke Dip',
    'cheese-board': 'Cheese & Charcuterie Board',
    
    // Desserts
    'vanilla-cake': 'Vanilla Cake',
    'chocolate-cake': 'Chocolate Cake',
    'red-velvet-cake': 'Red Velvet Cake',
    'cheesecake': 'Cheesecake',
    'peach-cobbler': 'Peach Cobbler',
    'banana-pudding': 'Banana Pudding',
    'sweet-potato-pie': 'Sweet Potato Pie',
    'pecan-pie': 'Pecan Pie',
    
    // Drinks
    'sweet-tea': 'Sweet Tea',
    'unsweet-tea': 'Unsweet Tea',
    'lemonade': 'Fresh Lemonade',
    'water': 'Water',
    'coffee': 'Coffee',
    'sodas': 'Assorted Sodas',
    'fruit-punch': 'Fruit Punch',
    'wine': 'Wine Selection',
    'beer': 'Beer Selection',
    
    // Dietary restrictions
    'vegetarian': 'Vegetarian',
    'vegan': 'Vegan',
    'gluten-free': 'Gluten-Free',
    'dairy-free': 'Dairy-Free',
    'nut-free': 'Nut-Free',
    'kosher': 'Kosher',
    'halal': 'Halal'
  };

  // If we have a direct conversion, use it
  if (conversions[menuId]) {
    return conversions[menuId];
  }

  // Otherwise, apply smart text transformation
  return menuId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createMealBundleDescription(
  proteins: string[],
  sides: string[],
  drinks: string[],
  guestCount: number,
  includeRolls: boolean = true
): string {
  const proteinText = proteins.map(convertMenuIdToReadableText).join(' & ');
  const sidesText = sides.slice(0, 2).map(convertMenuIdToReadableText).join(' and ');
  const drinkText = drinks.length > 0 ? convertMenuIdToReadableText(drinks[0]) : '';
  
  let description = `Meal Package: ${proteinText}`;
  
  if (sidesText) {
    description += ` with ${sidesText}`;
  }
  
  if (includeRolls) {
    description += ', dinner rolls';
  }
  
  if (drinkText) {
    description += ` and ${drinkText}`;
  }
  
  description += ` for ${guestCount} guests`;
  
  return description;
}

export function createEquipmentBundleDescription(equipment: any): string {
  const items: string[] = [];
  
  if (equipment.chafers) items.push('chafing dishes');
  if (equipment.linens) items.push('table linens');
  if (equipment.tables_chairs) items.push('tables & chairs');
  if (equipment.serving_utensils) items.push('serving utensils');
  if (equipment.plates) items.push('disposable plates');
  if (equipment.cups) items.push('disposable cups');
  if (equipment.napkins) items.push('napkins');
  if (equipment.ice) items.push('ice service');
  
  if (items.length === 0) return 'Equipment Rental';
  if (items.length === 1) return `${items[0].charAt(0).toUpperCase() + items[0].slice(1)} Rental`;
  if (items.length === 2) return `${items[0].charAt(0).toUpperCase() + items[0].slice(1)} and ${items[1]} Rental`;
  
  const lastItem = items.pop();
  return `${items.map(item => item.charAt(0).toUpperCase() + item.slice(1)).join(', ')}, and ${lastItem} Rental`;
}
