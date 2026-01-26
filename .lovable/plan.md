# Context-Aware Estimate Validity - IMPLEMENTED ✅

## Summary

Implemented dynamic estimate validity messaging that adjusts based on event proximity, aligning with the existing payment schedule tiers. Rush events (within 14 days) show "24-48 hours" validity instead of the standard "7 days" to create appropriate urgency.

## Validity Tiers (Aligned with Payment Schedule)

| Tier | Days Until Event | Estimate Validity | Payment Required |
|------|------------------|-------------------|------------------|
| **RUSH** | 0-14 days | 24-48 hours | 100% NOW |
| **SHORT_NOTICE** | 15-30 days | 3 days | 60% NOW |
| **MID_RANGE** | 31-44 days | 5 days | 60% NOW |
| **STANDARD** | 45+ days | 7 days | 10% deposit |
| **GOVERNMENT** | Any | 7 days (standard terms) | Net 30 |

## Files Modified

1. ✅ `src/utils/paymentScheduling.ts` - Added `EstimateValidity` interface, `getEstimateValidity()`, and `getValidityUrgencyMessage()` helpers
2. ✅ `supabase/functions/_shared/emailTemplates.ts` - Added `calculateEstimateValidity()`, `getValidityUrgencyColor()`, `getValidityUrgencyMessage()` helpers and updated `estimate_ready` email content
3. ✅ `supabase/functions/generate-invoice-pdf/index.ts` - Updated PDF validity text to be context-aware

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

## Benefits

- Aligns validity messaging with payment urgency tiers
- Creates appropriate urgency for rush events
- Maintains standard 7-day validity for events with ample lead time
- Government contracts retain standard terms regardless of timing
- Consistent messaging across email and PDF documents
- Color-coded validity border (crimson for rush, amber for short notice, gold for standard)
