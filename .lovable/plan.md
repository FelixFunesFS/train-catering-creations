

# Staff View UX: Spacing & Clarity Improvements

## Problem
Inside the collapsible sections (Event Requirements, Equipment, Service Details, etc.), the content starts immediately below the section title's bottom border — the category sub-headers like "Catering Package" or "Appetizers" visually collide with the trigger button's edge. This affects both mobile and desktop.

## Root Cause
The `CollapsibleContent` wrapper (line 100) has `px-3 pb-4` but **no top padding**. Content renders flush against the trigger button's bottom edge.

Additionally, `LineItemsByCategory` uses `space-y-1` between the category label and the item list (line 214), which is too tight — the sub-category titles need slightly more breathing room.

## Changes (single file: `StaffEventDetails.tsx`)

**1. Add top padding to CollapsibleContent (line 100)**
Change `className="px-3 pb-4"` → `className="px-3 pt-3 pb-4"`

This adds 12px of breathing room between every section trigger and its content — applies globally to all collapsible sections (Event Requirements, Equipment, Service, Admin Notes, Staff Assignments).

**2. Increase category group spacing (line 212)**
In `LineItemsByCategory`, change the outer `space-y-4` to `space-y-5` and the inner `space-y-1` (line 214) to `space-y-2` so sub-category titles ("Catering Package", "Appetizers", etc.) have more visual separation from the items below them.

**3. Add a subtle top border to CustomerNotesSection (line 302)**
The `CustomerNotesSection` sits outside a `CollapsibleSection` — it renders directly in the card. Add `mt-1` to its outer wrapper so it doesn't crowd the separator above it.

### No workflow, logic, or data changes. Pure CSS spacing adjustments.

