import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, LayoutDashboard, CalendarDays, CreditCard, Settings, Construction } from 'lucide-react';

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

  // Placeholder component for rebuilding
  const PlaceholderContent = ({ title }: { title: string }) => (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            This section is being rebuilt with a cleaner, simpler design.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Database and edge functions preserved</p>
            <p>✓ All data is safe</p>
            <p>✓ New UI coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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

      {/* Main Content - Placeholders */}
      <main className="flex-1">
        {currentView === 'dashboard' && <PlaceholderContent title="Dashboard - Rebuilding" />}
        {currentView === 'events' && <PlaceholderContent title="Events Manager - Rebuilding" />}
        {currentView === 'billing' && <PlaceholderContent title="Billing Hub - Rebuilding" />}
        {currentView === 'settings' && <PlaceholderContent title="Settings - Rebuilding" />}
      </main>
    </div>
  );
}

export default UnifiedAdminDashboard;