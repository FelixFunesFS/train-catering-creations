
# Fix Modal Button Contrast Issue

## Problem Analysis
The modal navigation buttons (close, previous, next) appear white-on-white because:

1. Buttons use `variant="ghost"` which applies the `.neumorphic-card-1` class
2. `.neumorphic-card-1` has `@apply bg-gradient-to-br from-card to-muted` (white/light background)
3. This **overrides** the custom `bg-black/50` class we added
4. The `hover:bg-black/70` works because hover states have higher specificity

## Best Solution: Use the `modal-control` Variant

The Button component already has a purpose-built variant called `modal-control` (line 24):

```tsx
"modal-control": "bg-black/80 text-white border border-white/30 hover:bg-black/90 shadow-lg min-h-[44px] min-w-[44px] [&_svg]:text-white"
```

This variant:
- Has a dark background (`bg-black/80`) that works on any image
- Includes a subtle border for definition (`border-white/30`)
- Has proper touch target sizing (`min-h-[44px] min-w-[44px]`)
- Explicitly sets icon color (`[&_svg]:text-white`)

## Changes to EnhancedImageModal.tsx

### Close Button (line 102-110)
```tsx
// FROM:
<Button 
  variant="ghost" 
  size="sm" 
  onClick={onClose}
  className="text-white bg-black/50 hover:bg-black/70 h-10 w-10 p-0 rounded-full backdrop-blur-sm"
  ...
>

// TO:
<Button 
  variant="modal-control" 
  size="icon" 
  onClick={onClose}
  className="rounded-full backdrop-blur-sm"
  ...
>
```

### Previous Button (line 122-131)
```tsx
// FROM:
<Button 
  variant="ghost" 
  size="sm" 
  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/70 h-10 w-10 sm:h-12 sm:w-12 p-0 rounded-full backdrop-blur-sm"
  ...
>

// TO:
<Button 
  variant="modal-control" 
  size="icon" 
  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 sm:h-12 sm:w-12 rounded-full backdrop-blur-sm"
  ...
>
```

### Next Button (line 141-150)
```tsx
// FROM:
<Button 
  variant="ghost" 
  size="sm" 
  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/70 h-10 w-10 sm:h-12 sm:w-12 p-0 rounded-full backdrop-blur-sm"
  ...
>

// TO:
<Button 
  variant="modal-control" 
  size="icon" 
  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 sm:h-12 sm:w-12 rounded-full backdrop-blur-sm"
  ...
>
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/gallery/EnhancedImageModal.tsx` | Change 3 buttons from `variant="ghost"` to `variant="modal-control"` |

---

## Result

- Buttons will have a consistent dark background (`bg-black/80`) at all times
- No more white-on-white contrast issue
- Subtle white border provides definition against dark images too
- Proper 44x44px touch targets for accessibility
- Clean solution using existing design system instead of fighting CSS specificity
