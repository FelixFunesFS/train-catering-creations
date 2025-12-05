import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type Role = 'owner' | 'admin' | 'coordinator' | 'accounting' | 'ops' | 'user';

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
  owner: ['*'],
  admin: ['*'],
  coordinator: [
    'quotes.read', 'quotes.write',
    'invoices.read', 'invoices.write',
    'events.read', 'events.write',
    'messages.*',
    'reports.read',
  ],
  accounting: [
    'invoices.*',
    'payments.*',
    'reports.*',
    'quotes.read',
  ],
  ops: [
    'events.read',
    'timeline.read',
    'quotes.read',
  ],
  user: [
    'quotes.read',
  ],
};

export function usePermissions() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadUserRoles();
    } else {
      setRoles([]);
      setLoading(false);
    }
  }, [user?.id]);

  const loadUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id);

      if (error) throw error;

      const userRoles = (data || []).map(r => r.role as Role);
      setRoles(userRoles.length > 0 ? userRoles : ['user']);
    } catch (error) {
      console.error('Error loading user roles:', error);
      setRoles(['user']);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    // Check all user roles for the permission
    for (const role of roles) {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      
      // Full access
      if (rolePermissions.includes('*')) return true;
      
      // Exact match
      if (rolePermissions.includes(permission)) return true;
      
      // Wildcard match (e.g., 'invoices.*' matches 'invoices.read')
      const [resource] = permission.split('.');
      if (rolePermissions.includes(`${resource}.*` as Permission)) return true;
    }
    
    return false;
  };

  const hasRole = (role: Role): boolean => {
    return roles.includes(role);
  };

  const isAdmin = (): boolean => {
    return roles.includes('admin') || roles.includes('owner');
  };

  const canAccess = (section: 'dashboard' | 'events' | 'billing' | 'settings'): boolean => {
    switch (section) {
      case 'dashboard':
        return true; // Everyone can see dashboard
      case 'events':
        return hasPermission('events.read') || hasPermission('quotes.read');
      case 'billing':
        return hasPermission('invoices.read') || hasPermission('payments.read');
      case 'settings':
        return hasPermission('settings.read') || isAdmin();
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
    canAccess,
  };
}
