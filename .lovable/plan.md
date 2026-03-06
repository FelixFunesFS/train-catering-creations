

# Add Indent to Collapsible Section Content

## Change
Single tweak in `StaffEventDetails.tsx`: increase the left padding on the `CollapsibleContent` wrapper from `px-3` to `pl-6 pr-3`. This indents all content within every collapsible section (Event Requirements, Equipment & Supplies, Service Details, Admin Notes, Staff Assignments) to visually nest it under the section header.

**Line 100:** `px-3 pt-3 pb-4` → `pl-6 pr-3 pt-3 pb-4`

This adds ~12px extra left indent, creating a clear visual hierarchy between the collapsible trigger and its details. No other changes needed — single line edit.

