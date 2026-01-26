

# Revised: Estimate Approved Email Enhancement Plan

## Summary of Changes

Based on your feedback, I'll consolidate further:
1. **Combine Customer Contact + Event Details** into one "Your Event" section
2. **Combine Supplies with Menu & Services** into one "Your Menu, Services & Supplies" section

## Final Email Structure (6 Main Sections)

```text
1. Greeting text
2. Your Event (Customer Contact + Event Details COMBINED)
3. Payment Box ("Secure Your Date") + CTA Button
4. What Happens Next steps
5. Your Menu, Services & Supplies (ALL COMBINED)
   - Proteins, Sides, Appetizers, Desserts, Beverages
   - Vegetarian options
   - Services: Wait Staff, Bussing, Ceremony, Cocktail Hour
   - Supplies: Plates, Cups, Napkins, Chafers, Ice
6. Payment Schedule + Terms + Tips
```

## Technical Implementation

### File: `supabase/functions/_shared/emailTemplates.ts`

#### Change 1: Create Combined Event Section Helper

Add new helper function (around line 600):

```typescript
/**
 * Generate Combined Event Section
 * Displays customer contact info and event details in one block
 */
export function generateEventSection(quote: any): string {
  const contactHtml = generateCustomerContactCard(quote);
  const eventHtml = generateEventDetailsSection(quote);
  
  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
<tr><td>
<h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.crimson};font-size:18px;">📅 Your Event</h3>
${contactHtml}
${eventHtml}
</td></tr>
</table>
`;
}
```

#### Change 2: Create Combined Menu, Services & Supplies Helper

```typescript
/**
 * Generate Combined Menu, Services & Supplies Section
 * All selections in one unified block
 */
export function generateFullSelectionSection(quote: any): string {
  const menuHtml = generateMenuSummarySection(quote);
  const servicesHtml = generateServiceAddonsSection(quote);
  const suppliesHtml = generateSuppliesSummarySection(quote);
  
  if (!menuHtml && !servicesHtml && !suppliesHtml) return '';
  
  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
<tr><td>
<h3 style="margin:0 0 12px 0;color:${BRAND_COLORS.crimson};font-size:18px;">🍽️ Your Menu, Services & Supplies</h3>
${menuHtml}
${servicesHtml}
${suppliesHtml}
</td></tr>
</table>
`;
}
```

#### Change 3: Add New Content Block Types

Update `renderContentBlock` switch statement:

```typescript
case 'event_section':
  return config.quote ? generateEventSection(config.quote) : '';

case 'full_selection':
  return config.quote ? generateFullSelectionSection(config.quote) : '';
```

#### Change 4: Update approval_confirmation Content Blocks

```typescript
contentBlocks = [
  // 1. Greeting
  { type: 'text', data: { html: `<p>Great news, ${quote.contact_name}!</p><p>You've approved your catering estimate for <strong>${quote.event_name}</strong>. We're excited to be part of your special event!</p>` }},
  
  // 2. Your Event (Contact + Details COMBINED)
  { type: 'event_section' },
  
  // 3. Payment Box + CTA (MOVED UP)
  { type: 'custom_html', data: { html: paymentBoxHtml }},
  { type: 'cta', data: { text: 'Make Payment Now', href: effectivePortalUrl, variant: 'primary' }},
  
  // 4. What Happens Next
  { type: 'custom_html', data: { html: `
    <h3 style="color:${BRAND_COLORS.crimson};margin:24px 0 12px 0;">📋 What Happens Next:</h3>
    <ol style="line-height:1.8;margin:0;padding-left:20px;">
      <li><strong>Complete Payment:</strong> Click the button above to pay securely online</li>
      <li><strong>Booking Confirmed:</strong> Once payment is received, your date is locked in</li>
      <li><strong>Planning Call:</strong> We'll schedule a call to finalize all the details</li>
      <li><strong>Event Day:</strong> We'll arrive early to set up and serve amazing food!</li>
    </ol>
  ` }},
  
  // 5. Menu, Services & Supplies (ALL COMBINED)
  { type: 'full_selection' },
  
  // 6. Payment Schedule + Terms + Tips
  { type: 'custom_html', data: { html: paymentScheduleHtml }},
  { type: 'terms' },
  { type: 'text', data: { html: `<div style="background:${BRAND_COLORS.lightGray};padding:15px;border-radius:8px;"><strong>💡 Tip:</strong> Access your event portal anytime to view your estimate or make payments.</div><p>Questions? Call us at <strong>(843) 970-0265</strong></p>` }}
];

ctaButton = null; // CTA is now inline above
```

## Visual Flow

```text
┌─────────────────────────────────────┐
│  👋 Greeting                        │
├─────────────────────────────────────┤
│  📅 YOUR EVENT                      │
│     👤 Contact: Name, Email, Phone  │
│     📍 Details: Date, Time, Location│
│        Guests, Service Type         │
├─────────────────────────────────────┤
│  💳 SECURE YOUR DATE                │
│  [MAKE PAYMENT NOW] button          │
├─────────────────────────────────────┤
│  📋 What Happens Next               │
├─────────────────────────────────────┤
│  🍽️ YOUR MENU, SERVICES & SUPPLIES  │
│     - Proteins, Sides, Appetizers   │
│     - Beverages, Desserts           │
│     - 🌱 Vegetarian options         │
│     - 👨‍🍳 Wait Staff, Bussing        │
│     - 📦 Plates, Cups, Napkins      │
├─────────────────────────────────────┤
│  💰 Payment Schedule + Terms + Tips │
└─────────────────────────────────────┘
```

## Files Modified

1. `supabase/functions/_shared/emailTemplates.ts`
   - Add `generateEventSection()` helper
   - Add `generateFullSelectionSection()` helper
   - Add `event_section` and `full_selection` cases to `renderContentBlock()`
   - Update `approval_confirmation` content blocks with new order

## No Database Changes Required

All data already available in the `quote` object.

