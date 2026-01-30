import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, CreditCard, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { 
    icon: Calendar, 
    label: 'Events', 
    path: '/admin',
    query: '?view=events'
  },
  { 
    icon: CreditCard, 
    label: 'Billing', 
    path: '/admin',
    query: '?view=billing'
  },
  { 
    icon: Settings, 
    label: 'Settings', 
    path: '/admin',
    query: '?view=settings'
  },
];

export function MobileAdminNav() {
  const location = useLocation();
  const { signOut } = useAuth();
  
  const currentView = new URLSearchParams(location.search).get('view') || 'events';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.query.replace('?view=', '');
          
          return (
            <NavLink
              key={item.label}
              to={`${item.path}${item.query}`}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                isActive 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        
        <button
          onClick={() => signOut()}
          className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
