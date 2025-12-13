import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout, AdminView } from '@/components/admin/AdminLayout';
import { CalendarDays, CreditCard, Settings } from 'lucide-react';

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

  const placeholderConfig = {
    events: { title: 'Events', icon: CalendarDays, description: 'Event list and management coming next' },
    billing: { title: 'Billing', icon: CreditCard, description: 'Payment tracking and invoices' },
    settings: { title: 'Settings', icon: Settings, description: 'Email templates and configuration' },
  };

  const config = placeholderConfig[currentView];
  const Icon = config.icon;

  return (
    <AdminLayout currentView={currentView} onViewChange={handleViewChange}>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <CardTitle>{config.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-sm">{config.description}</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default UnifiedAdminDashboard;
