import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type Role = 'admin' | 'staff' | 'user';

type Permission = 
  | '*'
  | 'quotes.read' | 'quotes.write'
  | 'invoices.read' | 'invoices.write' | 'invoices.*'
  | 'payments.read' | 'payments.write' | 'payments.*'
  | 'events.read' | 'events.write' | 'events.*'
  | 'timeline.read'
  | 'messages.read' | 'messages.write' | 'messages.*'
  | 'reports.read' | 'reports.*'
  | 'settings.read' | 'settings.write' | 'settings.*'
  | 'users.read' | 'users.write' | 'users.*';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['*'],
  staff: ['events.read'],
  user: ['quotes.read'],
};

export function usePermissions() {
  const { user, loading: authLoading, isVerifyingAccess, userRole } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || isVerifyingAccess) {
      setLoading(true);
      return;
    }
    
    if (!user?.id) {
      setRoles([]);
      setLoading(false);
      return;
    }

    // Reuse the role already resolved by useAuth — no extra RPC calls
    if (userRole === 'admin' || userRole === 'staff') {
      setRoles([userRole]);
      setLoading(false);
      return;
    }

    // Fallback: user is authenticated but useAuth didn't resolve a role
    setRoles(['user']);
    setLoading(false);
  }, [user?.id, authLoading, isVerifyingAccess, userRole]);

  const hasPermission = (permission: Permission): boolean => {
    for (const role of roles) {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      if (rolePermissions.includes('*')) return true;
      if (rolePermissions.includes(permission)) return true;
      const [resource] = permission.split('.');
      if (rolePermissions.includes(`${resource}.*` as Permission)) return true;
    }
    return false;
  };

  const hasRole = (role: Role): boolean => roles.includes(role);
  const isAdmin = (): boolean => roles.includes('admin');
  const isStaff = (): boolean => roles.includes('staff');

  const canAccess = (section: 'dashboard' | 'events' | 'billing' | 'settings' | 'staff'): boolean => {
    if (isAdmin()) return true;
    switch (section) {
      case 'staff':
        return isStaff() || isAdmin();
      default:
        return false;
    }
  };

  return { roles, loading, hasPermission, hasRole, isAdmin, isStaff, canAccess };
}
