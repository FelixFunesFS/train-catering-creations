

## Add Branding and Top Spacing to Admin/Staff Portal Header

### Problem
After removing the public navbar's top padding, the admin/staff header now sits flush against the top edge of the viewport. Additionally, the title uses a plain sans-serif font instead of the branded script font seen on the public site.

### Changes (1 file)

**`src/components/admin/AdminLayout.tsx`**

1. **Top spacing** -- Add `pt-2` (plus safe-area-inset) to the outer wrapper so the header has breathing room from the browser chrome without the excessive gap from before.

2. **Logo** -- Add the brand logo image (`/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png`) next to the title, matching the public nav bar's sizing (`h-8 w-8`).

3. **Script font** -- Change the "Soul Train's Eatery" heading from the default font to `font-script font-bold` (Dancing Script), matching the public navigation bar exactly.

4. **Dynamic subtitle** -- Show "Staff Portal" on the `/staff` route and "Admin Dashboard" on `/admin` routes, styled with small uppercase tracking for a polished look.

5. **Home link** -- Wrap the logo + title in a `<Link to="/">` so admins can quickly navigate back to the public site.

### Technical Details

- Imports added: `Link` and `useLocation` from `react-router-dom`
- Logo path: `/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png` (same as public Header)
- Font class: `font-script` (already configured in `tailwind.config.ts` as Dancing Script)
- No changes to navigation logic, routing, or mobile bottom bar

