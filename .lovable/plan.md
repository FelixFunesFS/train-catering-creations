

# Align Staff/Admin Chrome + Add Staff Role Access Control

## Summary

Three things combined into one change:
1. Remove redundant top nav buttons from admin header (bottom nav handles it)
2. Make staff page use the same admin chrome (header + bottom nav)
3. Add a `staff` role so staff users can ONLY access `/staff` -- not Events, Billing, or Settings

## How Access Control Will Work

```text
Admin role  --> Can access: Events, Billing, Staff, Settings (everything)
Staff role  --> Can access: Staff schedule only (no pricing, no admin features)
No role     --> Access denied, signed out immediately
```

Staff users log in with the same `/admin/auth` page. After login, the system detects their role and redirects them to `/staff` instead of `/admin`. If a staff user tries to navigate to `/admin`, they get redirected to `/staff`.

## Part 1: Database -- Add Staff Role

**Migration SQL:**
- Add `'staff'` to the `app_role` enum: `ALTER TYPE public.app_role ADD VALUE 'staff';`
- Create a `has_any_role` RPC function that checks if a user has ANY role (admin or staff) -- used by auth to allow login for both roles without needing to check each one individually

## Part 2: Auth -- Allow Staff Users to Log In

**`src/hooks/useAuth.tsx`**

Currently `checkAdminAccess` only checks for the `admin` role and rejects everyone else. Change it to:
- Check if user has `admin` OR `staff` role (using `has_any_role` RPC or checking both)
- Store the detected role so components can read it
- Add `userRole` to the auth context (value: `'admin'` | `'staff'` | `null`)

The "Access denied" behavior stays for users with NO role at all.

## Part 3: Route Protection -- Separate Admin vs Staff Access

**`src/components/ProtectedRoute.tsx`**

Split into two route wrappers:
- `ProtectedRoute` (existing) -- requires `admin` role, redirects staff to `/staff`
- `StaffRoute` (new) -- requires `admin` OR `staff` role

**`src/App.tsx`**
- Change `/staff` route from `<ProtectedRoute>` to `<StaffRoute>`
- Keep all `/admin/*` routes using `<ProtectedRoute>` (admin only)
- Add `/staff` to the `isAdminRoute` check so it hides public Header/Footer/MobileActionBar

## Part 4: Navigation -- Role-Aware Bottom Nav

**`src/components/admin/mobile/MobileAdminNav.tsx`**

Use `usePermissions` to check the user's role and conditionally show nav items:
- Staff role: show only "Staff" and "Logout" (2 items)
- Admin role: show all 5 items (Events, Billing, Staff, Settings, Logout)

**`src/components/admin/AdminLayout.tsx`**

Remove `AdminNav` from the header (the top buttons for Events/Billing/Settings). Keep just the title and Sign Out button. The bottom `MobileAdminNav` handles navigation on all screen sizes. Also remove `currentView`/`onViewChange` props since they were only used by `AdminNav`.

**`src/components/admin/AdminNav.tsx`** -- Delete this file.

## Part 5: Staff Page -- Use Admin Chrome

**`src/pages/StaffSchedule.tsx`**

Wrap in `AdminLayout` so it gets the same branded header ("Soul Train's Eatery") and bottom nav. Remove the duplicate `MobileAdminNav` renders inside the component (AdminLayout already provides it). The staff page's own filter tabs and calendar button stay in the content area.

**`src/pages/UnifiedAdminDashboard.tsx`**

Remove `currentView`/`onViewChange` props passed to `AdminLayout` (no longer needed).

## Part 6: Permissions Hook Update

**`src/hooks/usePermissions.ts`**

- Add `'staff'` to the `Role` type
- Add staff permissions: `['events.read']` (read-only event/schedule data, no pricing)
- Update `loadUserRoles` to also check for staff role via RPC
- Add `isStaff()` helper method

## Part 7: Auth Redirect After Login

**`src/pages/AdminAuth.tsx`**

After successful login, check the user's role:
- Admin: redirect to `/admin` (current behavior)
- Staff: redirect to `/staff`

## Files Summary

| File | Change |
|------|--------|
| New migration | Add `staff` to `app_role` enum |
| `src/hooks/useAuth.tsx` | Accept admin OR staff login; expose `userRole` |
| `src/hooks/usePermissions.ts` | Add staff role + permissions |
| `src/components/ProtectedRoute.tsx` | Add `StaffRoute` wrapper; admin route redirects staff to `/staff` |
| `src/App.tsx` | Use `StaffRoute` for `/staff`; add to `isAdminRoute` check |
| `src/components/admin/AdminLayout.tsx` | Remove `AdminNav`; simplify props |
| `src/components/admin/AdminNav.tsx` | Delete |
| `src/components/admin/mobile/MobileAdminNav.tsx` | Role-aware nav items |
| `src/pages/StaffSchedule.tsx` | Wrap in `AdminLayout`; remove duplicate nav |
| `src/pages/UnifiedAdminDashboard.tsx` | Remove nav props to `AdminLayout` |
| `src/pages/AdminAuth.tsx` | Role-based redirect after login |

## What Does NOT Change

- Staff data queries (`useStaffEvents`) already exclude pricing and contact info -- no change needed
- Database RLS policies -- staff users authenticate and RLS allows read access via existing admin policies (staff will need a new RLS policy or the existing `has_role` checks updated to include staff for `quote_requests` and `staff_assignments` tables)
- Push notifications, customer-facing pages, email templates
- The staff page content (event cards, details panel, resizable desktop layout)

## RLS Consideration

Current RLS on `quote_requests` and `staff_assignments` uses `has_role(auth.uid(), 'admin')`. For staff users to read event data, either:
- Add parallel SELECT policies: `has_role(auth.uid(), 'staff')` on `quote_requests` (SELECT only) and `staff_assignments`
- Or create a broader check function

The staff SELECT policy on `quote_requests` would be read-only and the query in `useStaffEvents` already selects only non-sensitive columns, so even though RLS grants row access, the application layer never requests pricing columns.

