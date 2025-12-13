import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { EventList } from '@/components/admin/events';
import { CreditCard, Settings } from 'lucide-react';

export type AdminView = 'events' | 'billing' | 'settings';

export function UnifiedAdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view') as AdminView | null;
  const [currentView, setCurrentView] = useState<AdminView>(viewParam || 'events');

  useEffect(() => {
    if (viewParam && viewParam !== currentView) {
      setCurrentView(viewParam);
    }
  }, [viewParam, currentView]);

  const handleViewChange = (view: AdminView) => {
    setCurrentView(view);
    setSearchParams({ view });
  };

  const PlaceholderView = ({ title, icon: Icon, description }: { 
    title: string; 
    icon: React.ElementType; 
    description: string;
  }) => (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout currentView={currentView} onViewChange={handleViewChange}>
      <div className="container mx-auto px-4 py-6">
        {currentView === 'events' && <EventList />}
        {currentView === 'billing' && (
          <PlaceholderView 
            title="Billing" 
            icon={CreditCard} 
            description="Payment tracking and invoice management coming next" 
          />
        )}
        {currentView === 'settings' && (
          <PlaceholderView 
            title="Settings" 
            icon={Settings} 
            description="Email templates and configuration" 
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default UnifiedAdminDashboard;
