
# Move Watermark to "Meet Our Team" Section

## Recommendation Summary

The **"Meet Our Team"** section is the best placement because:
- Light background (Pattern C - golden tones) provides natural contrast
- Open space between the two team cards allows centered placement
- Conceptually meaningful - the family logo behind the family team
- No dark overlays or competing photos to hide the watermark

## Visual Concept

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Meet Our Team                                │
│      Behind every memorable meal is a dedicated team...          │
│                                                                  │
│     ┌─────────────┐      ╭─────────╮      ┌─────────────┐       │
│     │  Chef Train │      │   🍴    │      │    Tanya    │       │
│     │   [Photo]   │      │ LOGO    │      │   [Photo]   │       │
│     │   [Bio]     │      │ (12%)   │      │   [Bio]     │       │
│     └─────────────┘      ╰─────────╯      └─────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Details

### File: `src/pages/About.tsx`

**Step 1: Remove watermark from "Our Story" section** (lines 44-52)
- Delete the watermark div from the current location

**Step 2: Add watermark to "Meet Our Team" section** (after line 87)
- Make the `PageSection` wrapper `relative` for positioning
- Add a centered watermark between the team cards
- Use 10-12% opacity (light background needs less opacity than dark)
- Position centered behind the cards grid

### Code Changes

**Remove from Our Story section:**
```tsx
// DELETE lines 44-52 (the watermark div)
{/* Watermark Logo - repositioned to left side for visibility */}
<div className="absolute left-4 sm:left-8 lg:left-16 top-1/2 -translate-y-1/2 pointer-events-none z-[8]">
  <img 
    src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
    alt="" 
    aria-hidden="true"
    className="w-56 sm:w-64 lg:w-80 h-56 sm:h-64 lg:h-80 object-contain opacity-[0.20]"
  />
</div>
```

**Add to Meet Our Team section:**
```tsx
{/* Team Section - Pattern C */}
<PageSection pattern="c" withBorder className="relative">
  {/* Watermark Logo - centered behind team cards */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <img 
      src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
      alt="" 
      aria-hidden="true"
      className="w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 object-contain opacity-[0.10]"
    />
  </div>
  
  <div className="relative z-[1] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* existing content */}
  </div>
</PageSection>
```

## Technical Summary

| Property | Our Story (Old) | Meet Our Team (New) |
|----------|-----------------|---------------------|
| Position | Left-aligned | Centered |
| Z-index | `z-[8]` | Default (behind content) |
| Opacity | `0.20` (20%) | `0.10` (10%) - light bg needs less |
| Size | `w-56/64/80` | `w-64/80/96` (larger, centered) |
| Background | Dark gradient | Light Pattern C |

## Files to Modify

| File | Action |
|------|--------|
| `src/pages/About.tsx` | Remove watermark from Our Story, add to Meet Our Team |

## Expected Result

The watermark will be visually apparent as a subtle centered brand element behind the team member cards, with perfect contrast against the light golden background of Pattern C.
