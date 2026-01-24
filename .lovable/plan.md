
# Marquee Speed and Responsiveness Optimization Plan

## Overview
This plan addresses marquee animation speed inconsistencies and ensures appropriate responsiveness across all screen sizes while maintaining the visual design and user experience.

---

## Issues Identified

### 1. Conflicting Animation Definitions
Two different speed configurations exist:
- **index.css**: `marquee: 30s`, `marquee-slow: 50s`, `marquee-fast: 20s`
- **tailwind.config.ts**: `marquee: 15s`, `marquee-slow: 25s`, `marquee-fast: 8s`

The CSS in `index.css` takes precedence, but this inconsistency creates maintenance confusion.

### 2. Non-Reactive Device Detection
`BrandMarquee.tsx` uses a static window width check that only runs on mount and does not respond to viewport changes.

### 3. Speed Appropriateness by Screen Size
- **Mobile**: Content travels less distance but at the same speed, making text harder to read
- **Desktop**: Larger viewports benefit from slightly faster animations to maintain visual energy

### 4. Current Speed Settings
| Component | Speed | Duration | Issue |
|-----------|-------|----------|-------|
| TrustMarquee | normal | 30s | Acceptable |
| ServiceMarquee | fast | 20s | Too fast on mobile |
| BrandMarquee | slow/normal | 50s/30s | Detection not reactive |

---

## Proposed Solution

### Phase 1: Consolidate Animation Definitions

**File: `src/index.css`**

Update marquee speeds with responsive breakpoints using CSS media queries. This approach:
- Keeps speed logic in CSS (performant, no JS overhead)
- Automatically responds to viewport changes
- Works with reduced-motion preferences

**New responsive marquee classes:**
```css
/* Base speeds (mobile-first) */
.marquee { animation: marquee 40s linear infinite; }
.marquee-slow { animation: marquee 60s linear infinite; }
.marquee-fast { animation: marquee 30s linear infinite; }

/* Tablet speeds */
@media (min-width: 768px) {
  .marquee { animation: marquee 35s linear infinite; }
  .marquee-slow { animation: marquee 50s linear infinite; }
  .marquee-fast { animation: marquee 25s linear infinite; }
}

/* Desktop speeds */
@media (min-width: 1024px) {
  .marquee { animation: marquee 30s linear infinite; }
  .marquee-slow { animation: marquee 45s linear infinite; }
  .marquee-fast { animation: marquee 20s linear infinite; }
}
```

**Rationale**: 
- Mobile gets slower speeds (40s base) because content covers less distance
- Desktop gets faster speeds (30s base) for visual energy
- This creates a consistent perceived speed across all devices

---

### Phase 2: Simplify Component Logic

**File: `src/components/home/BrandMarquee.tsx`**

Remove the unreliable tablet detection and simplify to use a single speed setting:
- Remove: `const isTablet = typeof window !== 'undefined' && ...`
- Change: `speed: 'slow'` (the CSS will handle responsive adjustments)

**File: `src/components/home/ServiceMarquee.tsx`**

Keep `speed: 'fast'` but the CSS responsive rules will slow it down on mobile automatically.

**File: `src/components/home/TrustMarquee.tsx`**

Keep `speed: 'normal'` - no changes needed as CSS handles responsiveness.

---

### Phase 3: Sync Tailwind Config (Optional Cleanup)

**File: `tailwind.config.ts`**

Either remove the marquee animations from Tailwind config (since CSS classes handle it) or sync them with the CSS values. Recommendation: Keep them for utility but note they're overridden.

---

## Technical Implementation Details

### Files to Modify

1. **`src/index.css`** - Add responsive marquee speed breakpoints
2. **`src/components/home/BrandMarquee.tsx`** - Remove flaky tablet detection, simplify speed
3. **`src/components/home/ServiceMarquee.tsx`** - Optional: Consider using 'normal' instead of 'fast'

### Speed Recommendations by Purpose

| Marquee Type | Purpose | Recommended Speed | Reasoning |
|--------------|---------|-------------------|-----------|
| **Trust/Social Proof** | Quick credibility scan | normal | Users glance, don't need to read every word |
| **Service Types** | Service awareness | normal (changed from fast) | Users should be able to read services |
| **Brand Taglines** | Emotional connection | slow | Script font needs more time to process |

---

## No Breaking Changes

- All existing marquee functionality preserved
- Visual appearance unchanged (just speed adjustments)
- Reduced-motion support already in place and will continue to work
- No changes to marquee direction, pause-on-hover, or content

---

## Expected Improvements

| Metric | Before | After |
|--------|--------|-------|
| Mobile readability | Content moves too fast | Comfortable reading speed |
| Cross-device consistency | Different perceived speeds | Uniform visual rhythm |
| Code maintainability | Conflicting definitions | Single source of truth |
| Reactive to resize | Static on-mount check | CSS-based, always reactive |

---

## Implementation Order

1. Update CSS with responsive breakpoints (highest impact)
2. Simplify BrandMarquee component
3. Optionally adjust ServiceMarquee speed setting
4. Clean up Tailwind config (optional)
