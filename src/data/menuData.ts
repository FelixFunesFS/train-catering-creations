// Shared menu data for consistency across Menu page and quote forms
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  isPopular?: boolean;
  isPremium?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
}

export interface MenuSection {
  title: string;
  subtitle: string;
  color: string;
  items: (MenuItem | string)[];
}

export interface MenuCategory {
  title: string;
  subtitle: string;
  backgroundImage: string;
  overlayColor: string;
  sections: MenuSection[];
}

export const menuData = {
  appetizers: {
    title: "Appetizers",
    subtitle: "Start your culinary journey",
    backgroundImage: "/lovable-uploads/02486e12-54f5-4b94-8d6e-f150546c6983.png",
    overlayColor: "bg-black/40",
    sections: [
      {
        title: "Platters & Boards",
        subtitle: "Perfect for sharing",
        color: "bg-category-appetizers/10 border-category-appetizers/30",
        items: [
          {
            id: "charcuterie-board",
            name: "Charcuterie Board",
            description: "Artisan meats, cheeses, and accompaniments",
            isPopular: true,
            isGlutenFree: true
          },
          {
            id: "grazing-table",
            name: "Grazing Table",
            description: "Abundant selection for larger gatherings",
            isPopular: true
          },
          {
            id: "fruit-platter",
            name: "Fruit Platter",
            description: "Fresh seasonal fruits beautifully arranged",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "cheese-platter",
            name: "Cheese Platter",
            description: "Curated selection of artisan cheeses",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "meat-platter",
            name: "Meat Platter",
            description: "Assorted premium meats"
          },
          {
            id: "vegetable-platter",
            name: "Vegetable Platter",
            description: "Fresh vegetables with house-made dips",
            isVegetarian: true,
            isGlutenFree: true
          }
        ]
      },
      {
        title: "Signature Bites",
        subtitle: "Chef's special creations",
        color: "bg-category-appetizers/15 border-category-appetizers/40",
        items: [
          {
            id: "shrimp-deviled-eggs",
            name: "Shrimp Deviled Eggs w/Bacon Finish",
            description: "Elevated deviled eggs with premium shrimp",
            isPopular: true,
            isGlutenFree: true
          },
          {
            id: "smoked-salmon-cucumber",
            name: "Smoked Salmon Cucumber Bites",
            description: "Refreshing and elegant appetizer",
            isGlutenFree: true
          },
          {
            id: "tomato-caprese",
            name: "Tomato Caprese",
            description: "Fresh mozzarella, tomatoes, and basil",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "tomato-bruschetta",
            name: "Tomato Bruschetta",
            description: "Classic Italian appetizer on toasted bread",
            isVegetarian: true
          },
          {
            id: "mini-chicken-waffles",
            name: "Mini Chicken & Waffles",
            description: "Southern comfort food in bite-sized portions",
            isPopular: true
          },
          {
            id: "mini-loaded-potatoes",
            name: "Mini Loaded Potatoes",
            description: "Bite-sized loaded potato skins"
          },
          {
            id: "chocolate-covered-fruit",
            name: "Chocolate Covered Fruit Platter",
            description: "Decadent fruit with chocolate drizzle",
            isVegetarian: true
          }
        ]
      },
      {
        title: "Classic Starters",
        subtitle: "Time-honored favorites",
        color: "bg-category-appetizers/8 border-category-appetizers/25",
        items: [
          {
            id: "chicken-sliders",
            name: "Chicken Sliders",
            description: "Mini sandwiches perfect for parties",
            isPopular: true
          },
          {
            id: "pulled-pork-sliders",
            name: "Pulled Pork Sliders",
            description: "Tender pulled pork on mini buns"
          },
          {
            id: "meatballs",
            name: "Meatballs",
            description: "Savory meatballs in rich sauce"
          },
          {
            id: "deviled-eggs",
            name: "Deviled Eggs",
            description: "Southern classic with paprika",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "chicken-salad",
            name: "Chicken Salad",
            description: "Creamy chicken salad"
          },
          {
            id: "tuna-salad",
            name: "Tuna Salad",
            description: "Fresh tuna salad"
          },
          {
            id: "salmon-balls",
            name: "Salmon Balls",
            description: "Crispy salmon croquettes with herbs"
          }
        ]
      }
    ]
  },
  entrees: {
    title: "Main Entrees",
    subtitle: "Hearty & satisfying selections",
    backgroundImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop",
    overlayColor: "bg-black/40",
    sections: [
      {
        title: "Poultry",
        subtitle: "Farm-fresh selections",
        color: "bg-category-entrees/10 border-category-entrees/30",
        items: [
          {
            id: "baked-smoked-chicken",
            name: "Baked/Smoked Chicken",
            description: "Tender chicken with aromatic herbs",
            isPopular: true,
            isGlutenFree: true
          },
          {
            id: "barbecue-chicken",
            name: "Barbecue Chicken",
            description: "Smoky BBQ chicken with house sauce",
            isPopular: true
          },
          {
            id: "chicken-tenders",
            name: "Chicken Tenders",
            description: "Crispy breaded chicken strips"
          },
          {
            id: "turkey-wings",
            name: "Turkey Wings",
            description: "Seasoned and slow-cooked turkey wings"
          },
          {
            id: "chicken-alfredo",
            name: "Chicken Alfredo",
            description: "Creamy pasta with grilled chicken"
          },
          {
            id: "fried-chicken",
            name: "Fried Chicken",
            description: "Southern-style crispy fried chicken",
            isPopular: true
          },
          {
            id: "chicken-wings",
            name: "Chicken Wings",
            description: "Crispy wings with your choice of sauce"
          }
        ]
      },
      {
        title: "Beef & Pork",
        subtitle: "Premium cuts and classics",
        color: "bg-category-entrees/15 border-category-entrees/40",
        items: [
          {
            id: "smoked-sausage",
            name: "Smoked Sausage",
            description: "Artisan smoked sausage"
          },
          {
            id: "fried-pork-chops",
            name: "Fried Pork Chops",
            description: "Golden fried pork chops"
          },
          {
            id: "smothered-pork-chops",
            name: "Smothered Pork Chops",
            description: "Pork chops in rich gravy"
          },
          {
            id: "pulled-pork",
            name: "Pulled Pork",
            description: "Slow-smoked pork shoulder",
            isPopular: true,
            isGlutenFree: true
          },
          {
            id: "ribs",
            name: "Ribs",
            description: "Fall-off-the-bone tender ribs",
            isPopular: true
          },
          {
            id: "meatloaf",
            name: "Meatloaf",
            description: "Classic comfort food meatloaf"
          },
          {
            id: "brisket",
            name: "Brisket",
            description: "Slow-smoked beef brisket",
            isPopular: true,
            isGlutenFree: true
          },
          {
            id: "hamburgers",
            name: "Hamburgers",
            description: "Juicy beef patties"
          },
          {
            id: "spaghetti",
            name: "Spaghetti",
            description: "Classic spaghetti with meat sauce"
          },
          {
            id: "lasagna",
            name: "Lasagna",
            description: "Layered pasta with meat and cheese"
          },
          {
            id: "tacos",
            name: "Tacos",
            description: "Traditional tacos with your choice of filling"
          }
        ]
      },
      {
        title: "Seafood",
        subtitle: "Fresh from the coast",
        color: "bg-category-entrees/8 border-category-entrees/25",
        items: [
          {
            id: "baked-salmon",
            name: "Baked Salmon",
            description: "Fresh Atlantic salmon with herbs",
            isGlutenFree: true,
            isPremium: true
          },
          {
            id: "shrimp-alfredo",
            name: "Shrimp Alfredo",
            description: "Creamy pasta with succulent shrimp"
          },
          {
            id: "low-country-boil",
            name: "Low Country Boil",
            description: "Coastal celebration of seafood",
            isPopular: true,
            isSpicy: true
          },
          {
            id: "crabs",
            name: "Crabs",
            description: "Fresh crab prepared to perfection"
          },
          {
            id: "fried-fish",
            name: "Fried Fish",
            description: "Crispy fried fish fillets"
          }
        ]
      },
      {
        title: "Plant-Based Options",
        subtitle: "Wholesome vegetarian choices",
        color: "bg-category-sides/10 border-category-sides/30",
        items: [
          {
            id: "vegan-lasagna",
            name: "Vegan Lasagna",
            description: "Plant-based comfort food",
            isVegetarian: true
          },
          {
            id: "quinoa-power-bowl",
            name: "Quinoa Power Bowl",
            description: "Nutritious and satisfying",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "stuffed-bell-peppers",
            name: "Stuffed Bell Peppers",
            description: "Colorful and flavorful",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "black-bean-burgers",
            name: "Black Bean Burgers",
            description: "Hearty plant-based patties",
            isVegetarian: true
          },
          {
            id: "roasted-vegetable-medley",
            name: "Roasted Vegetable Medley",
            description: "Seasonal vegetables roasted to perfection",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "grilled-portobello",
            name: "Grilled Portobello Mushrooms",
            description: "Meaty mushrooms with herb marinade",
            isVegetarian: true,
            isGlutenFree: true
          }
        ]
      }
    ]
  },
  sides: {
    title: "Perfect Sides",
    subtitle: "Complete your meal",
    backgroundImage: "/lovable-uploads/d6dabca7-8f7b-45c8-bb6c-ef86311e92bd.png",
    overlayColor: "bg-black/40",
    sections: [
      {
        title: "Comfort Classics",
        subtitle: "Southern favorites",
        color: "bg-category-sides/10 border-category-sides/30",
        items: [
          {
            id: "mac-cheese",
            name: "Macaroni & Cheese",
            description: "Creamy, cheesy comfort food",
            isPopular: true,
            isVegetarian: true
          },
          {
            id: "mashed-potatoes-gravy",
            name: "Mashed Potatoes & Gravy",
            description: "Buttery potatoes with rich gravy",
            isVegetarian: true
          },
          {
            id: "white-rice",
            name: "White Rice",
            description: "Perfect fluffy rice",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "yellow-rice",
            name: "Yellow Rice",
            description: "Seasoned yellow rice",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "dirty-rice",
            name: "Dirty Rice",
            description: "Cajun-style seasoned rice"
          },
          {
            id: "rice-peas",
            name: "Rice w/ Peas",
            description: "Rice with green peas",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "rice-gravy",
            name: "Rice w/ Gravy",
            description: "Rice topped with savory gravy",
            isVegetarian: true
          },
          {
            id: "yams",
            name: "Yams",
            description: "Sweet and savory glazed yams",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "baked-beans",
            name: "Baked Beans",
            description: "Sweet and tangy baked beans",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "potato-salad",
            name: "Potato Salad",
            description: "Creamy Southern-style potato salad",
            isVegetarian: true,
            isGlutenFree: true
          }
        ]
      },
      {
        title: "Fresh & Light",
        subtitle: "Garden-fresh options",
        color: "bg-category-sides/15 border-category-sides/40",
        items: [
          {
            id: "garden-salad",
            name: "Garden Salad",
            description: "Fresh mixed greens with vegetables",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "caesar-salad",
            name: "Caesar Salad",
            description: "Classic Caesar with parmesan",
            isVegetarian: true
          },
          {
            id: "macaroni-salad",
            name: "Macaroni Salad",
            description: "Creamy pasta salad",
            isVegetarian: true
          },
          {
            id: "green-beans-potatoes",
            name: "Green Beans w/ Potatoes",
            description: "Southern-style green beans",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "sweet-peas-corn",
            name: "Sweet Peas w/ Corn",
            description: "Colorful vegetable medley",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "cabbage",
            name: "Cabbage",
            description: "Seasoned and sautéed cabbage",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "vegetable-medley",
            name: "Vegetable Medley",
            description: "Seasonal mixed vegetables",
            isVegetarian: true,
            isGlutenFree: true
          },
          {
            id: "corn",
            name: "Corn",
            description: "Sweet corn kernels",
            isVegetarian: true,
            isGlutenFree: true
          }
        ]
      }
    ]
  },
  desserts: {
    title: "Tanya's Sweet Creations",
    subtitle: "Handcrafted with 20 years of expertise",
    backgroundImage: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&h=400&fit=crop",
    overlayColor: "bg-pink-900/40",
    sections: [
      {
        title: "Signature Cakes",
        subtitle: "Made with love and tradition",
        color: "bg-category-desserts/10 border-category-desserts/30",
        items: [
          {
            id: "red-velvet-cake",
            name: "Red Velvet Cake",
            description: "Classic Southern red velvet with cream cheese frosting",
            isPopular: true,
            isVegetarian: true
          },
          {
            id: "vanilla-cake",
            name: "Vanilla Cake",
            description: "Light and fluffy vanilla cake",
            isVegetarian: true
          },
          {
            id: "chocolate-cake",
            name: "Chocolate Cake",
            description: "Rich and decadent chocolate cake",
            isPopular: true,
            isVegetarian: true
          },
          {
            id: "strawberry-cake",
            name: "Strawberry Cake",
            description: "Fresh strawberry cake with berry frosting",
            isVegetarian: true
          },
          {
            id: "carrot-cake",
            name: "Carrot Cake",
            description: "Moist carrot cake with cream cheese frosting",
            isVegetarian: true
          }
        ]
      },
      {
        title: "Specialty Treats",
        subtitle: "Sweet indulgences",
        color: "bg-category-desserts/15 border-category-desserts/40",
        items: [
          {
            id: "brownies",
            name: "Brownies",
            description: "Fudgy chocolate brownies",
            isVegetarian: true
          },
          {
            id: "cheesecake",
            name: "Cheesecake",
            description: "Creamy New York style cheesecake",
            isVegetarian: true,
            isPremium: true
          },
          {
            id: "cupcakes",
            name: "Cupcakes",
            description: "Individual cakes in various flavors",
            isVegetarian: true
          },
          {
            id: "banana-pudding",
            name: "Banana Pudding",
            description: "Traditional banana pudding with wafers",
            isPopular: true,
            isVegetarian: true
          },
          {
            id: "dessert-shooters",
            name: "Dessert Shooters",
            description: "Mini desserts in shot glasses",
            isVegetarian: true
          },
          {
            id: "pound-cake",
            name: "Pound Cake",
            description: "Dense and buttery Southern pound cake",
            isPopular: true,
            isVegetarian: true
          },
          {
            id: "lemon-cake",
            name: "Lemon Cake",
            description: "Light lemon cake with citrus glaze",
            isVegetarian: true
          }
        ]
      }
    ]
  }
};

// Wedding-specific premium menu items (matches WeddingMenu.tsx page)
export const weddingMenuItems = {
  appetizers: [
    { id: "fresh-fruit-platter", name: "Fresh Local Fruit Platter", description: "Beautifully arranged seasonal fruits", isPopular: true, isPremium: true },
    { id: "signature-charcuterie", name: "Signature Charcuterie Board", description: "Artisan meats, cheeses, and accompaniments", isPopular: true, isPremium: true },
    { id: "cheese-platter", name: "Exquisite Cheese Platter", description: "Premium cheeses with crackers and honey", isPremium: true },
    { id: "grazing-table", name: "Grazing Table", description: "Interactive display of gourmet bites", isPremium: true },
    { id: "chocolate-covered-fruit", name: "Chocolate-Covered Fruit", description: "Seasonal fruits dipped in premium chocolate", isPremium: true },
    { id: "smoked-chicken-sliders", name: "Slow-Smoked Chicken Sliders", description: "Tender pulled chicken on brioche buns", isPremium: true },
    { id: "smoked-pork-sliders", name: "Slow-Smoked Pork Sliders", description: "Savory pulled pork on brioche buns", isPremium: true },
    { id: "italian-meatballs", name: "Italian-Style Meatballs", description: "Served with marinara sauce", isPremium: true },
    { id: "deviled-eggs", name: "Velvety Deviled Eggs", description: "Classic Southern appetizer", isPremium: true },
    { id: "mini-chicken-waffles", name: "Mini Chicken & Waffles", description: "Bite-sized Southern comfort", isPopular: true, isPremium: true },
    { id: "tomato-caprese", name: "Tomato Caprese Skewers", description: "Fresh mozzarella, tomatoes, and basil", isPremium: true },
    { id: "loaded-potato-bites", name: "Petite Loaded Potato Bites", description: "Topped with cheese, bacon, and sour cream", isPremium: true },
    { id: "tomato-bruschetta", name: "Heirloom Tomato Bruschetta", description: "Toasted bread with fresh tomatoes", isPremium: true },
    { id: "smoked-salmon-cucumber", name: "Smoked Salmon Cucumber Rounds", description: "Refreshing and elegant bites", isPremium: true },
    { id: "salmon-croquettes", name: "Salmon Croquettes", description: "Delicate salmon cakes with herb aioli", isPremium: true }
  ],
  entrees: [
    { id: "applewood-herb-chicken", name: "Applewood-Smoked Herb Chicken", description: "Slow-smoked with aromatic herbs", isPopular: true, isPremium: true },
    { id: "hickory-beef-brisket", name: "Hickory-Smoked Beef Brisket", description: "Tender, slow-smoked brisket", isPopular: true, isPremium: true },
    { id: "honey-bourbon-ham", name: "Glazed Honey-Bourbon Ham", description: "Sweet and savory glazed ham", isPremium: true },
    { id: "lemon-honey-salmon", name: "Lemon-Honey Seared Salmon", description: "Fresh salmon with citrus glaze", isPremium: true },
    { id: "pulled-pork-shoulder", name: "Hand-Pulled Smoked Pork Shoulder", description: "Traditional Southern-style pulled pork", isPremium: true },
    { id: "honey-glazed-ribs", name: "Honey-Glazed Ribs", description: "Fall-off-the-bone tender ribs", isPremium: true },
    { id: "cajun-turkey-wings", name: "Cajun Slow Cooked Turkey Wings", description: "Seasoned with Cajun spices", isPremium: true },
    { id: "fettuccine-alfredo", name: "Creamy Fettuccine Alfredo", description: "Rich and creamy pasta", isPremium: true },
    { id: "glazed-meatloaf", name: "Homestyle Glazed Meatloaf", description: "Classic comfort with signature glaze", isPremium: true },
    { id: "smothered-pork-chops", name: "Smothered Pork Chops", description: "Tender chops in savory gravy", isPremium: true },
    { id: "buttermilk-fried-chicken", name: "Buttermilk Fried Chicken", description: "Crispy Southern-style fried chicken", isPopular: true, isPremium: true },
    { id: "lowcountry-boil", name: "Signature Lowcountry Boil", description: "Shrimp, sausage, corn, and potatoes", isPremium: true }
  ],
  sides: [
    { id: "southern-mac-cheese", name: "Creamy Southern Macaroni & Cheese", description: "Rich, baked mac and cheese", isPopular: true, isPremium: true },
    { id: "southern-potato-salad", name: "Classic Southern Potato Salad", description: "Traditional family recipe", isPremium: true },
    { id: "steamed-green-beans", name: "Steamed Garden Green Beans", description: "Fresh green beans with butter", isPremium: true },
    { id: "slow-simmered-cabbage", name: "Slow-Simmered Cabbage", description: "Southern-style braised cabbage", isPremium: true },
    { id: "butter-sweet-corn", name: "Butter Sweet Corn", description: "Fresh corn with melted butter", isPremium: true },
    { id: "garlic-mashed-potatoes", name: "Garlic Butter Mashed Potatoes", description: "Creamy potatoes with roasted garlic", isPopular: true, isPremium: true },
    { id: "pan-gravy", name: "House-Made Pan Gravy", description: "Rich, savory gravy", isPremium: true },
    { id: "herbed-yellow-rice", name: "Herbed Yellow Rice", description: "Seasoned rice with fresh herbs", isPremium: true },
    { id: "honey-roasted-yams", name: "Honey-Roasted Yams with Warm Spices", description: "Sweet potatoes with cinnamon", isPremium: true },
    { id: "seasonal-vegetable-medley", name: "Seasonal Vegetable Medley", description: "Fresh vegetables grilled to perfection", isPremium: true }
  ],
  desserts: [
    { id: "tiramisu", name: "Tiramisu", description: "Classic Italian coffee-flavored dessert", isPremium: true },
    { id: "creme-brulee", name: "Crème Brûlée", description: "Rich custard with caramelized sugar", isPremium: true },
    { id: "chocolate-fountain", name: "Chocolate Fountain", description: "Interactive dessert experience", isPremium: true, isPopular: true },
    { id: "wedding-cake-tasting", name: "Wedding Cake Tasting Box", description: "Sample multiple cake flavors", isPremium: true },
    { id: "cheesecake", name: "Cheesecake", description: "Creamy New York style cheesecake", isPremium: true },
    { id: "dessert-shooters", name: "Dessert Shooters", description: "Mini desserts in shot glasses", isPremium: true },
    { id: "southern-pound-cake", name: "Southern Pound Cake", description: "Dense buttery pound cake with vanilla glaze", isPremium: true },
    { id: "lemon-layer-cake", name: "Lemon Layer Cake", description: "Light lemon cake with cream cheese frosting", isPremium: true }
  ]
};

// Extract flat arrays for form usage (variant-aware)
export const getMenuItems = (variant?: 'regular' | 'wedding') => {
  // If wedding variant, return wedding menu
  if (variant === 'wedding') {
    return weddingMenuItems;
  }

  // Otherwise return regular menu
  const allItems: { [category: string]: MenuItem[] } = {
    appetizers: [],
    entrees: [],
    sides: [],
    desserts: []
  };

  Object.entries(menuData).forEach(([category, categoryData]) => {
    categoryData.sections.forEach(section => {
      section.items.forEach(item => {
        if (typeof item === 'string') {
          allItems[category].push({
            id: item.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: item
          });
        } else {
          allItems[category].push(item);
        }
      });
    });
  });

  return allItems;
};

// Drinks and extras not in main menu structure
export const additionalMenuItems = {
  drinks: [
    { id: "iced-tea", name: "Sweet & Unsweet Tea", isPopular: true },
    { id: "lemonade", name: "Fresh Lemonade", isVegetarian: true },
    { id: "coffee", name: "Coffee Service" },
    { id: "soft-drinks", name: "Assorted Soft Drinks" },
    { id: "water", name: "Bottled Water" },
    { id: "fruit-punch", name: "Fruit Punch", isVegetarian: true },
    { id: "arnold-palmer", name: "Arnold Palmer" }
  ],
  utensils: [
    { id: "plates", name: "Plates" },
    { id: "cups", name: "Cups" },
    { id: "napkins", name: "Napkins" },
    { id: "serving-utensils", name: "Serving Utensils" },
    { id: "chafers", name: "Chafers" },
    { id: "ice", name: "Ice" }
  ],
  extras: [
    { id: "tables-chairs", name: "Tables & Chairs" },
    { id: "linens", name: "Linens" },
    { id: "wait-staff", name: "Wait Staff Service", isPremium: true },
    { id: "setup-cleanup", name: "Setup & Cleanup", isPremium: true }
  ]
};

export const dietaryRestrictions = [
  { id: "vegetarian", name: "Vegetarian" },
  { id: "vegan", name: "Vegan" },
  { id: "gluten-free", name: "Gluten-Free" },
  { id: "dairy-free", name: "Dairy-Free" },
  { id: "nut-free", name: "Nut-Free" },
  { id: "diabetic-friendly", name: "Diabetic-Friendly" }
];