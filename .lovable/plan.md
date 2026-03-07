

# In-App Admin Help System

Currently there is **no in-app guidance** — the `docs/ADMIN_GUIDE.md` exists but is a developer-facing document, not surfaced to the admin user. The best approach is a lightweight, non-intrusive contextual help system that lives inside each view without altering existing data flows or component logic.

## Approach: Dismissible Help Cards + Help Dialog

Two complementary patterns:

1. **Per-view Help Cards** — A small, collapsible info banner at the top of each view (Events, Billing, Reports, Settings) with 2-3 bullet quick-start tips specific to that view. Dismissible per session via localStorage so it doesn't annoy repeat users. A "Show tips" button re-opens it.

2. **Help Dialog (?)** — A help button (CircleHelp icon) in the AdminLayout header that opens a dialog/sheet with searchable FAQ content organized by view: common workflows, status definitions, and troubleshooting steps. Content sourced from the existing ADMIN_GUIDE.md, rendered as structured sections.

## New Files

| File | Purpose |
|------|---------|
| `src/components/admin/help/AdminHelpButton.tsx` | Header help icon → opens help dialog |
| `src/components/admin/help/AdminHelpDialog.tsx` | Dialog with tabbed help content (Workflows, Statuses, FAQ, Troubleshooting) |
| `src/components/admin/help/ViewHelpCard.tsx` | Reusable dismissible tip card for each view |
| `src/components/admin/help/helpContent.ts` | Static help content organized by view and topic |

## Modified Files

| File | Change |
|------|--------|
| `AdminLayout.tsx` | Add `AdminHelpButton` next to Sign Out in header |
| `EventsView.tsx` | Add `ViewHelpCard` with Events-specific tips |
| `PaymentList.tsx` | Add `ViewHelpCard` with Billing-specific tips |
| `ReportsView.tsx` | Add `ViewHelpCard` with Reports-specific tips |
| `UnifiedAdminDashboard.tsx` | Add `ViewHelpCard` for Settings view |

## Help Card Behavior

- First visit: card is expanded with tips like "New quote requests appear in the Submissions card above" or "Click any event row to open its detail page"
- Collapsed state saved to `localStorage` per view key
- Small "Need help?" link to re-expand
- Non-blocking — sits above content, does not shift layout when dismissed

## Help Dialog Content Structure

```text
┌─────────────────────────────────┐
│  📖 Admin Help         [X]     │
│─────────────────────────────────│
│ [Getting Started] [Workflows]  │
│ [Statuses] [Troubleshooting]   │
│─────────────────────────────────│
│                                 │
│  Getting Started                │
│  ─────────────────              │
│  • Check Events daily for new   │
│    quote submissions            │
│  • Click a submission to open   │
│    the event detail page        │
│  • Create estimates from the    │
│    detail page Estimate panel   │
│  ...                            │
│                                 │
│  Common Questions               │
│  ─────────────────              │
│  Q: Customer didn't get email?  │
│  A: Check Settings → Delivery   │
│     for delivery logs...        │
│                                 │
└─────────────────────────────────┘
```

## Content Highlights

**Events tips:** "New submissions appear at the top — click to review and create an estimate." / "Use List, Week, or Month views to manage your schedule."

**Billing tips:** "Filter by status to find overdue invoices quickly." / "Click an invoice to record payments or view history."

**Reports tips:** "Use the date filter to compare time periods." / "Export data by switching between Revenue, Events, Items, and Payment tabs."

**Settings tips:** "Configure quiet hours to pause notifications during off hours." / "Check Email Delivery tab to troubleshoot missing emails."

**Statuses reference:** Pending → Under Review → Estimated → Sent → Viewed → Approved → Paid → Confirmed → Completed (rendered as a visual flow).

**Troubleshooting FAQ:** Customer didn't receive email, payment button not working, status not updating — pulled directly from the existing admin guide.

## Design Principles

- **Zero data-layer changes** — all static content, no new queries or database tables
- **Progressive disclosure** — tips are brief, dialog has depth for those who need it
- **Mobile-first** — help card stacks naturally, dialog uses Sheet on mobile
- **Non-breaking** — all additive, no existing component signatures change

