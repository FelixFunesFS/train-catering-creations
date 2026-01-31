
# Mobile Optimization Plan: Email Preview Modal

## Current Issues Identified

The EmailPreview modal (`src/components/admin/billing/EmailPreview.tsx`) has several mobile responsiveness problems:

| Issue | Location | Problem |
|-------|----------|---------|
| Fixed width modal | Line 77 | `sm:max-w-4xl` is large but no mobile-specific width handling |
| Large fixed iframe height | Line 109 | `min-h-[500px]` causes overflow on mobile screens |
| Horizontal button layout | Lines 160-178 | "Sending to" text + buttons side-by-side causes overflow |
| Fixed margins | Lines 86, 118, 160 | `mx-6`, `p-6` margins too large for mobile |
| Recipient toggle layout | Lines 119-133 | "Recipient" + "Send to different email" side-by-side causes wrapping |
| Long button text | Lines 166-177 | "Cancel" and "Confirm & Send" buttons don't stack on mobile |

## Design Approach

Following established patterns in the codebase:

1. **Modal Width Pattern** (from `ChangeRequestsPanel.tsx` line 179):
   ```tsx
   className="w-[calc(100vw-1rem)] sm:max-w-4xl"
   ```
   Uses full viewport width minus small margin on mobile, fixed max on desktop.

2. **Button Stacking Pattern** (from `DialogFooter` in `dialog.tsx` line 91):
   ```tsx
   className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
   ```
   Buttons stack vertically on mobile (confirm button on top), horizontal on desktop.

3. **Responsive Padding Pattern** (from `EventEstimateFullView.tsx` line 354):
   ```tsx
   className="p-4 sm:p-6"
   ```
   Smaller padding on mobile, larger on desktop.

4. **Full-Width Mobile Buttons Pattern** (from `button.tsx` line 38-40):
   ```tsx
   className="w-full sm:w-auto"
   ```
   Buttons take full width on mobile for easier tapping.

---

## Proposed Changes

### File: `src/components/admin/billing/EmailPreview.tsx`

### Change 1: Responsive Modal Container (Line 77)
```tsx
// Before
<DialogContent className="sm:max-w-4xl p-0">

// After
<DialogContent className="w-[calc(100vw-1rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
```
- Full viewport width on mobile minus small margin
- Constrained height with scroll for very small screens
- Prevents horizontal overflow

### Change 2: Responsive Header Padding (Line 78)
```tsx
// Before
<DialogHeader className="p-6 pb-0 flex-shrink-0">

// After
<DialogHeader className="p-4 sm:p-6 pb-0 flex-shrink-0">
```
- Smaller padding on mobile

### Change 3: Responsive Title (Lines 79-82)
```tsx
// Before
<DialogTitle className="flex items-center gap-2">
  <Eye className="h-5 w-5" />
  {isResend ? 'Resend Estimate' : 'Email Preview'} - Exact Customer View
</DialogTitle>

// After
<DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
  <Eye className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
  <span className="truncate">
    {isResend ? 'Resend Estimate' : 'Email Preview'}
    <span className="hidden sm:inline"> - Exact Customer View</span>
  </span>
</DialogTitle>
```
- Smaller icon and text on mobile
- Hide "Exact Customer View" subtitle on mobile to save space
- Prevent text overflow with truncate

### Change 4: Responsive Preview Container Margins (Line 86)
```tsx
// Before
<div className="flex-1 overflow-hidden mx-6 mb-4">

// After
<div className="flex-1 overflow-hidden mx-4 sm:mx-6 mb-4">
```
- Smaller horizontal margins on mobile

### Change 5: Responsive Iframe Height (Line 109)
```tsx
// Before
className="w-full h-full min-h-[500px] bg-white"

// After
className="w-full h-full min-h-[300px] sm:min-h-[500px] bg-white"
```
- Reduced minimum height on mobile (300px vs 500px)
- Still provides usable preview area without causing overflow

### Change 6: Responsive Recipient Section (Lines 118-133)
```tsx
// Before
<div className="mx-6 mb-4 p-4 bg-muted/30 rounded-lg border">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <Mail className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">Recipient</span>
    </div>
    <div className="flex items-center gap-2">
      <Label htmlFor="alternate-email" className="text-sm text-muted-foreground">
        Send to different email
      </Label>
      <Switch ... />
    </div>
  </div>

// After
<div className="mx-4 sm:mx-6 mb-4 p-3 sm:p-4 bg-muted/30 rounded-lg border">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
    <div className="flex items-center gap-2">
      <Mail className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">Recipient</span>
    </div>
    <div className="flex items-center gap-2">
      <Label htmlFor="alternate-email" className="text-xs sm:text-sm text-muted-foreground">
        Different email
      </Label>
      <Switch ... />
    </div>
  </div>
```
- Smaller margins and padding on mobile
- Stack label/toggle vertically on mobile, horizontal on desktop
- Shorter label text on mobile ("Different email" vs "Send to different email")

### Change 7: Responsive Footer Actions (Lines 159-179)
```tsx
// Before
<div className="flex justify-between items-center p-6 pt-0 flex-shrink-0 border-t bg-muted/30">
  <p className="text-sm text-muted-foreground">
    {isResend && <span className="text-amber-600 font-medium mr-2">↻ Resending</span>}
    Sending to: <strong>{recipientEmail}</strong>
  </p>
  <div className="flex gap-2">
    <Button variant="outline" onClick={onClose}>
      <X className="h-4 w-4 mr-2" />
      Cancel
    </Button>
    <Button onClick={handleConfirmSend} disabled={...}>
      {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      <Send className="h-4 w-4 mr-2" />
      {isResend ? 'Resend Estimate' : 'Confirm & Send'}
    </Button>
  </div>
</div>

// After
<div className="flex flex-col gap-3 p-4 sm:p-6 pt-3 sm:pt-0 flex-shrink-0 border-t bg-muted/30">
  {/* Recipient info - full width on mobile */}
  <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
    {isResend && <span className="text-amber-600 font-medium mr-1 sm:mr-2">↻</span>}
    <span className="hidden sm:inline">Sending to: </span>
    <strong className="break-all">{recipientEmail}</strong>
  </p>
  
  {/* Buttons - stack on mobile, row on desktop */}
  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto min-h-[44px]">
      <X className="h-4 w-4 mr-2" />
      Cancel
    </Button>
    <Button 
      onClick={handleConfirmSend} 
      disabled={...}
      className="w-full sm:w-auto min-h-[44px]"
    >
      {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      <Send className="h-4 w-4 mr-2" />
      <span className="sm:hidden">{isResend ? 'Resend' : 'Send'}</span>
      <span className="hidden sm:inline">{isResend ? 'Resend Estimate' : 'Confirm & Send'}</span>
    </Button>
  </div>
</div>
```
- Vertical flex layout on mobile, maintains desktop behavior
- `flex-col-reverse` puts primary action (Send) on top on mobile
- Buttons go full-width on mobile with `w-full sm:w-auto`
- Minimum touch target height of 44px
- Shorter button text on mobile ("Send" vs "Confirm & Send")
- Email address wraps with `break-all` to prevent overflow

---

## Summary of Responsive Patterns Applied

| Pattern | Mobile | Desktop | Purpose |
|---------|--------|---------|---------|
| Modal width | `w-[calc(100vw-1rem)]` | `sm:max-w-4xl` | Prevents horizontal scroll |
| Padding | `p-4` | `sm:p-6` | More content space on mobile |
| Buttons | Stacked, full-width | Row, auto-width | Larger tap targets |
| Button text | Shortened | Full text | Fits in viewport |
| Iframe height | `min-h-[300px]` | `min-h-[500px]` | Prevents scroll overflow |
| Label text | Abbreviated | Full text | Fits in row |
| Title subtitle | Hidden | Visible | Prioritizes key info |

---

## Functionality Preserved

All existing workflows remain intact:

1. Preview loading/error states - unchanged logic
2. Alternate email toggle - same Switch component, just repositioned
3. Email validation - same validation logic
4. Send/Resend actions - same handlers, just styled differently
5. Close modal - same onClose behavior
6. Retry on error - same fetchPreview call

The changes are purely CSS-based responsive adjustments - no JavaScript logic is modified.
