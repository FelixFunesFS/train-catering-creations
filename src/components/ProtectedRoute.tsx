import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AUTH_TIMEOUT_MS = 10_000;

function AuthLoadingScreen() {
  const [timedOut, setTimedOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), AUTH_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  if (timedOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-sm text-muted-foreground">Verification is taking longer than expected.</p>
        <div className="flex gap-3">
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Button size="sm" onClick={() => navigate('/admin/auth', { replace: true })}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-primary-foreground" />
      <p className="text-sm text-muted-foreground animate-pulse">Verifying access…</p>
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
