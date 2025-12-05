import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DashboardHome } from '@/components/admin/dashboard/DashboardHome';
import { ConsolidatedEventsManager } from '@/components/admin/dashboard/ConsolidatedEventsManager';
import { BillingHub } from '@/components/admin/dashboard/BillingHub';
import { SettingsHub } from '@/components/admin/dashboard/SettingsHub';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, LayoutDashboard, CalendarDays, CreditCard, Settings } from 'lucide-react';

type AdminView = 'dashboard' | 'events' | 'billing' | 'settings';

export function UnifiedAdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view') as AdminView | null;
  const [currentView, setCurrentView] = useState<AdminView>(viewParam || 'dashboard');
  const { signOut } = useAuth();

  // Sync URL with view state
  useEffect(() => {
    if (viewParam && viewParam !== currentView) {
      setCurrentView(viewParam);
    }
  }, [viewParam]);

  const handleViewChange = (view: AdminView) => {
    setCurrentView(view);
    const newParams = new URLSearchParams();
    newParams.set('view', view);
    setSearchParams(newParams);
  };

  const navItems = [
    { view: 'dashboard' as AdminView, label: 'Dashboard', icon: LayoutDashboard },
    { view: 'events' as AdminView, label: 'Events', icon: CalendarDays },
    { view: 'billing' as AdminView, label: 'Billing', icon: CreditCard },
    { view: 'settings' as AdminView, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Soul Train's Eatery Admin</h1>
              <p className="text-sm text-muted-foreground">Event management system</p>
            </div>
            
            <div className="flex items-center gap-2">
              {navItems.map(({ view, label, icon: Icon }) => (
                <Button
                  key={view}
                  variant={currentView === view ? 'default' : 'outline'}
                  onClick={() => handleViewChange(view)}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{label}</span>
                </Button>
              ))}
              
              <Separator orientation="vertical" className="h-6 mx-2" />
              
              <Button
                variant="outline"
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

      {/* Main Content */}
      <main className="flex-1">
        {currentView === 'dashboard' && (
          <div className="container mx-auto px-4 py-6">
            <DashboardHome />
          </div>
        )}
        {currentView === 'events' && <ConsolidatedEventsManager />}
        {currentView === 'billing' && <BillingHub />}
        {currentView === 'settings' && <SettingsHub />}
      </main>
    </div>
  );
}

export default UnifiedAdminDashboard;
