
# Update Footer Customer Quote - Soul Train's Eatery Family Focus

## Current State

**Lines 128-131 in `src/components/Footer.tsx`:**
```tsx
<p className="text-sm text-muted-foreground italic">
  "Soul Train's Eatery made our wedding perfect with their amazing food!"
</p>
<p className="text-xs text-muted-foreground mt-2 font-medium">- Happy Customer</p>
```

---

## Proposed Change

Replace with a brand-aligned quote focusing on the **Soul Train's Eatery family** (removing Southern/soul food references):

**New Quote:**
> "The Soul Train's Eatery family treated us like their own. From planning to the final plate, every detail was handled with care and love!"
> — The Williams Family, Charleston Wedding

---

## Technical Change

### File: `src/components/Footer.tsx` (lines 128-131)

```tsx
<p className="text-sm text-muted-foreground italic">
  "The Soul Train's Eatery family treated us like their own. From planning to the final plate, every detail was handled with care and love!"
</p>
<p className="text-xs text-muted-foreground mt-2 font-medium">— The Williams Family, Charleston Wedding</p>
```

---

## Brand Alignment

| Element | Before | After |
|---------|--------|-------|
| **Brand Focus** | Generic food praise | "Soul Train's Eatery family" emphasis |
| **Tone** | Impersonal | Family-to-family connection |
| **Southern/Soul References** | None in current | Intentionally excluded |
| **Attribution** | "Happy Customer" | "The Williams Family, Charleston Wedding" |
| **Emotional Hook** | Weak | "Treated us like their own" - warm hospitality |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/Footer.tsx` | Update testimonial quote text and attribution (lines 128-131) |
