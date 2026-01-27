
# Customer Portal Enhancement & Desktop Layout Plan

## Overview

This plan addresses three interconnected requirements:
1. **Customer Contact Info Display** - Show the customer's own contact details (name, email, phone) in the portal so they can verify their information when making payments
2. **Desktop Quote Form Enhancement** - Create a full-viewport, split-view layout for the quote form on desktop while preserving mobile
3. **Desktop Portal Enhancement** - Create a full-viewport, split-view layout for the customer portal on desktop while preserving mobile

---

## Part 1: Customer Contact Information Card

### Current State
The `CustomerEstimateView.tsx` already receives the full `quote` object from the `useEstimateAccess` hook, which includes:
- `quote.contact_name`
- `quote.email`
- `quote.phone`
- `quote.guest_count_with_restrictions` (vegetarian guest count)

However, this contact information is **not displayed** to the customer - it's only used internally for email addresses and API calls.

### Implementation

**New Component: `CustomerContactCard.tsx`**

Create a compact, visually distinct card that displays:
- Customer name (with a friendly "Your Details" header)
- Email address (with mailto link)
- Phone number (with tel link)
- Optional: Vegetarian guest count if provided

**Design Considerations:**
- Position prominently near the top of the portal (after header, before Event Details)
- Use a subtle highlight/accent background to differentiate from other cards
- Keep it compact - customers don't need to edit, just verify

**Integration:**
- Add to `CustomerEstimateView.tsx` immediately after the status badges
- Pass `quote.contact_name`, `quote.email`, `quote.phone`, and optionally `quote.guest_count_with_restrictions`

---

## Part 2: Desktop Quote Form Split-View Layout

### Current State
- Quote form pages (`RegularEventQuote.tsx`, `WeddingEventQuote.tsx`) use `SinglePageQuoteForm` with `layout="fullscreen"`
- The form is constrained to `max-w-5xl` centered in the viewport
- Same layout applies to both mobile and desktop
- Desktop has unused horizontal space on both sides

### Proposed Desktop Layout

**Split-View Concept (Desktop Only - 1024px+):**

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Exit] ─────────────── Event Quote ─────────────── Step X of 6        │
├────────────────────────────┬───────────────────────────────────────────┤
│                            │                                           │
│   ┌────────────────────┐   │   ┌─────────────────────────────────┐     │
│   │                    │   │   │                                 │     │
│   │   STICKY PREVIEW   │   │   │      FORM STEP CONTENT          │     │
│   │   CARD             │   │   │                                 │     │
│   │                    │   │   │   (Contact Info, Event,         │     │
│   │   - Event name     │   │   │    Menu, Supplies, etc.)        │     │
│   │   - Date/Time      │   │   │                                 │     │
│   │   - Guest count    │   │   │                                 │     │
│   │   - Location       │   │   │                                 │     │
│   │                    │   │   │                                 │     │
│   │                    │   │   │                                 │     │
│   │   Trust badges     │   │   │                                 │     │
│   │   & contact info   │   │   │                                 │     │
│   │                    │   │   │                                 │     │
│   └────────────────────┘   │   └─────────────────────────────────┘     │
│        35% width           │              65% width                    │
└────────────────────────────┴───────────────────────────────────────────┘
│ [Back]                                                     [Continue] │
└────────────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Left Panel (35%)**: Sticky preview card showing entered data + trust indicators
- **Right Panel (65%)**: Current step content (scrollable if needed)
- Full viewport height usage with proper overflow handling
- Progress bar spans full width in header
- Navigation buttons span full width in footer

**Implementation Approach:**
1. Create `DesktopQuoteLayout.tsx` wrapper component
2. Create `QuotePreviewSidebar.tsx` for the left panel
3. Modify `SinglePageQuoteForm.tsx` to accept a new `desktopLayout` prop
4. Update page components to conditionally render split layout on desktop

---

## Part 3: Desktop Customer Portal Split-View Layout

### Current State
- `CustomerEstimateView.tsx` renders all content in a single column
- Maximum width constrained to `max-w-3xl`
- Same layout on mobile and desktop
- Desktop has significant unused horizontal space

### Proposed Desktop Layout

**Split-View Concept (Desktop Only - 1024px+):**

```
┌────────────────────────────────────────────────────────────────────────┐
│                     Soul Train's Eatery                                │
│                   Your Custom Catering Estimate                        │
│              [Estimate: Ready for Review] [Payment: Due Now]           │
├────────────────────────────┬───────────────────────────────────────────┤
│                            │                                           │
│   ┌────────────────────┐   │   ┌─────────────────────────────────┐     │
│   │   YOUR DETAILS     │   │   │                                 │     │
│   │   Name, Email, Ph  │   │   │   PAYMENT SECTION               │     │
│   └────────────────────┘   │   │   (When approved - primary)     │     │
│                            │   │                                 │     │
│   ┌────────────────────┐   │   │   OR                            │     │
│   │   EVENT DETAILS    │   │   │                                 │     │
│   │   - Event name     │   │   │   MENU & PRICING                │     │
│   │   - Date/Time      │   │   │   (Before approval - primary)   │     │
│   │   - Guests         │   │   │                                 │     │
│   │   - Location       │   │   │                                 │     │
│   │   - Services       │   │   │                                 │     │
│   └────────────────────┘   │   │                                 │     │
│                            │   │                                 │     │
│   ┌────────────────────┐   │   └─────────────────────────────────┘     │
│   │   TERMS (collapse) │   │                                           │
│   └────────────────────┘   │   ┌─────────────────────────────────┐     │
│                            │   │   ACTIONS (Approve/Changes)     │     │
│   ┌────────────────────┐   │   └─────────────────────────────────┘     │
│   │   NEED HELP?       │   │                                           │
│   │   Phone & Email    │   │   ┌─────────────────────────────────┐     │
│   └────────────────────┘   │   │   NOTES FROM CATERER (if any)   │     │
│        35% width           │   └─────────────────────────────────┘     │
│                            │              65% width                    │
└────────────────────────────┴───────────────────────────────────────────┘
```

**Key Features:**
- **Left Panel (35%)**: Customer details, event summary, terms, contact info (scrollable, sticky top)
- **Right Panel (65%)**: Payment card (primary after approval), Menu & Pricing, Actions, Notes
- Full viewport width utilization
- Both panels independently scrollable on tall content

**Implementation Approach:**
1. Create `CustomerPortalDesktopLayout.tsx` wrapper
2. Create `CustomerDetailsSidebar.tsx` for left panel (customer contact + event details + terms)
3. Refactor `CustomerEstimateView.tsx` to conditionally render:
   - Desktop: Split layout with ResizablePanelGroup
   - Mobile: Current single-column layout (unchanged)
4. Use `useIsMobile()` hook for conditional rendering

---

## Technical Implementation Details

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/customer/CustomerContactCard.tsx` | Display customer's own contact info |
| `src/components/customer/CustomerDetailsSidebar.tsx` | Left panel for desktop portal layout |
| `src/components/quote/QuotePreviewSidebar.tsx` | Left panel for desktop form layout |
| `src/components/quote/DesktopQuoteLayout.tsx` | Wrapper for desktop split-view form |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/customer/CustomerEstimateView.tsx` | Add contact card, add desktop split layout conditional rendering |
| `src/components/quote/SinglePageQuoteForm.tsx` | Add desktop layout variant support |
| `src/pages/RegularEventQuote.tsx` | Conditional desktop layout rendering |
| `src/pages/WeddingEventQuote.tsx` | Conditional desktop layout rendering |

### Key Patterns to Follow

1. **Desktop Detection**: Use `useIsMobile()` hook (already exists, uses 1024px breakpoint)
2. **Responsive Container**: Use `ResizablePanelGroup` for split panels (already used in admin)
3. **Preserve Mobile**: All mobile layouts remain completely unchanged
4. **Scroll Management**: Each panel uses `ScrollArea` for independent scrolling

---

## Implementation Order

1. **Phase 1: Customer Contact Card** (Simplest, immediate value)
   - Create `CustomerContactCard.tsx`
   - Add to `CustomerEstimateView.tsx` for all screen sizes
   - Shows customer their own name, email, phone

2. **Phase 2: Desktop Portal Split Layout**
   - Create sidebar component for left panel
   - Modify `CustomerEstimateView.tsx` with conditional rendering
   - Test desktop layout, verify mobile unchanged

3. **Phase 3: Desktop Quote Form Split Layout**
   - Create preview sidebar component
   - Create desktop layout wrapper
   - Modify form pages with conditional rendering
   - Test desktop layout, verify mobile unchanged

---

## Mobile Layout Preservation

**Critical**: No changes to mobile layouts. The implementation uses the `useIsMobile()` hook to conditionally render:

```tsx
// Pattern used throughout
const isMobile = useIsMobile();

if (isMobile) {
  return <MobileLayout>...</MobileLayout>;
}

return <DesktopSplitLayout>...</DesktopSplitLayout>;
```

This pattern is already proven in:
- `SplitHero.tsx` (hero section uses overlay on mobile, 60/40 split on desktop)
- `EventEstimateFullView.tsx` (admin uses split panels on desktop)

---

## Benefits

1. **Customer Confidence**: Seeing their own contact info helps customers verify they're viewing the correct estimate before payment
2. **Desktop Utilization**: Full viewport width on large screens creates a more immersive, professional experience
3. **Information Hierarchy**: Split layout on desktop allows simultaneous viewing of summary and details
4. **Consistency**: Follows existing admin panel patterns for familiar UX
5. **Mobile Preservation**: Zero impact on mobile experience where vertical layouts work best
