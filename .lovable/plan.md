

# Option B: Move Cocktail Hour to Supplies Grid, Remove Ceremony Catering

## Overview

This change simplifies the wedding form by integrating Cocktail Hour into the main supplies grid and removing the Ceremony Catering option entirely from customer-facing forms.

## Changes Summary

| File | Action |
|------|--------|
| `src/components/quote/steps/SuppliesStep.tsx` | Remove wedding-specific section, add Cocktail Hour to supplies grid |
| `src/components/quote/SinglePageQuoteForm.tsx` | Remove `ceremony_included` from defaults and submission payload |
| `src/components/quote/ReviewSummaryCard.tsx` | Remove Ceremony Catering from review display |

---

## Visual Result

### Before (Current):
```text
┌──────────────────────────────────────────────┐
│  Wedding Options (separate section)          │
│  ┌────────────────┐ ┌────────────────┐       │
│  │ Cocktail Hour  │ │   (empty)      │       │
│  └────────────────┘ └────────────────┘       │
│                                              │
│  Supplies Grid (6 items)                     │
│  ┌────────────────┐ ┌────────────────┐       │
│  │ Plates         │ │ Cups           │       │
│  │ Napkins        │ │ Serving Utens. │       │
│  │ Chafers        │ │ Ice            │       │
│  └────────────────┘ └────────────────┘       │
└──────────────────────────────────────────────┘
```

### After (Fixed):
```text
┌──────────────────────────────────────────────┐
│  Supplies Grid (7 items for wedding)         │
│  ┌────────────────┐ ┌────────────────┐       │
│  │ Cocktail Hour  │ │ Plates         │       │
│  │ Cups           │ │ Napkins        │       │
│  │ Serving Utens. │ │ Chafers        │       │
│  │ Ice            │ │                │       │
│  └────────────────┘ └────────────────┘       │
│                                              │
│  (Regular form: 6 items, balanced 3x2)       │
└──────────────────────────────────────────────┘
```

---

## Technical Implementation

### 1. SuppliesStep.tsx

**Remove the wedding-specific section entirely** (lines 43-66) and add Cocktail Hour conditionally to the supplies array:

```typescript
const supplies = [
  // Cocktail Hour - only shown for wedding variant
  ...(variant === 'wedding' ? [{
    name: "cocktail_hour",
    label: "Cocktail Hour",
    description: "Light appetizers & beverages"
  }] : []),
  // Standard supplies
  { name: "plates_requested", label: "Disposable Plates", description: "Heavy-duty disposable plates" },
  { name: "cups_requested", label: "Disposable Cups", description: "Cups for beverages" },
  { name: "napkins_requested", label: "Napkins", description: "Disposable napkins" },
  { name: "serving_utensils_requested", label: "Serving Utensils", description: "Tongs, spoons, serving tools" },
  { name: "chafers_requested", label: chaferLabel, description: chaferDescription },
  { name: "ice_requested", label: "Ice", description: "Ice for beverages and cooling" },
];
```

This creates:
- **Wedding form**: 7 items (Cocktail Hour + 6 supplies) = 4 rows with 1 item on last row
- **Regular form**: 6 items = balanced 3x2 grid

### 2. SinglePageQuoteForm.tsx

**Remove `ceremony_included` from defaultValues:**
```typescript
// Remove this line from defaultValues
ceremony_included: false,  // DELETE
```

**Remove `ceremony_included` from submitPayload:**
```typescript
// Remove this line from submitPayload
ceremony_included: data.ceremony_included,  // DELETE
```

### 3. ReviewSummaryCard.tsx

**Remove any display of Ceremony Catering** from the review summary (if present). The Cocktail Hour will now appear in the supplies section.

---

## Database Note

The `ceremony_included` column remains in the database schema for backward compatibility with existing quotes. It simply won't be set for new submissions.

---

## Files to Modify

| File | Lines Affected | Change |
|------|----------------|--------|
| `src/components/quote/steps/SuppliesStep.tsx` | 14-29, 43-66 | Add Cocktail Hour to supplies array, remove wedding section |
| `src/components/quote/SinglePageQuoteForm.tsx` | ~133, ~328 | Remove `ceremony_included` from defaults and payload |
| `src/components/quote/ReviewSummaryCard.tsx` | Supplies section | Display Cocktail Hour in supplies if selected |

