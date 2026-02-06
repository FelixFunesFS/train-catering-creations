
# Staff View Overhaul + ceremony_included Removal + Admin Field Alignment

## Summary

This plan combines four objectives into one cohesive update:

1. Remove `ceremony_included` from all views (it is deprecated)
2. Add missing operational fields to admin event details (serving setup area, wait staff setup areas, etc.)
3. Overhaul the staff view into a Digital BEO with consolidated sections, admin notes, and conditional rendering
4. Remove the "Add to Calendar" button from staff event cards and details, default all sections to expanded

## Part 1: Remove ceremony_included Everywhere

The `ceremony_included` field is deprecated. Remove all references from UI rendering. The database column stays (to avoid breaking existing data), but it is no longer displayed or submitted.

| File | Change |
|------|--------|
| `EventDetailsPanelContent.tsx` | Remove from Service Add-ons condition (line 317) and list item (line 328) |
| `EventSummaryPanel.tsx` | Remove from Service Add-ons condition (line 336) and badge (lines 354-358) |
| `EventDetail.tsx` | Remove ceremony_included rendering (line 335) |
| `CustomerEstimateView.tsx` | Remove ceremony_included conditional display |
| `MobileEstimateView.tsx` | Remove ceremony_included rendering |
| `CustomerDetailsSidebar.tsx` | Remove ceremony_included from type and rendering |
| `invoiceFormatters.ts` | Remove ceremony_included from type and logic |
| `formSchema.ts` | Remove ceremony_included from Zod schema |
| Edge functions (`emailTemplates.ts`, `generate-invoice-from-quote`, `generate-invoice-pdf`, `preview-email`, `submit-quote-request`) | Remove ceremony_included references |

## Part 2: Add Missing Operational Fields to Admin Views

Currently, `serving_setup_area`, `separate_serving_area`, `wait_staff_setup_areas` are NOT shown in admin event details. These are important for operational planning.

**`EventDetailsPanelContent.tsx`** -- Add to the "Service Add-ons" section (conditionally rendered):
- `serving_setup_area`: text display with MapPin icon
- `separate_serving_area`: "Separate Serving Area" indicator (only if true)
- `wait_staff_setup_areas`: text display (only if truthy)

**`EventSummaryPanel.tsx`** -- Add the same 3 fields to its Service Add-ons section (conditionally rendered).

## Part 3: Database -- RLS for Staff Access to Line Items and Admin Notes

New migration adds SELECT-only policies:
- `invoice_line_items`: staff can read rows (query explicitly excludes `unit_price` and `total_price` columns)
- `admin_notes`: staff can read internal operational notes

## Part 4: Data Layer -- useStaffEvents.ts

### New types

```text
StaffLineItem { id, title, description, category, quantity, sort_order }
StaffAdminNote { id, note_content, category, priority_level, created_at }
```

### Updated StaffEvent interface

Add these fields to the `.select()` calls (NO `ceremony_included`):
- `contact_name`, `phone` (on-site contact -- email is NOT included)
- `serving_setup_area`, `separate_serving_area`
- `wait_staff_requirements`, `wait_staff_setup_areas`
- `theme_colors`, `military_organization`
- `both_proteins_available`, `guest_count_with_restrictions`
- `line_items: StaffLineItem[]` (fetched via invoices join)
- `admin_notes: StaffAdminNote[]` (fetched from admin_notes table)

### Fetch logic

After fetching events from `quote_requests`:
1. Query `invoices` by `quote_request_id` to get invoice IDs
2. Query `invoice_line_items` by those invoice IDs, selecting only `id, title, description, category, quantity, sort_order` (no pricing columns)
3. Query `admin_notes` by `quote_request_id`
4. Merge into StaffEvent objects

## Part 5: UI -- StaffEventCard.tsx

- Remove `AddToCalendarButton` (lines 61-65) and its import
- Conditionally add `contact_name` on the card (only if present)

## Part 6: UI -- StaffEventDetails.tsx

### Remove "Add to Calendar" button
Delete the `AddToCalendarButton` at line 227 and its import (line 11).

### Add Contact Info block in header card
After the info badges, conditionally show:
- Contact name (only if set)
- Tappable phone link (only if set)
- Military organization badge (only if set)
- Theme/colors (only if set)

### Replace Menu + Equipment with "Event Requirements"
Remove the separate "Menu Items" and "Equipment Needed" sections. Replace with a single "Event Requirements" section:
- Primary: renders `line_items` grouped by `category`, sorted by `sort_order` -- no pricing
- Fallback: if no line items exist (estimate not yet created), renders the current raw menu arrays and equipment booleans
- Dietary restrictions alert stays (conditionally shown)
- `guest_count_with_restrictions` shown if greater than 0
- `both_proteins_available` shown if true

### Enhance "Service Details" section
Add to existing section (all conditionally rendered -- blank values hidden):
- `serving_setup_area` with icon
- `separate_serving_area` indicator (only if true)
- `wait_staff_requirements` text
- `wait_staff_setup_areas` text
- Admin Notes block: each note with category badge and priority indicator (entire block hidden if no notes)

### Expand all sections by default
Change all `CollapsibleSection` components to `defaultOpen={true}`.

### Blank Field Rules (applies to every new field)

```text
Field                          Render condition
-----------------------------  ----------------
contact_name                   only if truthy string
phone                          only if truthy string
serving_setup_area             only if truthy string
separate_serving_area          only if true (boolean)
wait_staff_requirements        only if truthy string
wait_staff_setup_areas         only if truthy string
theme_colors                   only if truthy string
military_organization          only if truthy string
both_proteins_available        only if true (boolean)
guest_count_with_restrictions  only if truthy and > 0
line_items section             falls back to raw menu if empty array
admin_notes block              hidden entirely if empty array
```

## Files Summary

| File | Change |
|------|--------|
| New migration | Staff SELECT policies for `invoice_line_items` and `admin_notes` |
| `src/hooks/useStaffEvents.ts` | Add 11 fields, line items, admin notes to interface and fetch |
| `src/components/staff/StaffEventDetails.tsx` | Remove calendar button; add contact info; replace menu/equipment with line items; add admin notes; enhance service details; expand all; remove ceremony_included |
| `src/components/staff/StaffEventCard.tsx` | Remove calendar button; add contact name |
| `src/components/admin/events/EventDetailsPanelContent.tsx` | Remove ceremony_included; add serving_setup_area, separate_serving_area, wait_staff_setup_areas |
| `src/components/admin/events/EventSummaryPanel.tsx` | Remove ceremony_included; add serving_setup_area, separate_serving_area, wait_staff_setup_areas |
| `src/components/admin/events/EventDetail.tsx` | Remove ceremony_included |
| `src/components/customer/CustomerEstimateView.tsx` | Remove ceremony_included |
| `src/components/customer/CustomerDetailsSidebar.tsx` | Remove ceremony_included |
| `src/components/admin/mobile/MobileEstimateView.tsx` | Remove ceremony_included |
| `src/utils/invoiceFormatters.ts` | Remove ceremony_included |
| `src/components/quote/alternative-form/formSchema.ts` | Remove ceremony_included |
| Edge functions (emailTemplates, generate-invoice-from-quote, generate-invoice-pdf, preview-email, submit-quote-request) | Remove ceremony_included references |

## What Does NOT Change

- Customer email is NOT exposed to staff (only name and phone for on-site coordination)
- Pricing data never reaches the staff view (excluded at query level)
- Staff schedule page layout, filter tabs, AdminLayout chrome
- All route protection and permissions
- Database column `ceremony_included` stays in the table (avoids destructive migration) but is never rendered or submitted
