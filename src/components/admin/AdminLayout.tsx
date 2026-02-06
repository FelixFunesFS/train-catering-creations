import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AdminNav, type AdminView } from './AdminNav';
import { MobileAdminNav } from './mobile/MobileAdminNav';


export type { AdminView } from './AdminNav';

interface AdminLayoutProps {
  children: ReactNode;
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

export function AdminLayout({ children, currentView, onViewChange }: AdminLayoutProps) {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background pt-[env(safe-area-inset-top)]">
      <header className="sticky top-[env(safe-area-inset-top)] z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold sm:text-xl">Soul Train's Eatery</h1>
              <p className="text-xs text-muted-foreground sm:text-sm">Admin Dashboard</p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <AdminNav currentView={currentView} onViewChange={onViewChange} />
              
              <div className="h-6 w-px bg-border" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 lg:pb-[env(safe-area-inset-bottom)]">
        {children}
      </main>

      <MobileAdminNav />
    </div>
  );
}
