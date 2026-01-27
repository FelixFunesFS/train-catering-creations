

# Desktop Quote Form - Viewport Optimization

## Problem Summary

On desktop (1920x1080), the quote form steps appear to have the Continue button "below the fold" with excessive margin between the last form field and the button. This is caused by:

1. **Large bottom padding** in the scroll container (`pb-[7rem]` = 112px) meant for mobile safe-area insets
2. **Top-aligned content** (`items-start`) creates visual disconnect between fields and the sticky footer
3. **Fixed max-width constraints** (`max-w-md`, `max-w-lg`) leave horizontal space unused on wide screens

---

## Current Layout Heights

```text
Desktop Viewport: 1080px
┌─────────────────────────────────────────┐
│ Exit Bar (py-3)                   ~48px │  STICKY
│ Progress Bar (py-4)               ~64px │  HEADER
├─────────────────────────────────────────┤
│ Content pt-8                      ~32px │
│                                         │
│ Step Header (icon + title + desc) ~140px│
│                                         │
│ Form Fields (3 fields x ~100px)   ~300px│
│                                         │  SCROLLABLE
│ ▼ EXCESSIVE GAP HERE ▼                  │  CONTENT
│                                         │
│ Content pb-7rem                   ~112px│  ← This is the issue
├─────────────────────────────────────────┤
│ Navigation (pt-4 + buttons)       ~100px│  STICKY
└─────────────────────────────────────────┘  FOOTER
```

---

## Proposed Solution

### Strategy 1: Reduce Desktop Bottom Padding

The `pb-[calc(7rem+env(safe-area-inset-bottom))]` is designed for mobile devices with home indicators. On desktop, this can be significantly reduced.

**Change in SinglePageQuoteForm.tsx (content container):**
```tsx
// Before:
"flex-1 min-h-0 overflow-y-auto pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] px-4"

// After (responsive):
"flex-1 min-h-0 overflow-y-auto pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-4 px-4"
```

This reduces desktop bottom padding from 112px to 16px.

---

### Strategy 2: Center Short Steps Vertically on Desktop

For steps with minimal content (Contact Info, Service Type), center the content vertically to reduce the visual gap between the form and footer.

**Change the content alignment:**
```tsx
// Before:
"flex-1 flex items-start justify-center"

// After (responsive):
"flex-1 flex items-start lg:items-center justify-center"
```

This centers shorter steps vertically on desktop, making the sticky footer appear more connected to the content.

---

### Strategy 3: Compact Sticky Footer on Desktop

The StepNavigation component has internal spacing (`space-y-4`) that can be reduced on desktop.

**Changes in StepNavigation.tsx:**
```tsx
// Before:
<div className="w-full max-w-lg mx-auto space-y-4">

// After:
<div className="w-full max-w-lg mx-auto space-y-4 lg:space-y-2">
```

**Footer wrapper padding:**
```tsx
// Before:
"sticky bottom-0 z-10 ... pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] px-4 ..."

// After:
"sticky bottom-0 z-10 ... pt-4 lg:pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:pb-3 px-4 ..."
```

---

### Strategy 4: Increase Form Width on Desktop

Wider forms feel more substantial and reduce the perception of empty space on large screens.

**Changes in step components:**
```tsx
// ContactInfoStep: max-w-md → max-w-md lg:max-w-lg
// ServiceSelectionStep: max-w-lg → max-w-lg lg:max-w-xl
// etc.
```

---

## Visual Comparison

### Before (1080px viewport)

```text
┌─────────────────────────────────────────┐
│ [Exit]     Event Quote       Step 1/6   │ 112px
├─────────────────────────────────────────┤
│                                         │
│           👤 Your Info                  │
│           Let's start...                │
│                                         │
│           ┌──────────────┐              │
│           │ Full Name    │              │
│           └──────────────┘              │
│           ┌──────────────┐              │
│           │ Email        │              │
│           └──────────────┘              │
│           ┌──────────────┐              │
│           │ Phone        │              │
│           └──────────────┘              │
│                                         │
│         ▼ ~200px gap here ▼             │ ← Perception issue
│                                         │
├─────────────────────────────────────────┤
│        [      Continue      ]           │ 100px
│      Press Enter ↵ to continue          │
└─────────────────────────────────────────┘
```

### After (1080px viewport)

```text
┌─────────────────────────────────────────┐
│ [Exit]     Event Quote       Step 1/6   │ 112px
├─────────────────────────────────────────┤
│                                         │
│           👤 Your Info                  │
│           Let's start...                │
│                                         │
│           ┌──────────────────────┐      │ ← Wider fields
│           │ Full Name            │      │
│           └──────────────────────┘      │
│           ┌──────────────────────┐      │
│           │ Email                │      │
│           └──────────────────────┘      │
│           ┌──────────────────────┐      │
│           │ Phone                │      │
│           └──────────────────────┘      │
│                                         │
├─────────────────────────────────────────┤ ← Content ends closer to footer
│        [      Continue      ]           │ ~80px (more compact)
│      Press Enter ↵ to continue          │
└─────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/quote/SinglePageQuoteForm.tsx` | Reduce desktop bottom padding, center content vertically on desktop, compact footer padding |
| `src/components/quote/StepNavigation.tsx` | Reduce `space-y-4` to `lg:space-y-2` on desktop |
| `src/components/quote/steps/ContactInfoStep.tsx` | Increase max-width on desktop (`max-w-md lg:max-w-lg`) |
| `src/components/quote/alternative-form/ServiceSelectionStep.tsx` | Optional: increase max-width |

---

## Summary of Space Savings

| Component | Current | Proposed | Savings |
|-----------|---------|----------|---------|
| Content bottom padding | 112px | 16px | **~96px** |
| Footer internal spacing | 16px | 8px | **~8px** |
| Footer wrapper padding | 80px | 48px | **~32px** |
| **Total** | | | **~136px** |

Combined with vertical centering for short steps, this ensures the Continue button is always visually connected to the form content on desktop while preserving the mobile-safe layout.

---

## Mobile Preservation

All changes use responsive Tailwind classes (`lg:` prefix), ensuring:
- Mobile bottom padding remains `7rem + safe-area` for proper spacing above the home indicator
- Mobile footer spacing remains generous for touch targets
- Only desktop layouts are compacted

