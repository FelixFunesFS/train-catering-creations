

# Fix Navigation Bar Disappearing + Add Scroll-to-Top

## Root Cause Analysis

The navigation bar uses the class `neumorphic-card-3` which has the following CSS:

```css
.neumorphic-card-3:hover {
  box-shadow: var(--shadow-neumorphic-4), var(--shadow-glow);
  transform: translateY(-3px);  /* THIS CAUSES THE ISSUE */
}
```

**Problem**: When a `position: sticky` element has a `transform` applied (even on hover), it can:
1. Create a new stacking context that interferes with sticky behavior
2. Cause the element to "jump" or disappear visually in some browsers
3. Break the sticky positioning entirely in Safari/iOS

Additionally, the hero section has elements with high z-index values (z-30) that could interfere with the header's z-50.

---

## Solution

### Part 1: Fix Header Sticky Positioning

**File**: `src/components/Header.tsx`

Remove the `neumorphic-card-3` class from the header and replace it with a custom set of styles that:
- Keeps the visual appearance (background, border, shadow)
- Removes the hover transform that breaks sticky positioning
- Ensures the header remains visually stable

**Changes**:
1. Remove `neumorphic-card-3` from the header's className
2. Add inline shadow styling without the hover transform
3. Keep the scrolled state shadow enhancement (`shadow-elegant`)

### Part 2: Add CSS Override for Header

**File**: `src/index.css`

Add a specific header override that prevents transform on the sticky header:

```css
/* Prevent neumorphic hover transform on sticky header */
header.sticky .neumorphic-card-3,
header[class*="sticky"] .neumorphic-card-3 {
  transform: none !important;
}
```

Alternatively, create a new `neumorphic-card-static` class specifically for sticky elements that has the visual styling without the transform.

### Part 3: Create Scroll-to-Top Component

**File**: `src/components/ui/scroll-to-top.tsx` (New)

Create a floating button that:
- Appears after scrolling 300px
- Uses ruby brand styling
- Positions above MobileActionBar on mobile
- Hidden on admin and quote wizard routes
- Smooth scroll animation to top
- Accessible with proper ARIA labels

### Part 4: Integrate Scroll-to-Top in App

**File**: `src/App.tsx`

Add the ScrollToTop component to the AppContent, positioned after MobileActionBar.

---

## Technical Details

### Header Fix Strategy

Replace in `Header.tsx` (line 51):

```tsx
// FROM:
className={cn(
  "bg-gradient-to-br from-background via-muted/20 to-background backdrop-blur-md border-b border-border/20 sticky top-0 z-50 transition-all duration-300",
  "neumorphic-card-3",  // REMOVE THIS
  isScrolled && "shadow-elegant"
)}

// TO:
className={cn(
  "bg-gradient-to-br from-background via-muted/20 to-background backdrop-blur-md border-b border-border/20 sticky top-0 z-50 transition-all duration-300",
  "shadow-[9px_9px_18px_hsla(210,10%,0%,0.08),-9px_-9px_18px_hsla(210,5%,85%,0.1)]",
  isScrolled && "shadow-elegant"
)}
```

This keeps the neumorphic shadow appearance but removes the problematic hover transform.

### Scroll-to-Top Component Structure

```tsx
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Route-based hiding
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isQuoteWizard = /^\/request-quote\/(regular|wedding)$/.test(location.pathname);
  const hidden = isAdminRoute || isQuoteWizard;

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 300);
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (hidden) return null;

  return (
    <Button
      onClick={scrollToTop}
      variant="default"
      size="icon"
      className={cn(
        "fixed z-50 shadow-lg transition-all duration-300",
        "right-4 lg:right-6",
        isMobile 
          ? "bottom-[calc(5rem+env(safe-area-inset-bottom)+0.5rem)]" 
          : "bottom-6",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4 pointer-events-none",
        "h-12 w-12 rounded-full bg-ruby hover:bg-ruby-dark"
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
```

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/Header.tsx` | Edit | Remove neumorphic-card-3, add static shadow |
| `src/components/ui/scroll-to-top.tsx` | Create | New scroll-to-top button component |
| `src/App.tsx` | Edit | Import and add ScrollToTop component |

---

## Visual Result

```text
Before (Broken):
┌─────────────────────────┐
│ [Header - visible]       │
├─────────────────────────┤
│                         │
│    [Hero Section]       │
│                         │
├─────────────────────────┤
│                         │ ← Header disappears here
│    [Services Section]   │
│                         │
└─────────────────────────┘

After (Fixed):
┌─────────────────────────┐
│ [Header - STICKY]       │ ← Always visible at top
├─────────────────────────┤
│                         │
│    [Hero Section]       │
│                         │
├─────────────────────────┤
│                         │
│    [Services Section]   │
│                         │        ┌───┐
│                         │        │ ↑ │ ← Scroll-to-top
└─────────────────────────┴────────┴───┘
```

---

## Browser Compatibility Notes

The transform issue with sticky positioning is a known quirk in:
- Safari (all versions)
- iOS Safari
- Some Chromium-based browsers with GPU acceleration

By removing the transform from the header's hover state, we ensure consistent sticky behavior across all browsers.

