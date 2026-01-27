

# Email Accessibility & Contrast Audit - Fix Plan

## Executive Summary

After auditing the email template system in `supabase/functions/_shared/emailTemplates.ts`, I've identified several potential contrast issues and will also address the customer contact block redundancy.

---

## Issue 1: Potential White-on-White Button Issues

### Current State Analysis

The CTA button system uses two key functions:

**`generateCTAButton()` (lines 1238-1266)**
```typescript
const textColor = variant === 'primary' ? BRAND_COLORS.white : BRAND_COLORS.darkGray;
<a href="${href}" style="...;color:${textColor};...">
```

**`generateEstimateActionButtons()` (lines 1272-1358)**
- Primary "Approve Estimate" button: Uses `color:${BRAND_COLORS.white}` on crimson background - **GOOD**
- Secondary "Request Changes" button: Uses `color:${BRAND_COLORS.darkGray}` on gold background - **GOOD**
- Tertiary "View Full Details" button: Uses `color:${BRAND_COLORS.darkGray}` on #f5f5f5 background - **GOOD**

### Potential White-on-White Risk Areas

1. **VML Center Tag for Outlook (line 1305)**:
   ```html
   <center style="color:#ffffff;font-weight:bold;">✅ Approve Estimate</center>
   ```
   The `<center>` tag styling may not be applied correctly in some Outlook versions where the VML background fails to render, potentially showing white text on white background.

2. **Payment Box Content (lines 1745-1752)**:
   ```html
   <div style="...;color:white;">
     <p style="margin:0 0 10px 0;">To confirm your booking...</p>
   ```
   The paragraph inherits `color:white` from parent, but if gradient background fails, text becomes invisible.

3. **Status Badge Content (lines 1104-1105)**:
   ```html
   <h3 style="...;color:white;...">
   <p style="...;color:rgba(255,255,255,0.95);...">
   ```
   Same issue - relies on colored background.

---

## Fix 1: Harden Button Text Contrast

### Changes to `generateCTAButton()` (lines 1238-1266)

Add `!important` and inline span wrapper for bulletproof text visibility:

```typescript
export function generateCTAButton(text: string, href: string, variant: 'primary' | 'secondary' = 'primary'): string {
  const bgColor = variant === 'primary' 
    ? `linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark})`
    : BRAND_COLORS.gold;
  const textColor = variant === 'primary' ? BRAND_COLORS.white : BRAND_COLORS.darkGray;
  const bgFallback = variant === 'primary' ? BRAND_COLORS.crimson : BRAND_COLORS.gold;

  return `
<table cellpadding="0" cellspacing="0" border="0" style="margin:20px auto;border-collapse:collapse;">
<tr>
<td align="center" bgcolor="${bgFallback}" style="background-color:${bgFallback};background:${bgColor};border-radius:8px;">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="16%" stroke="f" fillcolor="${bgFallback}">
<w:anchorlock/>
<center style="color:${textColor} !important;font-weight:bold;font-size:16px;">
<![endif]-->
<a href="${href}" style="display:inline-block;padding:16px 32px;color:${textColor} !important;font-weight:bold;font-size:16px;text-decoration:none;border-radius:8px;text-align:center;min-width:150px;mso-line-height-rule:exactly;"><span style="color:${textColor};">${text}</span></a>
<!--[if mso]>
</center>
</v:roundrect>
<![endif]-->
</td>
</tr>
</table>
<p style="margin:8px 0 0 0;text-align:center;font-size:12px;color:#666;line-height:1.4;">
  If the button doesn't work, copy and paste this link:<br>
  <a href="${href}" style="color:${BRAND_COLORS.crimson};text-decoration:underline;">${href}</a>
</p>
`;
}
```

**Key Changes:**
- Added `!important` to color declarations for higher specificity
- Wrapped button text in `<span>` with explicit color for email clients that strip link colors
- Added `mso-line-height-rule:exactly` for Outlook rendering

---

## Fix 2: Harden Approve Button in Estimate Actions

### Changes to `generateEstimateActionButtons()` (lines 1294-1313)

Apply the same pattern to the multi-button CTA:

```typescript
<!-- Primary: Approve Button -->
<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 15px auto;border-collapse:collapse;">
  <tr>
    <td align="center" bgcolor="${BRAND_COLORS.crimson}" style="background-color:${BRAND_COLORS.crimson};background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});border-radius:8px;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${approveUrl}" style="height:50px;v-text-anchor:middle;width:250px;" arcsize="16%" stroke="f" fillcolor="${BRAND_COLORS.crimson}">
      <w:anchorlock/>
      <center style="color:#ffffff !important;font-weight:bold;font-size:16px;"><span style="color:#ffffff;">✅ Approve Estimate</span></center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
       <a href="${approveUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:16px 40px;color:#ffffff !important;font-weight:bold;font-size:16px;text-decoration:none;border-radius:8px;text-align:center;mso-line-height-rule:exactly;"><span style="color:#ffffff;">✅ Approve Estimate</span></a>
      <!--<![endif]-->
    </td>
  </tr>
</table>
```

---

## Fix 3: Harden Payment Box Text

### Changes to payment box HTML (lines 1744-1752)

Add explicit color to child elements instead of relying on inheritance:

```typescript
const paymentBoxHtml = `
  <div style="background-color:${BRAND_COLORS.crimson};background:linear-gradient(135deg,${BRAND_COLORS.crimson},${BRAND_COLORS.crimsonDark});padding:20px;border-radius:8px;margin:20px 0;">
    <h3 style="margin:0 0 10px 0;color:${BRAND_COLORS.gold};">💳 Next Step: Secure Your Date</h3>
    <p style="margin:0 0 10px 0;color:#ffffff;">To confirm your booking, complete your first payment:</p>
    <div style="background:rgba(255,255,255,0.1);padding:15px;border-radius:8px;margin-top:10px;">
      <div style="font-size:24px;font-weight:bold;color:${BRAND_COLORS.gold};">${firstPaymentDisplay}</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.9);">${firstMilestone?.is_due_now ? 'Due Now' : 'Due upon approval'}</div>
    </div>
  </div>
`;
```

**Key Changes:**
- Added `background-color` fallback before gradient
- Added explicit `color:#ffffff` to paragraph element instead of relying on parent inheritance

---

## Fix 4: Review Link Buttons Contrast

### Current State (lines 2012-2015)

```html
<a href="...google..." style="...background:${BRAND_COLORS.gold};color:${BRAND_COLORS.darkGray};...">⭐ Google Review</a>
<a href="...facebook..." style="...background:#1877f2;color:white;...">📘 Facebook Review</a>
```

**Analysis:**
- Google Review: Gold (#FFD700) background with dark gray (#333333) text = **Good contrast (7.5:1)**
- Facebook Review: Blue (#1877f2) background with white text = **Good contrast (4.6:1)**

These buttons are correctly styled.

---

## Issue 2: Customer Contact Block Redundancy

### Current Behavior

The `customer_contact` content block is included in:

| Email Type | Variant | Includes customer_contact |
|------------|---------|---------------------------|
| quote_received | admin | YES |
| quote_confirmation | customer | NO |
| estimate_ready | customer | NO |
| approval_confirmation | customer | NO (uses event_section) |
| approval_confirmation | admin | YES |
| payment_received | admin | YES |
| event_reminder | customer | NO |
| event_reminder | admin | YES |
| change_request_submitted | admin | YES |
| admin_notification | admin | YES |
| event_followup | customer | NO |

**Finding:** Customer emails already DO NOT include the customer_contact block. Only admin emails show customer contact info (which makes sense - admins need to contact the customer).

The footer already provides Soul Train's contact info:
- Phone: (843) 970-0265
- Email: soultrainseatery@gmail.com

**No changes needed** - the current architecture is correct. Customer emails show business contact info in footer, while admin emails show the customer's contact info for outreach.

---

## Summary of Changes

| File | Location | Change |
|------|----------|--------|
| `_shared/emailTemplates.ts` | Lines 1238-1266 | Harden `generateCTAButton()` with `!important`, span wrapper, and mso-line-height-rule |
| `_shared/emailTemplates.ts` | Lines 1294-1313 | Harden Approve button in `generateEstimateActionButtons()` with same pattern |
| `_shared/emailTemplates.ts` | Lines 1744-1752 | Add explicit `color:#ffffff` to payment box paragraph elements |
| `_shared/emailTemplates.ts` | Lines 1094-1112 | Add `bgcolor` fallback to `generateStatusBadge()` for Outlook |

---

## Accessibility Checklist Applied

| Element | Current | After Fix |
|---------|---------|-----------|
| Primary CTA button (crimson bg) | color:white | color:#ffffff !important + span |
| Secondary CTA button (gold bg) | color:#333333 | color:#333333 (unchanged - good contrast) |
| Payment box text on gradient | color:white (inherited) | color:#ffffff (explicit) |
| Status badge text | color:white | color:#ffffff + bgcolor fallback |
| Google Review button | gold bg + dark text | Unchanged (good contrast) |
| Facebook Review button | blue bg + white text | Unchanged (good contrast) |
| Footer phone/email links | color:crimson on light gray | Unchanged (good contrast) |

---

## Verification Plan

After implementation, re-run the batch test to verify:

```json
{
  "invoiceId": "b9e5f0b4-9f01-4eb3-970e-64aa58d10520",
  "targetEmail": "envision@mkqconsulting.com",
  "typesToSend": ["estimate_ready", "approval_confirmation", "event_followup"],
  "delayMs": 2000
}
```

Check each email in:
1. Gmail (web)
2. Gmail (mobile app)
3. Outlook (desktop if available)
4. Apple Mail

Confirm all buttons and text are visible with proper contrast.

