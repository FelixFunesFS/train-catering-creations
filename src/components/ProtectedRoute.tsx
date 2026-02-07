import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AUTH_TIMEOUT_MS = 4_000;

function AuthLoadingScreen() {
  const [timedOut, setTimedOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), AUTH_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  if (timedOut) {
    navigate('/admin/auth', { replace: true });
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
           style={{ background: '#fff' }}>
        <img
          src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png"
          alt="Soul Train's Eatery"
          className="h-16 w-16 rounded-full object-cover"
        />
        <p style={{ color: '#6b7280' }} className="text-sm">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#fff' }}>
      <img
        src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png"
        alt="Soul Train's Eatery"
        className="h-16 w-16 rounded-full object-cover"
      />
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#b91c1c' }} />
      <p className="text-sm animate-pulse" style={{ color: '#6b7280' }}>Verifying access…</p>
    </div>
  );
}

interface ProtectedRouteProps {
  children: ReactNode;
}

/** Requires admin role. Staff users are redirected to /staff. Optimistic: renders while verifying. */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading, isVerifyingAccess, userRole } = useAuth();
  const { loading: rolesLoading, isAdmin } = usePermissions();

  // Still loading initial session — show spinner
  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  // No user at all — redirect to login
  if (!user) return <Navigate to="/admin/auth" replace />;

  // Role still verifying — show loading state (NOT the dashboard)
  if (isVerifyingAccess || rolesLoading) {
    return <AuthLoadingScreen />;
  }

  // Role resolved — enforce access
  if (userRole === 'staff' && !isAdmin()) return <Navigate to="/staff" replace />;
  if (!isAdmin()) return <Navigate to="/admin/auth" replace />;

  return <>{children}</>;
}

/** Requires admin OR staff role. Optimistic: renders while verifying. */
export function StaffRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading, isVerifyingAccess } = useAuth();
  const { loading: rolesLoading, isAdmin, isStaff } = usePermissions();

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  if (!user) return <Navigate to="/admin/auth" replace />;

  // Role still verifying — show loading state
  if (isVerifyingAccess || rolesLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAdmin() && !isStaff()) return <Navigate to="/admin/auth" replace />;

  return <>{children}</>;
}
