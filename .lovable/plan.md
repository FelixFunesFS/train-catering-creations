

## Fix: Replace Optimistic Render with Loading Screen in ProtectedRoute

### What Changes

**File: `src/components/ProtectedRoute.tsx`** -- 2 small edits

**Edit 1 (line 60-63):** In `ProtectedRoute`, change the optimistic render to show the loading screen:

```
// FROM:
if (isVerifyingAccess || rolesLoading) {
  return <>{children}</>;
}

// TO:
if (isVerifyingAccess || rolesLoading) {
  return <AuthLoadingScreen />;
}
```

**Edit 2 (lines 83-86):** Same change in `StaffRoute`:

```
// FROM:
if (isVerifyingAccess || rolesLoading) {
  return <>{children}</>;
}

// TO:
if (isVerifyingAccess || rolesLoading) {
  return <AuthLoadingScreen />;
}
```

### Auto-Login Experience

Returning admins with valid sessions will see a brief "Verifying access..." spinner (under 1 second) before the dashboard loads -- instead of a broken black page. This is the standard pattern used by production admin portals.

### Safety Nets Already in Place

- Token validation via `getUser()` in `useAuth.tsx` (added in previous fix)
- 5-second role check timeout in `useAuth.tsx`
- 10-second `AuthLoadingScreen` timeout with Retry/Login buttons
- Immediate redirect for unauthenticated users

### Risk

Minimal. The only behavioral change is showing a spinner instead of an empty dashboard during the 0.5-1 second verification window. No routing, auth logic, or data fetching changes.
