

## Goal
Simplify the Regular Event Quote and Wedding Event Quote pages by removing the Hero/Header sections and CTA sections, leaving only the core form with clear exit navigation. This creates a focused, distraction-free form experience.

## Current State Analysis

Looking at the desktop screenshot and code:

**Current flow (desktop)**:
```text
┌─────────────────────────────────────┐
│           Site Header               │
├─────────────────────────────────────┤
│         HERO SECTION                │  ← Remove this
│  "Request Your Perfect Event Quote" │
│       (marketing copy)              │
├─────────────────────────────────────┤
│         STEP PROGRESS               │
│       (Step 1 of 6 • Contact)       │
├─────────────────────────────────────┤
│           FORM CONTENT              │  ← Keep this
│      (fields, navigation)           │
├─────────────────────────────────────┤
│          CTA SECTION                │  ← Remove this
│   "Questions About Your Event?"     │
├─────────────────────────────────────┤
│           Site Footer               │
└─────────────────────────────────────┘
```

**Current flow (mobile)**: Already simpler—Header/Footer are hidden, and there's a sticky "Exit" bar at top. But the page wrapper still includes the Hero above the form.

## Proposed Simplified Flow

**After changes (both desktop and mobile)**:
```text
┌─────────────────────────────────────┐
│   Exit Bar (logo + "Exit" button)   │  ← New: Always visible on desktop too
├─────────────────────────────────────┤
│         STEP PROGRESS               │
│       (Step 1 of 6 • Contact)       │
├─────────────────────────────────────┤
│           FORM CONTENT              │
│      (fields, navigation)           │
│                                     │
│   (contact info shown in footer     │
│    of form or on final step)        │
└─────────────────────────────────────┘
```

## Why This Is the Right MVP Approach

1. **Reduces cognitive load**: Users clicking "Get Quote" from the homepage have already made the decision—they don't need more marketing copy
2. **Faster time-to-first-field**: The form fields are immediately visible without scrolling
3. **Consistent experience**: Desktop and mobile both feel like a focused "wizard" flow
4. **No functionality breakage**: We're only removing wrapper elements (Hero, CTA), not touching form logic, validation, submission, or edge functions
5. **Contact info preserved**: The form's Review step and the Thank You page already show contact info; we can optionally add a subtle help link in the form footer

## Implementation Details

### A) Update `RegularEventQuote.tsx`
- Remove the Hero section (`<div ref={heroRef} ...>` block with title/description)
- Remove the `<CTASection>` component
- Remove unused animation hooks (`useScrollAnimation`, `useAnimationClass` for hero)
- Simplify to just render the `<SinglePageQuoteForm>` with appropriate layout
- For desktop: switch to `layout="fullscreen"` (or keep as embedded but hide site chrome)

### B) Update `WeddingEventQuote.tsx`
- Same changes: remove `<header>` hero block, remove `<CTASection>`
- Remove unused animation hooks
- Simplify to just the form

### C) Update `App.tsx` (optional enhancement)
- For MVP simplicity, consider hiding Header/Footer for quote wizard routes on **all devices** (not just mobile)
- This gives a consistent "focused wizard" experience
- Change: `const hideChrome = isEventFullView || isEventMenuEdit || isEstimatePrint || isQuoteWizardRoute;`
- (Remove the `&& isMobile` condition)

### D) Enhance `SinglePageQuoteForm.tsx` Exit Experience (desktop)
- Currently, the "Exit" button only shows in the mobile sticky header
- For desktop fullscreen mode, add an Exit option to the progress bar area or as a subtle link
- This ensures users can always exit without confusion

### E) Optional: Add Help/Contact Link in Form
- Since we're removing the CTA section, add a small "Need help? Call (843) 970-0265" link in the form navigation footer or on the Review step
- This preserves the contact info without the marketing section

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/RegularEventQuote.tsx` | Remove Hero section, remove CTASection, simplify imports |
| `src/pages/WeddingEventQuote.tsx` | Remove Hero section, remove CTASection, simplify imports |
| `src/App.tsx` | (Optional) Hide chrome for all quote wizard routes, not just mobile |
| `src/components/quote/SinglePageQuoteForm.tsx` | Add Exit button for desktop layout |
| `src/components/quote/StepNavigation.tsx` | (Optional) Add subtle help link |

## What Will NOT Change
- Form validation logic (`formSchema.ts`)
- Submission handlers and edge function integrations
- Step navigation and progress tracking
- Database schema
- Email workflows
- Thank You page experience

## Verification
1. Navigate to `/request-quote/regular` on desktop—should show only the form wizard with Exit option
2. Navigate to `/request-quote/wedding` on desktop—same behavior
3. Test on mobile—same focused experience (already close to this)
4. Complete a test submission—confirm workflow still works end-to-end
5. Click Exit—should return to `/request-quote` selection page

## Summary
Yes, this is the best way to simplify without breaking functionality. We're only removing presentational wrapper elements (Hero marketing copy, CTA section) and keeping all form logic intact. The result is a cleaner, faster, more focused quote request experience that matches modern wizard patterns.

