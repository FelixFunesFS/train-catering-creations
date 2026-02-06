import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, CreditCard, Settings, LogOut, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const adminNavItems = [
  { icon: Calendar, label: 'Events', path: '/admin', query: '?view=events', isQueryBased: true },
  { icon: CreditCard, label: 'Billing', path: '/admin', query: '?view=billing', isQueryBased: true },
  { icon: Users, label: 'Staff', path: '/staff', query: '', isQueryBased: false },
  { icon: Settings, label: 'Settings', path: '/admin', query: '?view=settings', isQueryBased: true },
];

const staffNavItems = [
  { icon: Users, label: 'Schedule', path: '/staff', query: '', isQueryBased: false },
];

export function MobileAdminNav() {
  const location = useLocation();
  const { signOut, userRole } = useAuth();
  
  const currentView = new URLSearchParams(location.search).get('view') || 'events';
  const isStaffPage = location.pathname === '/staff';
  
  const navItems = userRole === 'staff' ? staffNavItems : adminNavItems;
  // +1 for the Logout button
  const gridCols = navItems.length + 1;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t pb-[env(safe-area-inset-bottom)] lg:static lg:border-t-0 lg:border-b-0 lg:pb-0">
      <div 
        className="grid h-16 lg:flex lg:h-auto lg:items-center lg:gap-1 lg:px-0"
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
      >
        {navItems.map((item) => {
          const isActive = item.isQueryBased 
            ? (!isStaffPage && currentView === item.query.replace('?view=', ''))
            : location.pathname === item.path;
          
          return (
            <NavLink
              key={item.label}
              to={`${item.path}${item.query}`}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                "lg:flex-row lg:gap-2 lg:px-3 lg:py-1.5 lg:rounded-md lg:text-sm",
                isActive 
                  ? "text-primary font-medium lg:bg-muted" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 lg:h-4 lg:w-4", isActive && "text-primary")} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        
        <button
          onClick={() => signOut()}
          className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors lg:hidden"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
