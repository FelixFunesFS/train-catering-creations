

# Block Non-Admin Sign-In + Trust Footer Implementation

## Overview

Implement strict admin access control that prevents non-admin users from signing in, plus add professional trust indicators and legal links to the authentication page footer.

---

## Part A: Block Non-Admin Sign-In

### Authentication Flow Changes

**Current Behavior:**
1. Any user can sign in via Google or email/password
2. Session is created for all authenticated users
3. Non-admins see empty dashboard (RLS blocks data, but session exists)

**New Behavior:**
1. User attempts to sign in
2. After Supabase authenticates, immediately check `user_roles` table
3. If NOT admin/owner: Sign out immediately + show error toast
4. If admin/owner: Proceed to dashboard normally

### Technical Implementation

#### File: `src/hooks/useAuth.tsx`

Add admin access verification function:

```typescript
const checkAdminAccess = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['admin', 'owner'])
    .limit(1);
  
  return data && data.length > 0;
};
```

Update `signIn` function to verify admin access post-authentication:
- On successful auth, call `checkAdminAccess(user.id)`
- If false: call `signOut()` and show error toast
- If true: show success toast and allow redirect

Update `onAuthStateChange` listener for Google OAuth:
- On `SIGNED_IN` event, verify admin access
- Use `setTimeout` to avoid Supabase listener deadlock
- Sign out immediately if not admin

Add new state `isVerifyingAccess` to track verification status

#### File: `src/pages/AdminAuth.tsx`

- Import verification state from `useAuth`
- Only redirect to `/admin` after verification confirms admin access
- Show loading spinner during verification

#### File: `src/components/ProtectedRoute.tsx`

Add backup check using `usePermissions` hook:
- If user is authenticated but `!isAdmin()`, trigger sign out
- Redirect to `/admin/auth`

---

## Part B: Trust Footer on Auth Page

Add a professional footer to `AdminAuth.tsx` with security assurance and legal links.

### Footer Content

```text
┌─────────────────────────────────────────────────────────┐
│  🔒 256-bit SSL encrypted  •  Your data is secure       │
│                                                         │
│  Need help? Contact Support                             │
│  (843) 970-0265  •  soultrainseatery@gmail.com         │
│                                                         │
│  Privacy Policy  |  Terms of Service                    │
└─────────────────────────────────────────────────────────┘
```

### Implementation Details

Position below the Card component with:
- Lock icon (Shield or Lock from lucide-react)
- SSL security message with muted text styling
- Contact information with clickable tel: and mailto: links
- Legal links to existing `/privacy-policy` and `/terms-conditions` routes
- Subtle separator using dots or pipes
- Responsive text sizing (smaller on mobile)

### Styling

```typescript
<div className="mt-6 text-center space-y-3">
  {/* Security badge */}
  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
    <Shield className="h-3 w-3" />
    <span>256-bit SSL encrypted</span>
    <span>•</span>
    <span>Your data is secure</span>
  </div>
  
  {/* Help section */}
  <div className="text-xs text-muted-foreground">
    <p>Need help? Contact Support</p>
    <p className="mt-1">
      <a href="tel:8439700265" className="hover:text-primary">(843) 970-0265</a>
      <span className="mx-2">•</span>
      <a href="mailto:soultrainseatery@gmail.com" className="hover:text-primary">
        soultrainseatery@gmail.com
      </a>
    </p>
  </div>
  
  {/* Legal links */}
  <div className="text-xs text-muted-foreground">
    <Link to="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
    <span className="mx-2">|</span>
    <Link to="/terms-conditions" className="hover:text-primary">Terms of Service</Link>
  </div>
</div>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useAuth.tsx` | Add `checkAdminAccess` function, modify `signIn`, update `onAuthStateChange`, add `isVerifyingAccess` state |
| `src/pages/AdminAuth.tsx` | Add verification loading state, add trust footer with security badge, contact info, and legal links |
| `src/components/ProtectedRoute.tsx` | Add backup role check with auto sign-out |

---

## User Experience

### Non-Admin Attempting Sign-In

1. Enters credentials or clicks "Sign in with Google"
2. Brief loading spinner (1-2 seconds)
3. Error toast: "Access denied. Administrator privileges required."
4. Remains on sign-in page (no session retained)
5. Can see contact info in footer if they need to request access

### Admin Sign-In

1. Enters credentials or clicks "Sign in with Google"
2. Brief loading spinner
3. Success toast: "Signed in successfully"
4. Redirected to admin dashboard

---

## Security Layers

1. **Pre-Dashboard Check**: Non-admins never see the dashboard
2. **Session Termination**: Non-admin sessions are immediately destroyed
3. **Backup Route Protection**: `ProtectedRoute` enforces admin check
4. **Database RLS**: Even if bypassed, RLS blocks all data access

---

## Error Messages

| Scenario | Toast Message |
|----------|---------------|
| Invalid credentials | "Invalid login credentials" (from Supabase) |
| Not an admin | "Access denied. Administrator privileges required." |
| Network error | "Unable to verify access. Please try again." |

