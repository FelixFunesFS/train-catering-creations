

# Service Cards & Our Story Buttons - Mobile/Tablet UX Improvements

## Overview
This plan addresses four improvements:
1. Collapsible content on mobile for service cards (collapse after subtitle)
2. Replace Clock icon with CircleCheck for feature bullets
3. Third service card horizontal split layout on tablet view
4. Our Story section buttons side-by-side on tablet view

---

## Issue 1: Collapsible Content on Mobile (Service Cards)

### Current State
Service cards display all content (image, title, subtitle, description, 3 features, CTA button) creating tall cards on mobile.

### Solution
Use Radix Collapsible to hide description, features, and CTA behind a "View Details" toggle on mobile only.

### Behavior
- **Mobile (under 768px)**: Cards show image, title, subtitle, and a "View Details" chevron button. Tapping expands to reveal description, features, and CTA.
- **Tablet and Desktop (768px+)**: All content always visible (no collapsible behavior).

### Visual Structure (Mobile - Collapsed)
```text
+------------------------+
|       [Image]          |
+------------------------+
| Title                  |
| Subtitle (script)      |
| [▼ View Details]       |
+------------------------+
```

### Visual Structure (Mobile - Expanded)
```text
+------------------------+
|       [Image]          |
+------------------------+
| Title                  |
| Subtitle (script)      |
| [▲ Hide Details]       |
|------------------------|
| Description paragraph  |
| ✓ Feature 1           |
| ✓ Feature 2           |
| ✓ Feature 3           |
| [Get Quote Button]     |
+------------------------+
```

---

## Issue 2: Icon Replacement (Service Cards)

### Current State
The `Clock` icon is used for all feature bullets, which semantically represents time rather than service features.

### Solution
Replace with `CircleCheck` - it has more visual presence at small sizes and clearly communicates "included feature."

**Change:**
```tsx
// From:
import { Clock } from "lucide-react";
<Clock className="h-4 w-4 text-ruby" />

// To:
import { CircleCheck } from "lucide-react";
<CircleCheck className="h-4 w-4 text-ruby" />
```

---

## Issue 3: Tablet Split Card Layout (3rd Service Card)

### Current Layout (Tablet)
```text
+-------------+  +-------------+
|   Card 1    |  |   Card 2    |
| (vertical)  |  | (vertical)  |
+-------------+  +-------------+
+-------------+
|   Card 3    |
| (orphaned)  |
+-------------+
```

### Proposed Layout (Tablet)
```text
+-------------+  +-------------+
|   Card 1    |  |   Card 2    |
| (vertical)  |  | (vertical)  |
+-------------+  +-------------+
+-----------------------------+
|  Image  |     Content       |
|  (40%)  |  Title, Subtitle  |
|         |  Features, CTA    |
+-----------------------------+
```

### Implementation
Apply conditional classes to the 3rd card only:
- `md:col-span-2 lg:col-span-1` - span full width on tablet
- `md:flex md:flex-row lg:block` - horizontal layout on tablet
- Image: `md:w-[40%] lg:w-full`
- Content: `md:w-[60%] lg:w-full`

---

## Issue 4: Our Story Buttons Side-by-Side on Tablet

### Current State (Line 134)
```tsx
<div className="flex flex-col space-y-3">
  <Button>Our Full Story</Button>
  <Button>Work With Us</Button>
</div>
```

Buttons stack vertically on all screen sizes.

### Solution
Add responsive flex classes to display buttons side-by-side on tablet:

**Change:**
```tsx
// From:
<div className="flex flex-col space-y-3">

// To:
<div className="flex flex-col sm:flex-row sm:space-y-0 sm:space-x-3 space-y-3">
```

Also adjust button width classes:
```tsx
// From:
className="w-full ..."

// To:
className="w-full sm:w-auto sm:flex-1 ..."
```

### Visual Result

**Mobile (stacked):**
```text
+------------------------+
| [Our Full Story    →]  |
+------------------------+
| [Work With Us      ]   |
+------------------------+
```

**Tablet (side-by-side):**
```text
+------------+  +------------+
| Our Full   |  | Work With  |
| Story    → |  | Us         |
+------------+  +------------+
```

---

## Responsive Behavior Summary

| Component | Mobile (<640px) | Tablet (640-1023px) | Desktop (1024px+) |
|-----------|-----------------|---------------------|-------------------|
| Service Cards 1 & 2 | Vertical, collapsible | Vertical, 50% width | Vertical, 33% width |
| Service Card 3 | Vertical, collapsible | Horizontal split, full width | Vertical, 33% width |
| Our Story Buttons | Stacked vertically | Side-by-side | Side-by-side |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/ServiceCategoriesSection.tsx` | Add collapsible behavior, replace Clock with CircleCheck, add split layout for 3rd card |
| `src/components/home/AboutPreviewSection.tsx` | Update button container to flex-row on tablet |

---

## Technical Implementation Details

### ServiceCategoriesSection.tsx Changes

1. **Add imports:**
   - `Collapsible, CollapsibleContent, CollapsibleTrigger` from `@/components/ui/collapsible`
   - `CircleCheck, ChevronDown` from `lucide-react`
   - `useIsMobile` from `@/hooks/use-mobile`

2. **Add state for expanded cards:**
   ```tsx
   const [expandedCards, setExpandedCards] = useState<number[]>([]);
   const isMobile = useIsMobile();
   ```

3. **Replace Clock with CircleCheck** in the features mapping

4. **Wrap content in Collapsible** for mobile view

5. **Add conditional 3rd card layout classes**

### AboutPreviewSection.tsx Changes

Line 134 - Update button container:
```tsx
<div className="flex flex-col sm:flex-row sm:space-y-0 sm:space-x-3 space-y-3">
```

Lines 135-144 - Update primary button:
```tsx
className="w-full sm:w-auto sm:flex-1 bg-gradient-ruby-primary ..."
```

Lines 145-152 - Update secondary button:
```tsx
className="w-full sm:w-auto sm:flex-1 border-ruby ..."
```

---

## Accessibility Considerations

- Collapsible toggle includes `aria-expanded` and `aria-controls` attributes
- Touch targets maintain 44px minimum height
- `CircleCheck` icon is decorative (feature text provides context)
- Keyboard navigation preserved for all interactive elements
- Button text remains readable at all breakpoints

