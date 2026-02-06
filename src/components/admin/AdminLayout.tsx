import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { MobileAdminNav } from './mobile/MobileAdminNav';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut } = useAuth();
  const location = useLocation();
  const isStaffPage = location.pathname === '/staff';

  return (
    <div className="min-h-screen bg-background pt-[env(safe-area-inset-top)]">
      <header className="sticky top-[env(safe-area-inset-top)] z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <img 
                src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                alt="Soul Train's Eatery" 
                className="h-8 w-8 rounded-full object-cover"
              />
              <div>
                <h1 className="font-script font-bold text-lg sm:text-xl leading-tight">Soul Train's Eatery</h1>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {isStaffPage ? 'Staff Portal' : 'Admin Dashboard'}
                </p>
              </div>
            </Link>
            
            <div className="hidden lg:flex items-center gap-1">
              <MobileAdminNav />
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="lg:hidden">
        <MobileAdminNav />
      </div>

      <main className="flex-1 pb-20 lg:pb-[env(safe-area-inset-bottom)]">
        {children}
      </main>
    </div>
  );
}
