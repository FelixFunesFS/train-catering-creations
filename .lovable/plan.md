
# Formal Event Quote + Military Organization Field (Both Forms)

## Overview

This plan implements:
1. Replace "Wedding Quote" with "Formal Event Quote" in the form header
2. Update the quote selector card to say "Formal & Military Events"
3. Add a conditional "Military Organization" input field that appears on **BOTH** regular and formal quote forms when "Military Function" is selected
4. Display the military organization throughout the system (admin, customer portal, emails, PDF)

---

## Part 1: Rename "Wedding Quote" to "Formal Event Quote"

### Files to Modify

| File | Line | Change |
|------|------|--------|
| `src/components/quote/SinglePageQuoteForm.tsx` | 473 | Change `'Wedding Quote'` to `'Formal Event Quote'` |
| `src/components/quote/QuoteFormSelector.tsx` | 75 | Change title "Wedding & Black Tie Events" to "Formal & Military Events" |
| `src/components/quote/QuoteFormSelector.tsx` | 77 | Update description to emphasize formal events |
| `src/components/quote/QuoteFormSelector.tsx` | 102 | Change button text "Get Wedding Quote" to "Get Formal Event Quote" |

---

## Part 2: Add Military Organization Field (Database)

### Database Migration

```sql
-- Add military_organization column to quote_requests
ALTER TABLE quote_requests 
ADD COLUMN military_organization TEXT;

COMMENT ON COLUMN quote_requests.military_organization IS 
  'Military unit name (squadron, group, battalion, etc.) for military_function events';
```

---

## Part 3: Add Military Organization Field (Form Schema)

### src/components/quote/alternative-form/formSchema.ts

Add field to schema (around line 110, before the refine):
```typescript
// Military-specific field (optional)
military_organization: z.string().optional(),
```

---

## Part 4: Add Military Organization Input (Form UI)

### src/components/quote/steps/EventDetailsStep.tsx

Add import for Shield icon:
```typescript
import { Shield } from "lucide-react";
```

After the event_type FormField (around line 171), add a conditional field:
```tsx
{/* Military Organization - appears when military_function is selected */}
{form.watch('event_type') === 'military_function' && (
  <FormField
    control={form.control}
    name="military_organization"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="flex items-center">
          <Shield className="h-4 w-4 mr-1 text-blue-600" />
          Military Organization
          <span className="text-xs text-muted-foreground ml-2">(Recommended)</span>
        </FormLabel>
        <FormControl>
          <Input
            placeholder="e.g., 437th Airlift Wing, Marine Corps Logistics Base"
            className="h-12 text-base input-clean"
            {...field}
            onFocus={() => trackFieldInteraction('military_organization')}
          />
        </FormControl>
        <p className="text-xs text-muted-foreground">
          Squadron, wing, battalion, or unit name
        </p>
        <FormMessage />
      </FormItem>
    )}
  />
)}
```

This field will appear on **BOTH** regular and formal quote forms since both have `military_function` in their event type options.

---

## Part 5: Update Form Submission

### src/components/quote/SinglePageQuoteForm.tsx

**Line 98-134 (defaultValues):** Add:
```typescript
military_organization: "",
```

**Line 292-328 (submitPayload):** Add:
```typescript
military_organization: data.military_organization || null,
```

---

## Part 6: Update Edge Function

### supabase/functions/submit-quote-request/index.ts

Add to insertPayload (around line 117):
```typescript
military_organization: payload.military_organization ? String(payload.military_organization).trim().slice(0, 200) : null,
```

---

## Part 7: Create Utility Function

### src/utils/eventTypeUtils.ts (new file)

```typescript
/**
 * Military event detection and styling utilities
 */

export const isMilitaryEvent = (eventType: string | null | undefined): boolean => {
  return eventType === 'military_function';
};

export const getMilitaryBadgeStyles = () => ({
  className: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  iconColor: 'text-blue-600'
});
```

---

## Part 8: Display in Admin Views

### src/components/admin/events/EventDetailsPanelContent.tsx

After event type display, add military organization info:
```tsx
{isMilitaryEvent(quote.event_type) && (
  <div className="flex items-center gap-2">
    <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">
      <Shield className="h-3 w-3 mr-1" />
      Military Function
    </Badge>
    {quote.military_organization && (
      <span className="text-sm text-blue-700">
        {quote.military_organization}
      </span>
    )}
  </div>
)}
```

### src/components/admin/events/EventSummaryPanel.tsx

Add military badge in header section if applicable.

---

## Part 9: Display in Customer Views

### src/components/customer/CustomerEstimateView.tsx

In event details section, display military organization with badge styling.

### src/components/quote/ReviewSummaryCard.tsx

In the Event Details review section, show military organization if entered:
```tsx
{formData.event_type === 'military_function' && formData.military_organization && (
  <div className="flex items-center gap-2">
    <Shield className="h-4 w-4 text-blue-600" />
    <span className="text-blue-700">{formData.military_organization}</span>
  </div>
)}
```

---

## Part 10: Display in Email Templates

### supabase/functions/_shared/emailTemplates.ts

In `generateEventDetailsCard()` function, add military badge after event name:

```typescript
${quote.event_type === 'military_function' ? `
<span style="display:inline-block;background:#dbeafe;color:#1d4ed8;font-size:12px;padding:2px 8px;border-radius:4px;margin-left:8px;vertical-align:middle;">Military Function</span>
` : ''}
${quote.military_organization ? `
<p style="margin:8px 0 0 0;font-size:14px;color:#1d4ed8;">
  Organization: ${quote.military_organization}
</p>
` : ''}
```

---

## Part 11: Display in PDF

### supabase/functions/generate-invoice-pdf/index.ts

In the event details section, add military organization text:
```typescript
if (quote?.event_type === 'military_function') {
  doc.setTextColor(BLUE.r, BLUE.g, BLUE.b);
  doc.text('Military Function', margin, yPos);
  if (quote.military_organization) {
    yPos += 5;
    doc.text(`Organization: ${quote.military_organization}`, margin, yPos);
  }
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
}
```

---

## Summary of All Changes

| Area | File | Action |
|------|------|--------|
| Form Title | SinglePageQuoteForm.tsx | "Wedding Quote" to "Formal Event Quote" |
| Form Selector | QuoteFormSelector.tsx | Update card title, description, button |
| Database | Migration | Add `military_organization` column |
| Schema | formSchema.ts | Add optional `military_organization` field |
| Form UI | EventDetailsStep.tsx | Add conditional input (appears on BOTH forms) |
| Form Submit | SinglePageQuoteForm.tsx | Add to default values + payload |
| Edge Function | submit-quote-request/index.ts | Add to INSERT |
| Utility | eventTypeUtils.ts | Create helper functions |
| Admin View | EventDetailsPanelContent.tsx | Display organization + badge |
| Admin Summary | EventSummaryPanel.tsx | Add military badge |
| Customer Portal | CustomerEstimateView.tsx | Display organization |
| Review Step | ReviewSummaryCard.tsx | Show organization in review |
| Email | emailTemplates.ts | Add badge + organization |
| PDF | generate-invoice-pdf/index.ts | Add organization text |

---

## User Experience Flow

1. Customer opens either Regular Event Quote OR Formal Event Quote
2. Selects "Military Function" from event type dropdown
3. A new field appears: "Military Organization" with placeholder text
4. Field is optional but labeled as "Recommended"
5. If filled in, organization appears:
   - In the Review step before submission
   - In admin event details with a blue "Military Function" badge
   - In customer estimate portal
   - In all transactional emails with styled badge
   - In PDF documents

---

## Backward Compatibility

- Existing military function events without organization will display normally
- Field is nullable - no issues with existing data
- Badge appears based on event_type; organization is additional context
- No breaking changes to existing workflows
