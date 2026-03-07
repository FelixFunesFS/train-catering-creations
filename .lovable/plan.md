

# Staff View UX Assessment

The previously identified improvements are solid and cover the core accessibility and consistency gaps. After reviewing the full codebase, here are additional findings beyond the original plan:

## Already Planned (Confirmed Valid)
1. Keyboard accessibility on event cards
2. Focus-visible ring for card selection
3. `aria-expanded` on collapsible triggers
4. CustomerNotesSection wrapped in CollapsibleSection
5. Pending status icon replacement
6. Phone link touch target desktop fix
7. Staff summary spacing
8. Mobile pagination bottom padding

## Additional Improvements Found

### 9. Collapsible Sections All Default Open on Mobile
Every `CollapsibleSection` has `defaultOpen={true}`. On mobile, an event with all sections (Requirements, Equipment, Service, Customer Notes, Admin Notes, Staff) creates an extremely long scroll. Staff glancing at an event on-site need to scan quickly.

**Fix:** Pass `defaultOpen={!isMobile}` for lower-priority sections (Admin Notes, Customer Notes) so they start collapsed on mobile, reducing initial scroll depth while keeping critical sections (Requirements, Equipment, Service, Staff) open.

### 10. Data Provenance Emoji Inconsistency
Lines 448-449 use emoji (📋/📝) which render differently across devices and may not be accessible to screen readers.

**Fix:** Replace with Lucide icons (`FileCheck` / `FileText`) matching the existing icon language of the component.

### 11. StaffEventCard Missing `aria-label`
The card has no descriptive label for screen readers — it's just a generic clickable div.

**Fix:** Add `aria-label={`View details for ${event.event_name}`}` to the Card element.

### 12. CustomerNotesSection Sits Outside the Card's Collapsible Pattern
Currently rendered directly inside the card (line 702) without a `CollapsibleSection` wrapper — this was identified but worth emphasizing it also breaks the visual border/separator rhythm. The `Separator` after it (line 703) is conditional and disconnected from the section pattern.

**Fix (extends item 4):** Move inside a `CollapsibleSection` with icon `MessageSquare`, remove the standalone conditional `Separator`, and let the standard pattern handle it.

## Summary of All Changes

| File | Changes |
|------|---------|
| `StaffEventCard.tsx` | `role="button"`, `tabIndex={0}`, `onKeyDown`, `focus-visible` ring, `aria-label`, staff summary spacing (`pt-2 mt-1`) |
| `StaffEventDetails.tsx` | `aria-expanded` on collapsible buttons, CustomerNotes in CollapsibleSection, pending icon → `Clock`, emoji → Lucide icons, phone link `lg:min-h-0`, mobile-aware `defaultOpen` for lower-priority sections |
| `StaffSchedule.tsx` | Mobile pagination `pb-20` adjustment, pass `isMobile` context if needed for defaultOpen |

All changes are render-only — no data layer, hook, or routing modifications. The plan covers 12 improvements total across accessibility, visual consistency, and mobile responsiveness.

