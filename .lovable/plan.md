

# Request Quote & Customer Portal Desktop UX Improvements

## Overview

This plan addresses two pages with desktop-only layout optimizations:

1. **Request Quote Page**: Extract CTAs from inside the cards and position them above each card
2. **Customer Portal**: Restructure the PaymentCard to show the payment CTA at the top (before the schedule), and evaluate a 3-column layout

---

## Part 1: Request Quote Page - CTAs Above Cards

### Current State
- Two event type cards ("Regular Events" and "Formal & Military Events")
- Each card contains: Icon, Title, Description, Feature List, and CTA Button at the bottom
- CTA buttons are embedded inside the card, requiring users to scan the entire card before seeing the action

### Proposed Change (Desktop Only)

Position the CTA buttons **above** each card as standalone, prominent call-to-action elements:

```text
CURRENT (Desktop):                          PROPOSED (Desktop):
┌──────────────────┐ ┌──────────────────┐    [Get Regular Quote] [Get Formal Quote]
│  Icon + Title    │ │  Icon + Title    │    ┌──────────────────┐ ┌──────────────────┐
│  Description     │ │  Description     │    │  Icon + Title    │ │  Icon + Title    │
│  • Feature 1     │ │  • Feature 1     │    │  Description     │ │  Description     │
│  • Feature 2     │ │  • Feature 2     │    │  • Feature 1     │ │  • Feature 1     │
│  • Feature 3     │ │  • Feature 3     │    │  • Feature 2     │ │  • Feature 2     │
│  • Feature 4     │ │  • Feature 4     │    │  • Feature 3     │ │  • Feature 3     │
│ [GET QUOTE BTN]  │ │ [GET QUOTE BTN]  │    │  • Feature 4     │ │  • Feature 4     │
└──────────────────┘ └──────────────────┘    └──────────────────┘ └──────────────────┘
```

### Implementation Approach

**File: `src/components/quote/QuoteFormSelector.tsx`**

1. Add a new section **above** the cards grid for desktop only:
   - Two side-by-side CTA buttons matching the card grid alignment
   - Use `hidden lg:flex` to show only on desktop
   - Style with prominent colors and hover effects matching existing CTAs

2. Hide the in-card CTAs on desktop:
   - Add `lg:hidden` class to the existing CTA buttons inside each card
   - Mobile continues to see CTAs inside the cards (unchanged behavior)

### Benefits
- CTAs are immediately visible without scrolling
- Cards become informational only, reducing cognitive load
- Clear visual hierarchy: Action first, details second
- Maintains mobile behavior where in-card CTAs work well

---

## Part 2: Customer Portal - Payment CTA at Top

### Current State

The PaymentCard component structure:
1. Card Header ("Make a Payment" / "Payment Schedule")
2. Progress bar section
3. Milestone schedule (3 rows for Deposit, Milestone, Final)
4. Tabs (Scheduled, Custom, Full Balance)
5. **CTA button at bottom** (inside tab content)

This means the actual "Pay $X" button is ~500px below the card header, often below the fold.

### Proposed Change (Desktop Only)

Restructure PaymentCard to show a **Quick Pay** section at the TOP, before the schedule:

```text
CURRENT:                                    PROPOSED:
┌─────────────────────────────┐            ┌─────────────────────────────┐
│ 💳 Make a Payment           │            │ 💳 Make a Payment           │
│ Balance remaining: $457.80  │            │ Balance remaining: $457.80  │
├─────────────────────────────┤            ├─────────────────────────────┤
│ Progress: 0% [━━━━━━━━━━━━] │            │ ┌─────────────────────────┐ │
├─────────────────────────────┤            │ │ 🔥 DEPOSIT Due Now      │ │
│ DEPOSIT    Due Now   $45.78 │            │ │ $45.78   [PAY NOW]      │ │
│ MILESTONE  Mar 29   $228.90 │            │ └─────────────────────────┘ │
│ FINAL      Apr 14   $183.12 │            ├─────────────────────────────┤
├─────────────────────────────┤            │ Progress: 0% [━━━━━━━━━━━━] │
│ [Scheduled][Custom][Full]   │            ├─────────────────────────────┤
│ ┌─────────────────────────┐ │            │ Upcoming Payments           │
│ │ Payment Due Now         │ │            │ DEPOSIT    Due Now   $45.78 │
│ │ DEPOSIT (10%)   $45.78  │ │            │ MILESTONE  Mar 29   $228.90 │
│ │ [    PAY $45.78     ]   │ │            │ FINAL      Apr 14   $183.12 │
│ └─────────────────────────┘ │            ├─────────────────────────────┤
└─────────────────────────────┘            │ Other Payment Options       │
                                           │ [Custom Amount][Pay in Full]│
                                           └─────────────────────────────┘
```

### Implementation Approach

**File: `src/components/customer/PaymentCard.tsx`**

1. Add a new **Quick Pay CTA** section immediately after the header (desktop only):
   - If there's a milestone due now, show a highlighted box with the amount and a prominent "Pay Now" button
   - If no milestone is due but there are unpaid milestones, show "Pay Next Milestone" option
   - This section uses `hidden lg:block` to only appear on desktop

2. Simplify the tabs section on desktop:
   - Instead of 3 tabs, show a compact "Other Payment Options" row with "Custom Amount" and "Pay Full Balance" buttons
   - Keep the full tabs interface on mobile where vertical space is expected

3. Reorder the card content for desktop:
   - Quick Pay CTA (new, top position)
   - Progress bar
   - Milestone schedule (read-only list, no inline actions)
   - Other payment options (Custom/Full buttons)

### Benefits
- Payment CTA is visible immediately in the viewport (within first 200px of card)
- Progress bar provides context without requiring scroll
- Schedule becomes informational, not the primary interaction point
- Reduces vertical height of the card significantly

---

## Part 3: Customer Portal - 3-Column Layout Evaluation

### Analysis

Currently: 35% (sidebar) / 65% (main content) = 2 columns

The screenshot shows:
- Left panel has significant whitespace below "Need Help?" section
- Right panel content (PaymentCard) extends beyond the fold

### 3-Column Layout Concept

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        Soul Train's Eatery                              │
│                   Your Custom Catering Estimate                         │
│                 [Approved] [Deposit Due]                                │
├───────────────────┬──────────────────────────┬──────────────────────────┤
│                   │                          │                          │
│  YOUR DETAILS     │  PAYMENT                 │  MENU & PRICING          │
│  ├── Name         │  ├── Quick Pay CTA       │  ├── Line items table    │
│  ├── Email        │  ├── Progress            │  ├── Subtotal            │
│  ├── Phone        │  └── Schedule            │  ├── Tax                 │
│                   │                          │  └── Total               │
│  EVENT DETAILS    │  OTHER OPTIONS           │                          │
│  ├── Event name   │  ├── Custom Amount       │  CATERER NOTES           │
│  ├── Date/Time    │  └── Pay in Full         │  └── Notes content       │
│  ├── Guests       │                          │                          │
│  └── Location     │                          │  ACTIONS                 │
│                   │                          │  ├── Request Changes     │
│  TERMS (collapse) │                          │  └── Status info         │
│                   │                          │                          │
│  NEED HELP?       │                          │                          │
│  ├── Phone        │                          │                          │
│  └── Email        │                          │                          │
│                   │                          │                          │
│     25% width     │       35% width          │       40% width          │
└───────────────────┴──────────────────────────┴──────────────────────────┘
```

### Recommendation: Proceed with 3-Column Layout

**Benefits:**
- Payment gets its own dedicated column (center focus)
- Menu/Pricing and Actions get their own column (right)
- Customer/Event details stay in left column (reference information)
- Reduces vertical scrolling significantly
- Better use of horizontal space on wide screens

**Implementation Approach:**

**File: `src/components/customer/CustomerEstimateView.tsx`**

1. Change from 2-panel to 3-panel layout on desktop:
   - Left panel (25%): CustomerDetailsSidebar (unchanged)
   - Center panel (35%): PaymentCard (with Quick Pay CTA at top)
   - Right panel (40%): Menu & Pricing, Caterer Notes, Actions

2. Use `ResizablePanelGroup` with 3 panels:
   ```tsx
   <ResizablePanelGroup direction="horizontal">
     <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
       <CustomerDetailsSidebar />
     </ResizablePanel>
     <ResizableHandle withHandle />
     <ResizablePanel defaultSize={35} minSize={30} maxSize={40}>
       <PaymentCard {...} />
     </ResizablePanel>
     <ResizableHandle withHandle />
     <ResizablePanel defaultSize={40} minSize={35}>
       <MenuAndActionsPanel />
     </ResizablePanel>
   </ResizablePanelGroup>
   ```

3. Create a new `PaymentPanel` component that wraps PaymentCard for the center column

4. Create a new `MenuActionsPanel` component for the right column containing:
   - Menu & Pricing card
   - Caterer Notes (if any)
   - Customer Actions

---

## Summary of Changes

| File | Changes |
|------|---------|
| `src/components/quote/QuoteFormSelector.tsx` | Add CTAs above cards (desktop), hide in-card CTAs on desktop |
| `src/components/customer/PaymentCard.tsx` | Add Quick Pay CTA section at top, simplify tabs on desktop |
| `src/components/customer/CustomerEstimateView.tsx` | Change to 3-column layout on desktop |
| `src/components/customer/MenuActionsPanel.tsx` (new) | Right column with menu, notes, actions |

---

## Mobile Preservation

All changes use responsive classes (`lg:hidden`, `hidden lg:block`, `lg:grid-cols-3`) to ensure:
- Mobile quote page: CTAs remain inside cards
- Mobile portal: Single-column layout unchanged
- Tablet (<1024px): Falls back to current 2-column or mobile layout

---

## Visual Impact Summary

**Request Quote Page:**
- CTAs move from bottom of cards to above cards on desktop
- ~100px vertical savings, better conversion focus

**Customer Portal:**
- Payment CTA moves from ~500px down to ~100px down (within viewport)
- 3-column layout eliminates most vertical scrolling
- All key information visible at once on wide screens

