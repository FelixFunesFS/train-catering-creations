import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SimplifiedWorkflowView } from '@/components/admin/simplified/SimplifiedWorkflowView';
import { EventPipelineBoard } from '@/components/admin/EventPipelineBoard';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, LayoutDashboard, Kanban } from 'lucide-react';

type AdminView = 'workflow' | 'pipeline';

export function SimplifiedAdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view') as AdminView | null;
  const [currentView, setCurrentView] = useState<AdminView>(viewParam || 'workflow');
  const { signOut } = useAuth();

  useEffect(() => {
    if (viewParam && viewParam !== currentView) {
      setCurrentView(viewParam);
    }
  }, [viewParam]);

  const handleViewChange = (view: AdminView) => {
    setCurrentView(view);
    setSearchParams({ view });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Soul Train's Eatery</h1>
              <p className="text-sm text-muted-foreground">Catering Event Management</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant={currentView === 'workflow' ? 'default' : 'outline'}
                onClick={() => handleViewChange('workflow')}
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Event List
              </Button>
              <Button
                variant={currentView === 'pipeline' ? 'default' : 'outline'}
                onClick={() => handleViewChange('pipeline')}
                className="gap-2"
              >
                <Kanban className="h-4 w-4" />
                Pipeline
              </Button>
              
              <div className="h-6 w-px bg-border" />
              
              <Button
                variant="ghost"
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'workflow' && <SimplifiedWorkflowView />}
        {currentView === 'pipeline' && <EventPipelineBoard />}
      </main>
    </div>
  );
}
