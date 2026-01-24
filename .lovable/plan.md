

# Revised Logo Placement Strategy - Cleaner Approach

## My Recommendation

**Less is more.** The logo should appear strategically, not everywhere. Here's the refined approach:

### What to REMOVE (Cluttered)

The small logos next to the badge icons on Menu and Gallery pages add visual clutter without adding value - the badge already identifies the page, and the header already shows the logo.

| Page | Current Issue | Action |
|------|--------------|--------|
| **Menu** (`SimpleMenuHeader.tsx`) | Small `h-6` logo next to Utensils icon | **Remove** - redundant |
| **Gallery** (`AlternativeGallery.tsx`) | Small `h-6` logo next to Camera icon | **Remove** - redundant |

### What to KEEP/ADD (Strategic)

| Location | Logo Type | Why |
|----------|-----------|-----|
| **Header** (global) | Active logo | Navigation/brand identity |
| **Footer** (global) | Active logo | Closing brand presence |
| **Home Hero** | Badge + watermark | First impression, hero moment |
| **Home CTA** | Subtle watermark | Reinforces brand at conversion point |
| **About "Our Story"** | Background watermark | Storytelling section |

### CTA Watermark Strategy

**Only the Home page CTA should have the watermark.** 

Rationale:
- Home page is the primary landing page - maximum brand impact
- Other CTAs (Menu, Reviews, FAQ, Quote) are on secondary pages where users have already seen the brand multiple times
- Adding watermarks to every CTA creates visual fatigue

---

## Implementation Details

### 1. Remove Logo from Menu Badge

**File:** `src/components/menu/SimpleMenuHeader.tsx`

```tsx
// REMOVE lines 21-25 (the img tag)
<div className="flex items-center justify-center space-x-2 mb-3">
  {/* Remove this img block */}
  <Utensils className="h-5 w-5 text-ruby" />
  <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
    Our Menu
  </Badge>
</div>
```

---

### 2. Remove Logo from Gallery Badge

**File:** `src/pages/AlternativeGallery.tsx` (lines 88-99)

```tsx
// REMOVE lines 90-94 (the img tag)
<div className="flex items-center justify-center space-x-2 mb-3">
  {/* Remove this img block */}
  <Camera className="h-5 w-5 text-ruby" />
  <Badge variant="outline" className="border-ruby text-ruby font-script text-sm">
    Our Gallery
  </Badge>
</div>
```

---

### 3. Add Watermark to CTA Section (Home Only)

**File:** `src/components/ui/cta-section.tsx`

Add an optional `showWatermark` prop that defaults to `false`:

```tsx
interface CTASectionProps {
  title: string;
  description: string;
  buttons: CTAButton[];
  footer?: string;
  showWatermark?: boolean; // NEW prop
}

export const CTASection = ({ title, description, buttons, footer, showWatermark = false }: CTASectionProps) => {
  // ... existing code ...
  
  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="mx-4 sm:mx-6 lg:mx-8 rounded-xl sm:rounded-2xl overflow-hidden shadow-elevated">
        <div className="relative bg-gradient-to-r from-primary to-primary-dark py-8 sm:py-10 lg:py-12 overflow-hidden">
          
          {/* Watermark Logo - only shown when prop is true */}
          {showWatermark && (
            <div className="absolute right-4 sm:right-8 lg:right-12 top-1/2 -translate-y-1/2 pointer-events-none">
              <img 
                src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                alt="" 
                aria-hidden="true"
                className="w-28 sm:w-36 lg:w-44 h-28 sm:h-36 lg:h-44 object-contain opacity-[0.08]"
              />
            </div>
          )}
          
          <div ref={contentRef} className={...}>
            {/* existing content */}
          </div>
        </div>
      </div>
    </section>
  );
};
```

Then update only the **Home page** to use the watermark:

**File:** `src/pages/Index.tsx` (or wherever HomeCTA is used)

```tsx
<CTASection 
  title="..."
  description="..."
  buttons={...}
  showWatermark={true}  // Enable for home only
/>
```

---

### 4. Fix About Page Watermark Visibility

**File:** `src/pages/About.tsx` (lines 44-52)

Increase opacity from 6% to 12% for better visibility:

```tsx
<div className="absolute right-4 sm:right-8 lg:right-16 top-1/2 -translate-y-1/2 pointer-events-none z-[5]">
  <img 
    src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
    alt="" 
    aria-hidden="true"
    className="w-48 sm:w-56 lg:w-64 h-48 sm:h-56 lg:h-64 object-contain opacity-[0.12]"
  />
</div>
```

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/components/menu/SimpleMenuHeader.tsx` | Remove logo img from badge area |
| `src/pages/AlternativeGallery.tsx` | Remove logo img from badge area |
| `src/components/ui/cta-section.tsx` | Add optional `showWatermark` prop + watermark element |
| `src/pages/Index.tsx` | Pass `showWatermark={true}` to home CTA |
| `src/pages/About.tsx` | Increase watermark opacity (6% → 12%) |

---

## Final Logo Presence

| Location | Type | Visibility |
|----------|------|------------|
| Header | Active | Always visible |
| Footer | Active | Always visible |
| Home Hero | Badge + Text | Prominent |
| Home Hero Content | Watermark | Subtle (4%) |
| Home CTA | Watermark | Subtle (8%) |
| About "Our Story" | Watermark | Subtle (12%) |
| Menu Badge | **None** | Cleaned up |
| Gallery Badge | **None** | Cleaned up |
| Other CTAs | **None** | Clean |

This creates a cohesive brand experience: strong presence on the home page, subtle reinforcement on storytelling pages, and clean functional pages elsewhere.

