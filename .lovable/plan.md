

## Updated Plan: Cancel Event in Collapsible for Safety

### Step 1: Fix destructive button variant (`src/components/ui/button.tsx`)
- Remove `neumorphic-card-2` from `destructive` variant, replace with `shadow-sm`

### Step 2: Fix ghost button contrast (`EventDetailsPanelContent.tsx`)
- Change edit buttons from `variant="ghost"` to `variant="outline"`, size `h-8 w-8`, icons `h-4 w-4`

### Step 3: Move Cancel Event to bottom of desktop panel in a Collapsible (`EventDetailsPanelContent.tsx`)
- Remove the Cancel Event block from lines 135-153
- After `<ChangeHistory>` (line 449), add:
  - Separator
  - A `Collapsible` wrapper with a `CollapsibleTrigger` labeled "Danger Zone" (muted, small text with a chevron)
  - Inside `CollapsibleContent`: the destructive Cancel Event button
- This prevents accidental presses — admin must expand the section first

### Step 4: Add Send Thank You to mobile completed state (`MobileEstimateView.tsx`)
- Destructure `handleSendThankYou` / `isSendingThankYou` from `useEstimateActions`
- Add Send Thank You button next to the Completed badge (line 286-292)

### Step 5: Add Cancel Event to mobile bottom in a Collapsible (`MobileEstimateView.tsx`)
- Import `useUpdateQuoteStatus`, `XCircle`, `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`
- Add `handleCancelEvent` with `window.confirm`
- At bottom of ScrollArea content, after the last card: add same Collapsible "Danger Zone" pattern with destructive Cancel button inside
- Only visible when `workflow_status !== 'cancelled'`

### What stays untouched
- Mark Complete logic (already working on both views)
- All other workflows, database, routes

