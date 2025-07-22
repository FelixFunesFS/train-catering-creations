
export interface MenuItemDetails {
  id: string;
  name: string;
  description: string;
  category: 'poultry' | 'beef-pork' | 'seafood' | 'plant-based';
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
