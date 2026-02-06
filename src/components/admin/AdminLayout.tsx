import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { MobileAdminNav } from './mobile/MobileAdminNav';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background pt-[env(safe-area-inset-top)]">
      <header className="sticky top-[env(safe-area-inset-top)] z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold sm:text-xl">Soul Train's Eatery</h1>
              <p className="text-xs text-muted-foreground sm:text-sm">Admin Dashboard</p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="gap-2 hidden lg:flex"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <MobileAdminNav />

      <main className="flex-1 pb-20 lg:pb-[env(safe-area-inset-bottom)]">
        {children}
      </main>
    </div>
  );
}
