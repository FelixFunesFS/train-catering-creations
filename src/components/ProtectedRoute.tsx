import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/** Requires admin role. Staff users are redirected to /staff. */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading, isVerifyingAccess, userRole } = useAuth();
  const { loading: rolesLoading, isAdmin } = usePermissions();

  if (authLoading || isVerifyingAccess || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/auth" replace />;
  }

  // Staff users get redirected to their own area
  if (userRole === 'staff' && !isAdmin()) {
    return <Navigate to="/staff" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/admin/auth" replace />;
  }

  return <>{children}</>;
}

/** Requires admin OR staff role. */
export function StaffRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading, isVerifyingAccess } = useAuth();
  const { loading: rolesLoading, isAdmin, isStaff } = usePermissions();

  if (authLoading || isVerifyingAccess || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/auth" replace />;
  }

  if (!isAdmin() && !isStaff()) {
    return <Navigate to="/admin/auth" replace />;
  }

  return <>{children}</>;
}
