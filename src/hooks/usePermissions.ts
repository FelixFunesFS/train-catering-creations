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
    
    if (user?.id) {
      loadUserRoles();
    } else {
      setRoles([]);
      setLoading(false);
    }
  }, [user?.id, authLoading, isVerifyingAccess, userRole]);

  const loadUserRoles = async () => {
    try {
      // Use security definer RPC to bypass RLS timing issues during OAuth
      const { data: isAdmin, error: adminError } = await supabase.rpc('has_role', { 
        _user_id: user!.id, 
        _role: 'admin' 
      });

      if (!adminError && isAdmin === true) {
        setRoles(['admin']);
        setLoading(false);
        return;
      }

      // Check for staff role
      const { data: isStaff, error: staffError } = await supabase.rpc('has_role', {
        _user_id: user!.id,
        _role: 'staff'
      });

      if (!staffError && isStaff === true) {
        setRoles(['staff']);
        setLoading(false);
        return;
      }

      setRoles(['user']);
    } catch (error) {
      console.error('Error loading user roles:', error);
      setRoles(['user']);
    } finally {
      setLoading(false);
    }
  };

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

  const hasRole = (role: Role): boolean => {
    return roles.includes(role);
  };

  const isAdmin = (): boolean => {
    return roles.includes('admin');
  };

  const isStaff = (): boolean => {
    return roles.includes('staff');
  };

  const canAccess = (section: 'dashboard' | 'events' | 'billing' | 'settings' | 'staff'): boolean => {
    if (isAdmin()) return true;
    switch (section) {
      case 'staff':
        return isStaff() || isAdmin();
      case 'dashboard':
      case 'events':
      case 'billing':
      case 'settings':
        return isAdmin();
      default:
        return false;
    }
  };

  return {
    roles,
    loading,
    hasPermission,
    hasRole,
    isAdmin,
    isStaff,
    canAccess,
  };
}
