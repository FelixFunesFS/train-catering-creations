

# Add New Menu Items: Cakes, Vegetarian Meatballs, and Salmon Balls

## Summary

Adding 6 new menu items to Soul Train's Eatery menus across multiple data files:
- **Desserts**: Pound Cake, Lemon Cake (both regular and wedding)
- **Vegetarian Options**: Vegetarian Meatballs (form-only, added to vegetarianOptions.ts)
- **Appetizers**: Salmon Balls (both regular and wedding)

## Data Architecture Overview

The menu system uses three key files that must stay synchronized:
1. **`src/data/menuData.ts`** - Display data for Menu page (regular + wedding tabs)
2. **`src/data/menuItems.ts`** - Detailed items used by MenuSelection component in quote forms
3. **`src/data/vegetarianOptions.ts`** - Vegetarian entrée options used in quote forms

## Items to Add

### 1. Desserts - Pound Cake & Lemon Cake

| Item | Regular Name | Wedding Name | Location |
|------|-------------|--------------|----------|
| Pound Cake | Pound Cake | Southern Pound Cake | Desserts section |
| Lemon Cake | Lemon Cake | Lemon Layer Cake | Desserts section |

### 2. Vegetarian Meatballs

| Item | Regular Label | Wedding Label | Location |
|------|---------------|---------------|----------|
| Vegetarian Meatballs | Meatballs (V) | Vegetarian Italian Meatballs | vegetarianOptions.ts |

### 3. Salmon Balls

| Item | Regular Name | Wedding Name | Location |
|------|-------------|--------------|----------|
| Salmon Balls | Salmon Balls | Salmon Croquettes | Appetizers section |

## Files to Modify

### File 1: `src/data/menuData.ts`

**Regular Menu - Desserts Section (around line 565-600)**
Add to "Specialty Treats" section:
```typescript
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
```

**Regular Menu - Appetizers Section (around line 136)**
Add to "Classic Starters" section:
```typescript
{
  id: "salmon-balls",
  name: "Salmon Balls",
  description: "Crispy salmon croquettes with herbs"
}
```

**Wedding Menu - Desserts (around line 651-658)**
Add to weddingMenuItems.desserts:
```typescript
{ id: "southern-pound-cake", name: "Southern Pound Cake", description: "Dense buttery pound cake with vanilla glaze", isPremium: true },
{ id: "lemon-layer-cake", name: "Lemon Layer Cake", description: "Light lemon cake with cream cheese frosting", isPremium: true }
```

**Wedding Menu - Appetizers (around line 609-624)**
Add to weddingMenuItems.appetizers:
```typescript
{ id: "salmon-croquettes", name: "Salmon Croquettes", description: "Delicate salmon cakes with herb aioli", isPremium: true }
```

### File 2: `src/data/menuItems.ts`

**Regular Menu Items - Desserts (around line 780-789)**
Add after existing desserts:
```typescript
{
  id: 'pound-cake',
  name: 'Pound Cake',
  description: 'Dense and buttery Southern-style pound cake',
  category: 'desserts',
  dietaryInfo: ['Contains Gluten', 'Contains Dairy', 'Contains Eggs'],
  minimumGuests: 15,
  leadTimeHours: 24,
  equipmentRequired: ['cake-stands'],
  servingStyle: ['plated', 'buffet'],
  popularity: 'high'
},
{
  id: 'lemon-cake',
  name: 'Lemon Cake',
  description: 'Light and refreshing lemon cake with citrus glaze',
  category: 'desserts',
  dietaryInfo: ['Contains Gluten', 'Contains Dairy', 'Contains Eggs'],
  minimumGuests: 15,
  leadTimeHours: 24,
  equipmentRequired: ['cake-stands'],
  servingStyle: ['plated', 'buffet'],
  popularity: 'medium'
}
```

**Regular Menu Items - Appetizers (around line 375)**
Add to appetizers section:
```typescript
{
  id: 'salmon-balls',
  name: 'Salmon Balls',
  description: 'Crispy salmon croquettes with herbs and seasonings',
  category: 'appetizers',
  dietaryInfo: ['Contains Fish', 'Contains Gluten'],
  minimumGuests: 15,
  leadTimeHours: 24,
  equipmentRequired: ['warming-trays'],
  servingStyle: ['buffet'],
  popularity: 'medium'
}
```

**Wedding Menu Items - Desserts (around line 1070-1082)**
Add to wedding desserts:
```typescript
{
  id: 'southern-pound-cake',
  name: 'Southern Pound Cake',
  description: 'Dense buttery pound cake finished with a delicate vanilla glaze',
  category: 'desserts',
  dietaryInfo: ['Contains Gluten', 'Contains Dairy', 'Contains Eggs'],
  minimumGuests: 30,
  leadTimeHours: 48,
  equipmentRequired: ['cake-stands'],
  servingStyle: ['plated', 'buffet'],
  popularity: 'high'
},
{
  id: 'lemon-layer-cake',
  name: 'Lemon Layer Cake',
  description: 'Light lemon cake layers with cream cheese frosting and candied lemon',
  category: 'desserts',
  dietaryInfo: ['Contains Gluten', 'Contains Dairy', 'Contains Eggs'],
  minimumGuests: 30,
  leadTimeHours: 48,
  equipmentRequired: ['cake-stands'],
  servingStyle: ['plated', 'buffet'],
  popularity: 'medium'
}
```

**Wedding Menu Items - Appetizers (around line 940)**
Add to wedding appetizers:
```typescript
{
  id: 'salmon-croquettes',
  name: 'Salmon Croquettes',
  description: 'Delicate salmon cakes finished with herb aioli and microgreens',
  category: 'appetizers',
  dietaryInfo: ['Contains Fish', 'Contains Gluten'],
  minimumGuests: 25,
  leadTimeHours: 48,
  equipmentRequired: ['warming-trays'],
  servingStyle: ['buffet'],
  popularity: 'medium'
}
```

### File 3: `src/data/vegetarianOptions.ts`

Add vegetarian meatballs to VEGETARIAN_ENTREE_OPTIONS array:
```typescript
{
  id: 'vegetarian-meatballs',
  regularLabel: 'Meatballs (V)',
  weddingLabel: 'Vegetarian Italian Meatballs',
}
```

## Why This Approach is Safe

1. **Consistent ID Patterns**: Using kebab-case IDs that match existing patterns
2. **Separate Regular vs Wedding Items**: Wedding items use different IDs with more elegant naming
3. **Database Compatibility**: IDs are stored in database - new items have unique IDs so no conflicts
4. **Form Auto-Population**: The MenuSelectionStep component uses `getMenuItems(variant)` which automatically picks up new items from menuData.ts
5. **Display Pages**: SimplifiedMenu.tsx automatically displays items from menuData.ts and weddingMenuItems
6. **No Schema Changes**: All new items follow existing data structures exactly

## Menu Page Display

After changes, users will see:
- **Regular Menu Tab**: New Pound Cake, Lemon Cake in Desserts; Salmon Balls in Appetizers
- **Wedding Menu Tab**: Southern Pound Cake, Lemon Layer Cake in Desserts; Salmon Croquettes in Appetizers

## Quote Form Selection

After changes, users selecting menu items will see:
- **Desserts dropdown**: Pound Cake, Lemon Cake (regular) or Southern Pound Cake, Lemon Layer Cake (wedding)
- **Appetizers dropdown**: Salmon Balls (regular) or Salmon Croquettes (wedding)
- **Vegetarian Entrées dropdown**: Meatballs (V) (regular) or Vegetarian Italian Meatballs (wedding)

## Testing Verification

After implementation:
1. Visit Menu page (`/menu`) and verify new items appear in Regular tab
2. Switch to Wedding tab and verify wedding versions appear
3. Start a Regular quote and verify new items in dropdowns
4. Start a Wedding quote and verify elegant naming in dropdowns
5. Submit a test quote with new items to confirm database storage works

