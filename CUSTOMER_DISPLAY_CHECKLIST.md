# Customer Display Consistency Checklist

> **Purpose**: Ensure all customer-facing information displays consistently across all touchpoints.
> **Rule**: Any change to customer-facing display MUST be applied to ALL applicable files below.

---

## 📍 Customer-Facing Touchpoints

| File | Type | Description |
|------|------|-------------|
| `src/components/customer/CustomerEstimateView.tsx` | React | Customer portal estimate view |
| `supabase/functions/send-customer-portal-email/index.ts` | Edge Function | Estimate ready & approval emails |
| `supabase/functions/send-quote-confirmation/index.ts` | Edge Function | Quote submission confirmation |
| `supabase/functions/generate-invoice-pdf/index.ts` | Edge Function | PDF estimate generation |
| `supabase/functions/_shared/emailTemplates.ts` | Shared | Email template functions |

---

## 📊 Information Display Matrix

| Information | Portal | Estimate Email | Approval Email | Quote Confirm | PDF |
|-------------|:------:|:--------------:|:--------------:|:-------------:|:---:|
| **Event Details** |
| Event Name | ✓ | ✓ | ✓ | ✓ | ✓ |
| Event Date | ✓ | ✓ | ✓ | ✓ | ✓ |
| Start Time | ✓ | ✓ | ✓ | ✓ | ✓ |
| Location | ✓ | ✓ | ✓ | ✓ | ✓ |
| Guest Count | ✓ | ✓ | ✓ | ✓ | ✓ |
| Service Type | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Customer Info** |
| Customer Name | ✓ | ✓ | ✓ | ✓ | ✓ |
| Email | ✓ | ✓ | ✓ | ✓ | ✓ |
| Phone | ✓ | ✓ | ✗ | ✓ | ✓ |
| **Pricing** |
| Line Items Table | ✓ | ✓ | ✗ | ✗ | ✓ |
| Subtotal | ✓ | ✓ | ✗ | ✗ | ✓ |
| Tax Amount | ✓ | ✓ | ✗ | ✗ | ✓ |
| Discount | ✓ | ✓ | ✗ | ✗ | ✓ |
| Total | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Payment** |
| Payment Schedule | ✓ | ✓ | ✓ (full) | ✗ | ✓ |
| Payment Status | ✓ | ✗ | ✓ | ✗ | ✓ |
| Amount Due Now | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Terms** |
| Terms & Conditions | ✓ | ✗ | ✗ | ✗ | ✓ |
| Terms Checkbox | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Notes** |
| Customer Notes | ✓ | ✓ | ✗ | ✗ | ✓ |
| Special Requests | ✓ | ✓ | ✗ | ✓ | ✓ |

---

## 🔄 Sync Patterns

### When Adding New Information
1. Add to `CustomerEstimateView.tsx` (React component)
2. Add to `send-customer-portal-email/index.ts` (if email-relevant)
3. Add to `generate-invoice-pdf/index.ts` (if PDF-relevant)
4. Consider if `emailTemplates.ts` shared function applies

### When Modifying Display Format
1. Check all files in touchpoint list above
2. Use shared functions from `emailTemplates.ts` where possible
3. Maintain consistent terminology across all touchpoints

### When Adding Payment Schedule Changes
Files to update:
- `CustomerEstimateView.tsx` - Payment schedule display
- `send-customer-portal-email/index.ts` - `generateApprovalConfirmationEmail()`
- `generate-invoice-pdf/index.ts` - PDF payment schedule section

---

## ✅ Pre-Change Checklist

Before making any customer-facing display change:

- [ ] Identified all affected touchpoints from matrix above
- [ ] Checked `emailTemplates.ts` for reusable functions
- [ ] Verified terminology consistency across touchpoints
- [ ] Tested display on mobile viewport (emails)
- [ ] Verified PDF renders correctly

---

## 🔗 Related Files

- `CODEBASE_MAP.md` - Full codebase architecture
- `src/components/admin/billing/EmailPreview.tsx` - Admin email preview (uses same edge function)

---

*This checklist is enforced by sync comments in each file header.*
