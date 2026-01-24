

# Change "Our Values" Background Image + UX Design Guidance

## Overview

This plan addresses two requests:
1. **Replace the background image** in the "Our Values" section with a different, complementary image
2. **UX guidance** on when to use the Badge + Script pattern

---

## UX Design Guidance: Badge + Script Pattern

### Current Site Pattern Analysis

The site uses a consistent **Badge + Icon + Script** pattern for section headers:

| Location | Treatment | Rationale |
|----------|-----------|-----------|
| Page headers | Full treatment (badge + script) | First impression, sets tone |
| Home page sections | Full treatment | "Selling" each section to visitors |
| Content sections | Plain headings only | Let content/imagery speak |
| Full-bleed background sections | Plain headings (white text) | Imagery provides the visual hook |

### Best Practice Recommendation

**Use badges + script for:**
- Page entry points (hero headers)
- Home page section intros where you need to "hook" visitors
- Marketing-focused sections

**Omit badges + script for:**
- Interior content sections (like "Our Story", "Team", "Values")
- Sections with cinematic full-bleed backgrounds (the imagery IS the decoration)
- Utility sections (forms, CTAs)

**Why:** Overusing decorative elements dilutes their impact. The About page correctly uses the full treatment for the page header, then lets the immersive backgrounds and content carry the middle sections. This creates rhythm and prevents visual fatigue.

**Current About page is well-designed** - no changes needed to the badge/script pattern. The interior sections intentionally use plain headings because the full-bleed images provide sufficient visual interest.

---

## Background Image Change

### Current State

The "Our Values" section uses:
```
/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png
```
This appears to be a rustic venue with chandeliers - similar in feel to the "Our Story" section.

### Recommended Alternative Images

Based on available uploads that would complement the "values" theme (Quality, Family, Reliability) while providing visual variety from "Our Story":

**Option 1 (Recommended):** A professional service/plating image
- Shows craftsmanship and attention to detail
- Reinforces "Quality First" and "Reliability" values

**Option 2:** An elegant table setting or buffet display
- Conveys hospitality and celebration
- Reinforces "Family Spirit" value

**Option 3:** Chef in action or team collaboration shot
- Shows professionalism and dedication
- Reinforces all three values

### Implementation

**File:** `src/pages/About.tsx`

**Change:** Line 140 - Replace the background image URL

```tsx
// Current
style={{ 
  backgroundImage: `url('/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png')` 
}}

// Updated (example - will use a different image)
style={{ 
  backgroundImage: `url('/lovable-uploads/[new-image-id].png')` 
}}
```

### Suggested Images to Consider

Based on the file list, some candidates that would work well:

1. **`eb77404f-369f-484f-a9ce-786b7f1ddc94.png`** - If this is the professional chafing dish/buffet setup from the hero
2. **`e8d1f833-d15b-4779-8141-cb7641a62227.png`** - If this is the corporate/professional service image
3. **`e3c0d1ae-fb6a-4700-8007-a8c8c8136e57.png`** - Elegant event space from hero carousel

The key is selecting an image that:
- Has a different color tone than "Our Story" (avoid two similar brown/warm venue shots back-to-back)
- Shows professionalism, quality, or human connection
- Works well with the dark overlay for text readability

---

## Visual Flow After Change

```text
About Page Flow:

┌─────────────────────────────────────────┐
│  PAGE HEADER (Pattern A - light)        │
│  Badge: "Our Story" | Script subtitle   │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  OUR STORY (Full-bleed - Military Arch) │
│  Dark overlay | White text              │
│  Background: Military ceremony venue    │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  MEET OUR TEAM (Pattern C - light)      │
│  Clean background | Dark text           │
│  Team member cards                      │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  OUR VALUES (Full-bleed - NEW IMAGE)    │
│  Dark overlay | White text              │
│  Background: Professional service shot  │  ← DIFFERENT from Our Story
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  CTA SECTION (Pattern A - light)        │
└─────────────────────────────────────────┘
```

This creates alternating visual rhythm: **light → dark → light → dark → light**

---

## Summary

1. **Badge/Script pattern:** Current usage is correct and follows UX best practices - no changes needed
2. **Background image:** Will be updated to a different image that provides visual variety while reinforcing the values messaging

