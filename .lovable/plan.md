
# Simplified Service Cards - Single Section CTA

## Overview
Remove individual CTAs from each service card on mobile and add a single, prominent "Get Your Quote" button after all three cards. This eliminates redundancy while maintaining a clear conversion path.

## Visual Layout (Mobile)

```text
┌─────────────────────────────┐
│  [Image]                    │
│  Wedding Catering           │
│  Your Dream Day             │
│  ⭐ Most Popular            │
└─────────────────────────────┘

┌─────────────────────────────┐
│  [Image]                    │
│  Corporate Events           │
│  Professional Excellence    │
└─────────────────────────────┘

┌─────────────────────────────┐
│  [Image]                    │
│  Family Gatherings          │
│  Comfort & Joy              │
└─────────────────────────────┘

     [ Get Your Quote → ]      ← Single CTA button
```

## Changes

### File: `src/components/home/ServiceCategoriesSection.tsx`

**1. Remove unused imports**
- Remove `useState` hook
- Remove `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` from Radix
- Remove `ChevronDown` icon

**2. Remove unused state and functions**
- Delete `expandedCards` state
- Delete `toggleCard` function  
- Delete `isCardExpanded` function

**3. Simplify mobile card content**

Replace the mobile collapsible block with minimal content:
- Title
- Subtitle
- Popular badge (if applicable)
- No individual CTA

**4. Add section-level CTA button**

After the cards grid, add a centered CTA button visible only on mobile:

```tsx
{/* Mobile-only Section CTA */}
{isMobileOnly && (
  <div className="flex justify-center mt-6">
    <Button variant="cta" size="responsive-md" asChild>
      <a href="/request-quote/regular" className="flex items-center gap-2">
        <span>Get Your Quote</span>
        <ArrowRight className="h-4 w-4" />
      </a>
    </Button>
  </div>
)}
```

## Benefits
- Eliminates 3 redundant CTAs
- Reduces scroll depth significantly
- Single clear call-to-action
- Cards become scannable previews
- Specialized wedding form still accessible via site navigation

## Desktop/Tablet Unchanged
The full content with descriptions, features, and per-card CTAs remains for larger screens where the extra detail is valuable and not overwhelming.
