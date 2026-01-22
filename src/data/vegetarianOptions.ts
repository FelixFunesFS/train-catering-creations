export type VegetarianVariant = 'regular' | 'wedding';

export type VegetarianEntreeOption = {
  id: string;
  regularLabel: string;
  weddingLabel: string;
};

// Canonical vegetarian entrée list used across form + review displays.
// IDs are stored in the database; keep them stable.
export const VEGETARIAN_ENTREE_OPTIONS: VegetarianEntreeOption[] = [
  {
    id: 'vegetarian-patties-gravy',
    regularLabel: 'Patties w/ Gravy (V)',
    weddingLabel: 'Vegetarian Patties with Country Gravy',
  },
  {
    id: 'vegetarian-burger',
    regularLabel: 'Burger (V)',
    weddingLabel: 'Vegetarian Burger',
  },
  {
    id: 'vegetarian-hot-dogs',
    regularLabel: 'Hot Dogs (V)',
    weddingLabel: 'Vegetarian Hot Dogs',
  },
  {
    id: 'vegetarian-lasagna',
    regularLabel: 'Lasagna (V)',
    weddingLabel: 'Vegetarian Lasagna',
  },
  {
    id: 'vegetarian-spaghetti',
    regularLabel: 'Spaghetti (V)',
    weddingLabel: 'Vegetarian Spaghetti',
  },
  {
    id: 'vegetarian-meat-loaf',
    regularLabel: 'Meat Loaf (V)',
    weddingLabel: 'Vegetarian Meat Loaf',
  },
];

export function getVegetarianEntreeLabel(id: string, variant: VegetarianVariant = 'regular') {
  const found = VEGETARIAN_ENTREE_OPTIONS.find((o) => o.id === id);
  if (!found) return id;
  return variant === 'wedding' ? found.weddingLabel : found.regularLabel;
}
