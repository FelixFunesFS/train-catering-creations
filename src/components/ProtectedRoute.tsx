import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading, isVerifyingAccess, signOut } = useAuth();
  const { loading: rolesLoading, isAdmin } = usePermissions();

  // Backup check: if user is authenticated but not admin, sign them out
  useEffect(() => {
    if (!authLoading && !isVerifyingAccess && !rolesLoading && user && !isAdmin()) {
      signOut();
    }
  }, [authLoading, isVerifyingAccess, rolesLoading, user, isAdmin, signOut]);

  // Show loading while auth or roles are loading
  if (authLoading || isVerifyingAccess || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/admin/auth" replace />;
  }

  // Redirect if not admin (backup check)
  if (!isAdmin()) {
    return <Navigate to="/admin/auth" replace />;
  }

  return <>{children}</>;
}
