
# Quote Form Layout - Hybrid Approach

## Summary

Keep a unified fullscreen form layout for steps 1-5 (Contact, Event, Service, Menu, Supplies), but apply a **split-screen layout specifically for the Review step (step 6)** and the **Thank You/Confirmation page** on desktop only.

---

## Current Structure

The form has 6 steps:
1. **Contact Info** - Fullscreen
2. **Event Details** - Fullscreen
3. **Service Type** - Fullscreen
4. **Menu Selection** - Fullscreen
5. **Supplies & Details** - Fullscreen
6. **Review & Submit** - Fullscreen (currently)

After submission, users are redirected to `/request-quote/thank-you` which shows the `SuccessStep` component.

---

## Proposed Changes

### Steps 1-5: Unified Fullscreen Layout (All Devices)

- Remove the `layout="desktop-split"` from page components
- Use `layout="fullscreen"` for all screen sizes
- **Ensure Continue/Back buttons remain sticky at the bottom** (already implemented via sticky footer)
- Increase form max-width on desktop for better viewport utilization (`max-w-3xl lg:max-w-4xl`)

### Step 6 (Review): Split-Screen on Desktop Only

When the user reaches the Review step on desktop:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ [Exit]                Event Quote                      Step 6 of 6     │
├─────────────────────────────┬───────────────────────────────────────────┤
│                             │                                           │
│   REVIEW SUMMARY            │   SUBMIT SECTION                          │
│   ┌───────────────────┐     │   ┌─────────────────────────────────┐     │
│   │ Contact Info      │     │   │ Ready to Submit?                │     │
│   │ Name, Email, Ph   │     │   │                                 │     │
│   └───────────────────┘     │   │ Your quote request will be      │     │
│   ┌───────────────────┐     │   │ sent to our team for review.    │     │
│   │ Event Details     │     │   │                                 │     │
│   │ Date, Time, Loc   │     │   │ We'll respond within 48 hours.  │     │
│   └───────────────────┘     │   │                                 │     │
│   ┌───────────────────┐     │   │ [  SUBMIT QUOTE REQUEST  ]      │     │
│   │ Service & Menu    │     │   │                                 │     │
│   │ Items selected    │     │   │ Press Enter ↵ to submit         │     │
│   └───────────────────┘     │   └─────────────────────────────────┘     │
│                             │                                           │
│        45% width            │              55% width                    │
├─────────────────────────────┴───────────────────────────────────────────┤
│ [Back]                                              [Submit Request]    │
└─────────────────────────────────────────────────────────────────────────┘
```

On mobile, the Review step continues to show the `ReviewSummaryCard` in a single-column scrollable layout.

### Thank You Page: Split-Screen on Desktop Only

After submission, the confirmation page uses a split layout on desktop:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        Soul Train's Eatery                              │
├─────────────────────────────┬───────────────────────────────────────────┤
│                             │                                           │
│   SUCCESS!                  │   WHAT'S NEXT                             │
│   ┌───────────────────┐     │   ┌─────────────────────────────────┐     │
│   │ ✓ Quote Submitted │     │   │ Your Quote Journey              │     │
│   │                   │     │   │ [1]─────[2]─────[3]─────[4]     │     │
│   │ Reference:        │     │   │ Submitted  Review  Quote  Done  │     │
│   │ abc123            │     │   └─────────────────────────────────┘     │
│   │                   │     │                                           │
│   │ ★★★★★             │     │   ┌─────────────────────────────────┐     │
│   │ 500+ customers    │     │   │ Response Timeline               │     │
│   └───────────────────┘     │   │ • Email: Immediate              │     │
│                             │   │ • Quote: Within 48hrs           │     │
│   QUICK ACTIONS             │   │ • Follow-up: 2-3 days           │     │
│   [Calendar] [Share]        │   └─────────────────────────────────┘     │
│                             │                                           │
│   NEED HELP?                │   COMMON QUESTIONS                        │
│   Phone & Email             │   FAQ content...                          │
│                             │                                           │
│        40% width            │              60% width                    │
├─────────────────────────────┴───────────────────────────────────────────┤
│            [Request Another Quote]      [Return to Home]                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/RegularEventQuote.tsx` | Remove desktop conditional, use `layout="fullscreen"` for all |
| `src/pages/WeddingEventQuote.tsx` | Remove desktop conditional, use `layout="fullscreen"` for all |
| `src/components/quote/SinglePageQuoteForm.tsx` | Add conditional split layout for Review step only on desktop |
| `src/pages/QuoteThankYou.tsx` | Add desktop split-screen layout wrapper |
| `src/components/quote/alternative-form/SuccessStep.tsx` | Refactor content into left/right panel sections for desktop |

### Files to Potentially Delete

| File | Reason |
|------|--------|
| `src/components/quote/QuotePreviewSidebar.tsx` | No longer used (sidebar was for all-step preview) |

### Files to Keep/Modify

| File | Reason |
|------|--------|
| `src/components/quote/DesktopQuoteLayout.tsx` | Modify to serve as a generic split-layout wrapper for Review step and Thank You page |

---

## Detailed Changes

### 1. Page Components (RegularEventQuote, WeddingEventQuote)

**Before:**
```tsx
if (!isMobile) {
  return <SinglePageQuoteForm layout="desktop-split" ... />;
}
return <SinglePageQuoteForm layout="fullscreen" ... />;
```

**After:**
```tsx
// Same layout for all screen sizes
return <SinglePageQuoteForm layout="fullscreen" ... />;
```

### 2. SinglePageQuoteForm.tsx

**Key Changes:**
- Remove the `useDesktopSplit` logic for steps 1-5
- Add conditional rendering in `renderStep()` for step 6 (Review):
  - On desktop: Render split layout with ReviewSummaryCard on left, submit CTA on right
  - On mobile: Keep current single-column ReviewSummaryCard
- Increase form max-width on desktop (`max-w-3xl lg:max-w-4xl`) for better viewport utilization
- The sticky footer with Continue/Back buttons remains unchanged (already viewport-safe)

### 3. QuoteThankYou.tsx

**Key Changes:**
- Add `useIsMobile()` check
- On desktop: Render SuccessStep content in a split-panel layout
- On mobile: Keep current single-column layout

### 4. SuccessStep.tsx

**Key Changes:**
- Accept an optional `layout` prop (`'default' | 'split'`)
- When `layout="split"`:
  - Left panel: Success message, reference ID, social proof, quick actions
  - Right panel: Workflow progress, response timeline, FAQ, navigation buttons
- Both panels fit within viewport height without scrolling

---

## Navigation Buttons Viewport Guarantee

The Continue/Back buttons are already rendered in a sticky footer:

```tsx
<div className={cn(
  layout === 'fullscreen'
    ? "sticky bottom-0 z-10 bg-background/95 backdrop-blur-sm pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] px-4 border-t"
    : "..."
)}>
  <StepNavigation ... />
</div>
```

This ensures buttons are always visible at the bottom of the viewport on all steps. No changes needed here.

---

## Mobile Preservation

All changes are guarded by `useIsMobile()` or responsive Tailwind classes:
- Steps 1-5: Fullscreen layout (unchanged mobile experience)
- Step 6: Single-column ReviewSummaryCard on mobile
- Thank You: Single-column SuccessStep on mobile

---

## Benefits

1. **Simplified UX for form entry** - Users focus on one thing at a time (steps 1-5)
2. **Split view for final review** - Desktop users see summary and submit CTA side-by-side
3. **Split view for confirmation** - Desktop users see all confirmation info at a glance
4. **Buttons always visible** - Sticky footer ensures navigation is never hidden
5. **Reduced code complexity** - Remove split-view logic from 5 of 6 steps
6. **Consistent mobile experience** - Zero changes to mobile layouts
