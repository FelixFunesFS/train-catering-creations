
# Context-Aware Estimate Validity Implementation Plan

## Summary

Implement dynamic estimate validity messaging that adjusts based on event proximity, aligning with the existing payment schedule tiers. Rush events (within 14 days) will show "24-48 hours" validity instead of the standard "7 days" to create appropriate urgency.

## Validity Tiers (Aligned with Payment Schedule)

| Tier | Days Until Event | Estimate Validity | Payment Required |
|------|------------------|-------------------|------------------|
| **RUSH** | 0-14 days | 24-48 hours | 100% NOW |
| **SHORT_NOTICE** | 15-30 days | 3 days | 60% NOW |
| **MID_RANGE** | 31-44 days | 5 days | 60% NOW |
| **STANDARD** | 45+ days | 7 days | 10% deposit |
| **GOVERNMENT** | Any | 7 days (standard terms) | Net 30 |

## Technical Implementation

### File 1: `src/utils/paymentScheduling.ts`

Add new helper function to calculate estimate validity:

```typescript
// NEW: Get estimate validity period based on event proximity
export interface EstimateValidity {
  daysValid: number;
  displayText: string;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'standard';
  expirationDate: Date;
}

export const getEstimateValidity = (
  eventDate: Date,
  estimateSentDate: Date = new Date(),
  customerType: 'PERSON' | 'ORG' | 'GOV' = 'PERSON'
): EstimateValidity => {
  const daysUntilEvent = daysBetween(estimateSentDate, eventDate);
  
  // Government contracts always get standard validity
  if (customerType === 'GOV') {
    const expDate = new Date(estimateSentDate);
    expDate.setDate(expDate.getDate() + 7);
    return {
      daysValid: 7,
      displayText: '7 days',
      urgencyLevel: 'standard',
      expirationDate: expDate
    };
  }
  
  // Tiered validity based on event proximity
  if (daysUntilEvent <= 14) {
    // RUSH: Very short validity
    const expDate = new Date(estimateSentDate);
    expDate.setDate(expDate.getDate() + 2);
    return {
      daysValid: 2,
      displayText: '24-48 hours',
      urgencyLevel: 'critical',
      expirationDate: expDate
    };
  } else if (daysUntilEvent <= 30) {
    // SHORT_NOTICE: 3-day validity
    const expDate = new Date(estimateSentDate);
    expDate.setDate(expDate.getDate() + 3);
    return {
      daysValid: 3,
      displayText: '3 days',
      urgencyLevel: 'high',
      expirationDate: expDate
    };
  } else if (daysUntilEvent <= 44) {
    // MID_RANGE: 5-day validity
    const expDate = new Date(estimateSentDate);
    expDate.setDate(expDate.getDate() + 5);
    return {
      daysValid: 5,
      displayText: '5 days',
      urgencyLevel: 'medium',
      expirationDate: expDate
    };
  } else {
    // STANDARD: 7-day validity
    const expDate = new Date(estimateSentDate);
    expDate.setDate(expDate.getDate() + 7);
    return {
      daysValid: 7,
      displayText: '7 days',
      urgencyLevel: 'standard',
      expirationDate: expDate
    };
  }
};

// Helper to get urgency-appropriate messaging
export const getValidityUrgencyMessage = (urgencyLevel: EstimateValidity['urgencyLevel']): string => {
  switch (urgencyLevel) {
    case 'critical':
      return 'Your event is coming up quickly! Please approve immediately to secure your date.';
    case 'high':
      return 'Your event is approaching soon. We recommend approving quickly to ensure availability.';
    case 'medium':
      return 'Dates fill up fast! We recommend approving soon to lock in your date.';
    case 'standard':
      return 'We recommend approving your estimate as soon as you\'re ready.';
  }
};
```

### File 2: `supabase/functions/_shared/emailTemplates.ts`

#### Change 1: Add validity calculation helper (around line 100)

```typescript
// Estimate validity calculation for emails
interface EmailEstimateValidity {
  daysValid: number;
  displayText: string;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'standard';
}

function calculateEstimateValidity(eventDate: string, isGovernment: boolean): EmailEstimateValidity {
  const today = new Date();
  const event = new Date(eventDate);
  const daysUntilEvent = Math.ceil((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (isGovernment) {
    return { daysValid: 7, displayText: '7 days', urgencyLevel: 'standard' };
  }
  
  if (daysUntilEvent <= 14) {
    return { daysValid: 2, displayText: '24-48 hours', urgencyLevel: 'critical' };
  } else if (daysUntilEvent <= 30) {
    return { daysValid: 3, displayText: '3 days', urgencyLevel: 'high' };
  } else if (daysUntilEvent <= 44) {
    return { daysValid: 5, displayText: '5 days', urgencyLevel: 'medium' };
  } else {
    return { daysValid: 7, displayText: '7 days', urgencyLevel: 'standard' };
  }
}

function getValidityUrgencyColor(urgencyLevel: EmailEstimateValidity['urgencyLevel']): string {
  switch (urgencyLevel) {
    case 'critical': return BRAND_COLORS.crimson;
    case 'high': return '#d97706'; // amber
    case 'medium': return BRAND_COLORS.gold;
    case 'standard': return BRAND_COLORS.gold;
  }
}
```

#### Change 2: Update estimate_ready email (lines 1585-1595)

Replace the static validity HTML with dynamic version:

```typescript
case 'estimate_ready':
  // ... existing code ...
  
  // Calculate context-aware validity
  const validity = calculateEstimateValidity(quote.event_date, isGovernment);
  const validityColor = getValidityUrgencyColor(validity.urgencyLevel);
  
  const urgencyMessages: Record<string, string> = {
    critical: 'Your event is coming up quickly! Please approve immediately to secure your date.',
    high: 'Your event is approaching soon. We recommend approving quickly to ensure availability.',
    medium: 'Dates fill up fast! We recommend approving soon to lock in your date.',
    standard: 'We recommend approving your estimate as soon as you\'re ready.'
  };
  
  const estimateValidityHtml = `
    <div style="background:${BRAND_COLORS.lightGray};padding:16px;border-radius:10px;border-left:4px solid ${validityColor};margin:18px 0;">
      <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;">
        <strong style="color:${validity.urgencyLevel === 'critical' ? BRAND_COLORS.crimson : 'inherit'};">
          ⏳ Estimate Validity:
        </strong> 
        This estimate is valid for <strong>${validity.displayText}</strong> from the date this email was sent.
      </p>
      <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;">
        <strong>📅 ${urgencyMessages[validity.urgencyLevel]}</strong>
      </p>
      <p style="margin:0;font-size:14px;line-height:1.6;">${depositText}</p>
    </div>
  `;
```

#### Change 3: Update preheader text to be dynamic (around line 1975)

The preheader in EMAIL_CONFIGS is static. We need to make it dynamic in getEmailContentBlocks:

Add logic in the estimate_ready case to override preheader if needed:

```typescript
// In getEmailContentBlocks, after calculating validity:
const dynamicPreheaderText = validity.urgencyLevel === 'critical' 
  ? 'URGENT: Your catering estimate expires in 24-48 hours'
  : validity.urgencyLevel === 'high'
  ? `Your catering estimate is ready — valid for ${validity.displayText}`
  : `Your catering estimate is ready — valid for ${validity.displayText} from send date`;
```

This will be used when generating the email config.

### File 3: `supabase/functions/generate-invoice-pdf/index.ts`

Update PDF validity message (line 593):

```typescript
// Calculate validity based on event date
const daysUntilEvent = Math.ceil((new Date(eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
let validityText = '7 days';
if (daysUntilEvent <= 14) validityText = '24-48 hours';
else if (daysUntilEvent <= 30) validityText = '3 days';
else if (daysUntilEvent <= 44) validityText = '5 days';

drawText(`This estimate is valid for ${validityText}. See page 2 for complete terms and conditions.`, margin, y, { size: 8, color: MEDIUM_GRAY });
```

## Visual Examples

### Standard Event (45+ days out)
```
⏳ Estimate Validity: This estimate is valid for 7 days from the date this email was sent.
📅 We recommend approving your estimate as soon as you're ready.
```

### Rush Event (within 14 days)
```
⏳ Estimate Validity: This estimate is valid for 24-48 hours from the date this email was sent.
📅 Your event is coming up quickly! Please approve immediately to secure your date.
```

### Short Notice (15-30 days)
```
⏳ Estimate Validity: This estimate is valid for 3 days from the date this email was sent.
📅 Your event is approaching soon. We recommend approving quickly to ensure availability.
```

## Files Modified

1. `src/utils/paymentScheduling.ts` - Add `getEstimateValidity()` and `getValidityUrgencyMessage()` helpers
2. `supabase/functions/_shared/emailTemplates.ts` - Add `calculateEstimateValidity()` helper and update estimate_ready email content
3. `supabase/functions/generate-invoice-pdf/index.ts` - Update PDF validity text to be context-aware

## Benefits

- Aligns validity messaging with payment urgency tiers
- Creates appropriate urgency for rush events
- Maintains standard 7-day validity for events with ample lead time
- Government contracts retain standard terms regardless of timing
- Consistent messaging across email and PDF documents
