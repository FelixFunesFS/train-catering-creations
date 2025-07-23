
export interface MenuItemDetails {
  id: string;
  name: string;
  description: string;
  category: 'poultry' | 'beef-pork' | 'seafood' | 'plant-based' | 'appetizers' | 'sides' | 'desserts';
  dietaryInfo: string[];
  minimumGuests?: number;
  leadTimeHours?: number;
  seasonal?: boolean;
  equipmentRequired?: string[];
  servingStyle: ('buffet' | 'plated' | 'family-style')[];
  popularity: 'high' | 'medium' | 'low';
}

export const regularMenuItems: MenuItemDetails[] = [
  // Poultry
  {
    id: 'baked-smoked-chicken',
    name: 'Baked/Smoked Chicken',
    description: 'Tender chicken slow-cooked with aromatic herbs and spices',
    category: 'poultry',
    dietaryInfo: ['Gluten-Free Available'],
    minimumGuests: 10,
    leadTimeHours: 24,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'plated', 'family-style'],
    popularity: 'high'
  },
  {
    id: 'bbq-chicken',
    name: 'Barbecue Chicken',
    description: 'Smoky barbecue chicken with house-made sauce',
    category: 'poultry',
    dietaryInfo: ['Gluten-Free Available'],
    minimumGuests: 10,
    leadTimeHours: 24,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'high'
  },
  {
    id: 'chicken-tenders',
    name: 'Chicken Tenders',
    description: 'Crispy golden chicken tenders, perfect for casual events',
    category: 'poultry',
    dietaryInfo: ['Contains Gluten'],
    minimumGuests: 15,
    leadTimeHours: 24,
    equipmentRequired: ['warming-trays'],
    servingStyle: ['buffet'],
    popularity: 'medium'
  },
  {
    id: 'fried-chicken',
    name: 'Fried Chicken',
    description: 'Southern-style fried chicken with crispy coating',
    category: 'poultry',
    dietaryInfo: ['Contains Gluten'],
    minimumGuests: 10,
    leadTimeHours: 24,
    equipmentRequired: ['warming-trays'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'high'
  },
  
  // Beef & Pork
  {
    id: 'pulled-pork',
    name: 'Pulled Pork',
    description: 'Slow-smoked pork shoulder, tender and flavorful',
    category: 'beef-pork',
    dietaryInfo: ['Gluten-Free'],
    minimumGuests: 15,
    leadTimeHours: 48,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'high'
  },
  {
    id: 'ribs',
    name: 'Ribs',
    description: 'Fall-off-the-bone tender ribs with signature BBQ sauce',
    category: 'beef-pork',
    dietaryInfo: ['Gluten-Free Available'],
    minimumGuests: 20,
    leadTimeHours: 48,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'plated'],
    popularity: 'high'
  },
  {
    id: 'brisket',
    name: 'Brisket',
    description: 'Slow-smoked beef brisket, melt-in-your-mouth tender',
    category: 'beef-pork',
    dietaryInfo: ['Gluten-Free'],
    minimumGuests: 25,
    leadTimeHours: 72,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'plated'],
    popularity: 'medium'
  },
  
  // Seafood
  {
    id: 'baked-salmon',
    name: 'Baked Salmon',
    description: 'Fresh Atlantic salmon with herbs and lemon',
    category: 'seafood',
    dietaryInfo: ['Gluten-Free', 'Contains Fish'],
    minimumGuests: 15,
    leadTimeHours: 48,
    seasonal: true,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'plated'],
    popularity: 'medium'
  },
  {
    id: 'fried-fish',
    name: 'Fried Fish',
    description: 'Crispy fried fish fillets with seasoned coating',
    category: 'seafood',
    dietaryInfo: ['Contains Gluten', 'Contains Fish'],
    minimumGuests: 15,
    leadTimeHours: 24,
    equipmentRequired: ['warming-trays'],
    servingStyle: ['buffet'],
    popularity: 'medium'
  },

  // Appetizers
  {
    id: 'grazing-boards',
    name: 'Grazing Boards',
    description: 'Artfully arranged boards with meats, cheeses, and accompaniments',
    category: 'appetizers',
    dietaryInfo: ['Gluten-Free Options', 'Contains Dairy'],
    minimumGuests: 10,
    leadTimeHours: 24,
    equipmentRequired: ['serving-boards'],
    servingStyle: ['buffet'],
    popularity: 'high'
  },
  {
    id: 'charcuterie-board',
    name: 'Charcuterie Board',
    description: 'Classic selection of cured meats, cheeses, and artisan crackers',
    category: 'appetizers',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy'],
    minimumGuests: 15,
    leadTimeHours: 24,
    equipmentRequired: ['serving-boards'],
    servingStyle: ['buffet'],
    popularity: 'high'
  },
  {
    id: 'cheese-board',
    name: 'Cheese Board',
    description: 'Curated selection of artisan cheeses with fruits and nuts',
    category: 'appetizers',
    dietaryInfo: ['Contains Dairy', 'Contains Nuts'],
    minimumGuests: 15,
    leadTimeHours: 24,
    equipmentRequired: ['serving-boards'],
    servingStyle: ['buffet'],
    popularity: 'medium'
  },
  {
    id: 'fruit-display',
    name: 'Fresh Fruit Display',
    description: 'Seasonal fresh fruit beautifully arranged',
    category: 'appetizers',
    dietaryInfo: ['Gluten-Free', 'Vegan'],
    minimumGuests: 10,
    leadTimeHours: 24,
    equipmentRequired: ['serving-trays'],
    servingStyle: ['buffet'],
    popularity: 'medium'
  },
  {
    id: 'veggie-tray',
    name: 'Vegetable Tray',
    description: 'Fresh seasonal vegetables with house-made dips',
    category: 'appetizers',
    dietaryInfo: ['Gluten-Free', 'Vegetarian'],
    minimumGuests: 10,
    leadTimeHours: 24,
    equipmentRequired: ['serving-trays'],
    servingStyle: ['buffet'],
    popularity: 'medium'
  },
  {
    id: 'deviled-eggs',
    name: 'Deviled Eggs',
    description: 'Classic Southern deviled eggs with paprika',
    category: 'appetizers',
    dietaryInfo: ['Gluten-Free', 'Contains Eggs'],
    minimumGuests: 20,
    leadTimeHours: 24,
    equipmentRequired: ['serving-trays'],
    servingStyle: ['buffet'],
    popularity: 'high'
  },

  // Sides
  {
    id: 'mac-and-cheese',
    name: 'Macaroni & Cheese',
    description: 'Creamy, cheesy comfort food favorite',
    category: 'sides',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy'],
    minimumGuests: 10,
    leadTimeHours: 24,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'high'
  },
  {
    id: 'baked-beans',
    name: 'Baked Beans',
    description: 'Sweet and savory slow-cooked beans',
    category: 'sides',
    dietaryInfo: ['Gluten-Free'],
    minimumGuests: 10,
    leadTimeHours: 24,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'high'
  },
  {
    id: 'coleslaw',
    name: 'Coleslaw',
    description: 'Fresh, crisp coleslaw with tangy dressing',
    category: 'sides',
    dietaryInfo: ['Gluten-Free', 'Contains Dairy'],
    minimumGuests: 10,
    leadTimeHours: 24,
    equipmentRequired: ['serving-bowls'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'high'
  },
  {
    id: 'potato-salad',
    name: 'Potato Salad',
    description: 'Creamy potato salad with Southern flair',
    category: 'sides',
    dietaryInfo: ['Gluten-Free', 'Contains Eggs'],
    minimumGuests: 10,
    leadTimeHours: 24,
    equipmentRequired: ['serving-bowls'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'high'
  },
  {
    id: 'green-beans',
    name: 'Green Beans',
    description: 'Fresh green beans with Southern seasoning',
    category: 'sides',
    dietaryInfo: ['Gluten-Free'],
    minimumGuests: 10,
    leadTimeHours: 24,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'medium'
  },
  {
    id: 'cornbread',
    name: 'Cornbread',
    description: 'Sweet Southern cornbread, freshly baked',
    category: 'sides',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy'],
    minimumGuests: 10,
    leadTimeHours: 24,
    equipmentRequired: ['serving-baskets'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'high'
  },
  {
    id: 'collard-greens',
    name: 'Collard Greens',
    description: 'Traditional Southern collard greens',
    category: 'sides',
    dietaryInfo: ['Gluten-Free'],
    minimumGuests: 15,
    leadTimeHours: 24,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'medium'
  },
  {
    id: 'mashed-potatoes',
    name: 'Mashed Potatoes',
    description: 'Creamy, buttery mashed potatoes',
    category: 'sides',
    dietaryInfo: ['Gluten-Free', 'Contains Dairy'],
    minimumGuests: 10,
    leadTimeHours: 24,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'high'
  },
  {
    id: 'rice-pilaf',
    name: 'Rice Pilaf',
    description: 'Seasoned rice with herbs and vegetables',
    category: 'sides',
    dietaryInfo: ['Gluten-Free', 'Vegan'],
    minimumGuests: 10,
    leadTimeHours: 24,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'medium'
  },

  // Desserts
  {
    id: 'red-velvet-cake',
    name: 'Red Velvet Cake',
    description: 'Classic Southern red velvet with cream cheese frosting',
    category: 'desserts',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy', 'Contains Eggs'],
    minimumGuests: 15,
    leadTimeHours: 48,
    equipmentRequired: ['cake-stands'],
    servingStyle: ['plated', 'buffet'],
    popularity: 'high'
  },
  {
    id: 'peach-cobbler',
    name: 'Peach Cobbler',
    description: 'Warm peach cobbler with golden crust',
    category: 'desserts',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy'],
    minimumGuests: 15,
    leadTimeHours: 24,
    seasonal: true,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'plated'],
    popularity: 'high'
  },
  {
    id: 'banana-pudding',
    name: 'Banana Pudding',
    description: 'Traditional banana pudding with vanilla wafers',
    category: 'desserts',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy'],
    minimumGuests: 15,
    leadTimeHours: 24,
    equipmentRequired: ['serving-bowls'],
    servingStyle: ['buffet', 'plated'],
    popularity: 'high'
  },
  {
    id: 'chocolate-cake',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with chocolate frosting',
    category: 'desserts',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy', 'Contains Eggs'],
    minimumGuests: 15,
    leadTimeHours: 48,
    equipmentRequired: ['cake-stands'],
    servingStyle: ['plated', 'buffet'],
    popularity: 'high'
  },
  {
    id: 'sweet-potato-pie',
    name: 'Sweet Potato Pie',
    description: 'Traditional sweet potato pie with spices',
    category: 'desserts',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy', 'Contains Eggs'],
    minimumGuests: 15,
    leadTimeHours: 24,
    equipmentRequired: ['serving-stands'],
    servingStyle: ['plated', 'buffet'],
    popularity: 'medium'
  }
];

export const weddingMenuItems: MenuItemDetails[] = [
  // Premium Poultry
  {
    id: 'applewood-smoked-chicken',
    name: 'Applewood-Smoked Herb Chicken',
    description: 'Juicy chicken smoked over applewood, infused with aromatic herbs for tender, flavorful depth',
    category: 'poultry',
    dietaryInfo: ['Gluten-Free'],
    minimumGuests: 25,
    leadTimeHours: 48,
    equipmentRequired: ['chafing-dishes', 'warming-plates'],
    servingStyle: ['buffet', 'plated'],
    popularity: 'high'
  },
  {
    id: 'buttermilk-fried-chicken',
    name: 'Buttermilk Fried Chicken',
    description: 'Golden-crisp chicken seasoned to perfection, offering a sophisticated take on a Southern tradition',
    category: 'poultry',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy'],
    minimumGuests: 30,
    leadTimeHours: 48,
    equipmentRequired: ['warming-trays'],
    servingStyle: ['buffet', 'plated'],
    popularity: 'high'
  },
  
  // Premium Beef & Pork
  {
    id: 'hickory-smoked-brisket',
    name: 'Hickory-Smoked Beef Brisket',
    description: 'Melt-in-your-mouth brisket, slow-cooked over hickory wood for bold, smoky richness',
    category: 'beef-pork',
    dietaryInfo: ['Gluten-Free'],
    minimumGuests: 40,
    leadTimeHours: 72,
    equipmentRequired: ['chafing-dishes', 'carving-station'],
    servingStyle: ['buffet', 'plated'],
    popularity: 'high'
  },
  {
    id: 'honey-bourbon-ham',
    name: 'Glazed Honey-Bourbon Ham',
    description: 'Hand-carved ham, cured and glazed with apple, bourbon, and clove—balancing sweet and savory beautifully',
    category: 'beef-pork',
    dietaryInfo: ['Gluten-Free', 'Contains Alcohol'],
    minimumGuests: 50,
    leadTimeHours: 72,
    equipmentRequired: ['chafing-dishes', 'carving-station'],
    servingStyle: ['buffet', 'plated'],
    popularity: 'high'
  },
  {
    id: 'honey-glazed-ribs',
    name: 'Honey-Glazed Ribs',
    description: 'Fall-off-the-bone tender ribs brushed with a sweet and savory house-made honey BBQ glaze',
    category: 'beef-pork',
    dietaryInfo: ['Gluten-Free Available'],
    minimumGuests: 30,
    leadTimeHours: 48,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'plated'],
    popularity: 'high'
  },
  
  // Premium Seafood
  {
    id: 'lemon-honey-salmon',
    name: 'Lemon-Honey Seared Salmon',
    description: 'Fresh Atlantic salmon seared and glazed with a bright lemon-honey reduction',
    category: 'seafood',
    dietaryInfo: ['Gluten-Free', 'Contains Fish'],
    minimumGuests: 25,
    leadTimeHours: 48,
    seasonal: true,
    equipmentRequired: ['chafing-dishes', 'warming-plates'],
    servingStyle: ['buffet', 'plated'],
    popularity: 'medium'
  },
  {
    id: 'lowcountry-boil',
    name: 'Signature Lowcountry Boil',
    description: 'A coastal celebration of shrimp, sausage, corn, and potatoes, simmered in bold, aromatic spices',
    category: 'seafood',
    dietaryInfo: ['Gluten-Free', 'Contains Shellfish'],
    minimumGuests: 40,
    leadTimeHours: 48,
    seasonal: true,
    equipmentRequired: ['large-pots', 'serving-stations'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'high'
  },

  // Premium Appetizers
  {
    id: 'artisan-charcuterie-board',
    name: 'Artisan Charcuterie Board',
    description: 'An elegant selection of premium cured meats, artisan cheeses, and house-made accompaniments',
    category: 'appetizers',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy'],
    minimumGuests: 25,
    leadTimeHours: 48,
    equipmentRequired: ['serving-boards'],
    servingStyle: ['buffet'],
    popularity: 'high'
  },
  {
    id: 'gourmet-cheese-board',
    name: 'Gourmet Cheese Board',
    description: 'Curated selection of imported and local artisan cheeses with seasonal fruits and candied nuts',
    category: 'appetizers',
    dietaryInfo: ['Contains Dairy', 'Contains Nuts'],
    minimumGuests: 25,
    leadTimeHours: 48,
    equipmentRequired: ['serving-boards'],
    servingStyle: ['buffet'],
    popularity: 'high'
  },
  {
    id: 'elegant-fruit-display',
    name: 'Elegant Fruit Display',
    description: 'A sophisticated arrangement of seasonal fruits with honey-mint drizzle',
    category: 'appetizers',
    dietaryInfo: ['Gluten-Free', 'Vegan'],
    minimumGuests: 20,
    leadTimeHours: 24,
    equipmentRequired: ['serving-trays'],
    servingStyle: ['buffet'],
    popularity: 'medium'
  },
  {
    id: 'gourmet-veggie-display',
    name: 'Gourmet Vegetable Display',
    description: 'Fresh seasonal vegetables with premium herb-infused dips and spreads',
    category: 'appetizers',
    dietaryInfo: ['Gluten-Free', 'Vegetarian'],
    minimumGuests: 20,
    leadTimeHours: 24,
    equipmentRequired: ['serving-trays'],
    servingStyle: ['buffet'],
    popularity: 'medium'
  },
  {
    id: 'signature-deviled-eggs',
    name: 'Signature Deviled Eggs',
    description: 'Elevated deviled eggs with smoked paprika and chive garnish',
    category: 'appetizers',
    dietaryInfo: ['Gluten-Free', 'Contains Eggs'],
    minimumGuests: 30,
    leadTimeHours: 24,
    equipmentRequired: ['serving-trays'],
    servingStyle: ['buffet'],
    popularity: 'high'
  },

  // Premium Sides
  {
    id: 'truffle-mac-cheese',
    name: 'Truffle Mac & Cheese',
    description: 'Elevated macaroni and cheese with truffle oil and artisan breadcrumbs',
    category: 'sides',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy'],
    minimumGuests: 25,
    leadTimeHours: 24,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'high'
  },
  {
    id: 'bourbon-baked-beans',
    name: 'Bourbon-Glazed Baked Beans',
    description: 'Slow-cooked beans with a rich bourbon glaze and smoky undertones',
    category: 'sides',
    dietaryInfo: ['Gluten-Free', 'Contains Alcohol'],
    minimumGuests: 25,
    leadTimeHours: 24,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'high'
  },
  {
    id: 'herb-roasted-potatoes',
    name: 'Herb-Roasted Fingerling Potatoes',
    description: 'Tender fingerling potatoes roasted with fresh herbs and garlic',
    category: 'sides',
    dietaryInfo: ['Gluten-Free', 'Vegan'],
    minimumGuests: 25,
    leadTimeHours: 24,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'medium'
  },
  {
    id: 'southern-collards',
    name: 'Southern Collard Greens',
    description: 'Traditional collard greens slow-cooked with smoked ham hock',
    category: 'sides',
    dietaryInfo: ['Gluten-Free'],
    minimumGuests: 25,
    leadTimeHours: 24,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'medium'
  },
  {
    id: 'honey-cornbread',
    name: 'Honey-Drizzled Cornbread',
    description: 'Sweet Southern cornbread with local honey drizzle',
    category: 'sides',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy'],
    minimumGuests: 25,
    leadTimeHours: 24,
    equipmentRequired: ['serving-baskets'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'high'
  },
  {
    id: 'garlic-green-beans',
    name: 'Garlic-Sautéed Green Beans',
    description: 'Fresh green beans sautéed with garlic and almond slivers',
    category: 'sides',
    dietaryInfo: ['Gluten-Free', 'Contains Nuts'],
    minimumGuests: 25,
    leadTimeHours: 24,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'family-style'],
    popularity: 'medium'
  },

  // Premium Desserts
  {
    id: 'signature-red-velvet',
    name: 'Signature Red Velvet Cake',
    description: 'Our award-winning red velvet cake with cream cheese buttercream frosting',
    category: 'desserts',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy', 'Contains Eggs'],
    minimumGuests: 30,
    leadTimeHours: 72,
    equipmentRequired: ['cake-stands'],
    servingStyle: ['plated', 'buffet'],
    popularity: 'high'
  },
  {
    id: 'bourbon-peach-cobbler',
    name: 'Bourbon Peach Cobbler',
    description: 'Warm peach cobbler with a hint of bourbon and vanilla bean ice cream',
    category: 'desserts',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy', 'Contains Alcohol'],
    minimumGuests: 30,
    leadTimeHours: 24,
    seasonal: true,
    equipmentRequired: ['chafing-dishes'],
    servingStyle: ['buffet', 'plated'],
    popularity: 'high'
  },
  {
    id: 'premium-banana-pudding',
    name: 'Premium Banana Pudding',
    description: 'Traditional banana pudding elevated with vanilla bean custard and artisan wafers',
    category: 'desserts',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy'],
    minimumGuests: 30,
    leadTimeHours: 24,
    equipmentRequired: ['serving-bowls'],
    servingStyle: ['buffet', 'plated'],
    popularity: 'high'
  },
  {
    id: 'decadent-chocolate-cake',
    name: 'Decadent Chocolate Cake',
    description: 'Rich triple-chocolate cake with ganache frosting and berry garnish',
    category: 'desserts',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy', 'Contains Eggs'],
    minimumGuests: 30,
    leadTimeHours: 72,
    equipmentRequired: ['cake-stands'],
    servingStyle: ['plated', 'buffet'],
    popularity: 'high'
  },
  {
    id: 'bourbon-sweet-potato-pie',
    name: 'Bourbon Sweet Potato Pie',
    description: 'Traditional sweet potato pie with a touch of bourbon and spiced whipped cream',
    category: 'desserts',
    dietaryInfo: ['Contains Gluten', 'Contains Dairy', 'Contains Eggs', 'Contains Alcohol'],
    minimumGuests: 30,
    leadTimeHours: 24,
    equipmentRequired: ['serving-stands'],
    servingStyle: ['plated', 'buffet'],
    popularity: 'medium'
  }
];

export const getMenuItemsByCategory = (items: MenuItemDetails[], category: string) => {
  return items.filter(item => item.category === category);
};

export const getPopularItems = (items: MenuItemDetails[], limit = 4) => {
  return items.filter(item => item.popularity === 'high').slice(0, limit);
};

export const filterByDietaryRestrictions = (items: MenuItemDetails[], restrictions: string[]) => {
  return items.filter(item => 
    restrictions.every(restriction => 
      item.dietaryInfo.some(info => info.toLowerCase().includes(restriction.toLowerCase()))
    )
  );
};
