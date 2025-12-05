import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { LayoutList, Kanban, CalendarDays, AlertTriangle } from 'lucide-react';
import { UnifiedWorkflowManager } from '../UnifiedWorkflowManager';
import { EventPipelineBoard } from '../EventPipelineBoard';
import { EventCalendar } from '../calendar/EventCalendar';
import { AtRiskEventsPanel } from '../AtRiskEventsPanel';

type EventTab = 'list' | 'pipeline' | 'calendar' | 'at-risk';

export function ConsolidatedEventsManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as EventTab | null;
  const quoteId = searchParams.get('quoteId');
  const mode = searchParams.get('mode') as 'pricing' | 'default' || 'default';
  const filter = searchParams.get('filter');
  
  const [activeTab, setActiveTab] = useState<EventTab>(
    filter === 'at-risk' ? 'at-risk' : (tabParam || 'list')
  );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as EventTab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    newParams.delete('filter');
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="list" className="gap-2">
            <LayoutList className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-2">
            <Kanban className="h-4 w-4" />
            <span className="hidden sm:inline">Pipeline</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="at-risk" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">At-Risk</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0">
          <UnifiedWorkflowManager 
            selectedQuoteId={quoteId || undefined}
            mode={mode}
          />
        </TabsContent>

        <TabsContent value="pipeline" className="mt-0">
          <EventPipelineBoard />
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <EventCalendar />
        </TabsContent>

        <TabsContent value="at-risk" className="mt-0">
          <AtRiskEventsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
