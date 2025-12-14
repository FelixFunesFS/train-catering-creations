import { Button } from '@/components/ui/button';
import { CalendarDays, CreditCard, Settings } from 'lucide-react';

export type AdminView = 'events' | 'billing' | 'settings';

interface AdminNavProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

const navItems = [
  { view: 'events' as AdminView, label: 'Events', icon: CalendarDays },
  { view: 'billing' as AdminView, label: 'Billing', icon: CreditCard },
  { view: 'settings' as AdminView, label: 'Settings', icon: Settings },
];

export function AdminNav({ currentView, onViewChange }: AdminNavProps) {
  return (
    <nav className="flex items-center gap-1">
      {navItems.map(({ view, label, icon: Icon }) => (
        <Button
          key={view}
          variant={currentView === view ? 'default' : 'ghost'}
          onClick={() => onViewChange(view)}
          size="sm"
          className="gap-2 min-h-[44px] min-w-[44px] px-2 sm:px-3"
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </nav>
  );
}
