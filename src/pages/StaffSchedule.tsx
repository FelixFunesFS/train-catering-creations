import { useState } from 'react';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useStaffEvents, useStaffEvent, type StaffEventFilter } from '@/hooks/useStaffEvents';
import { StaffEventCard } from '@/components/staff/StaffEventCard';
import { StaffEventDetails } from '@/components/staff/StaffEventDetails';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileAdminNav } from '@/components/admin/mobile/MobileAdminNav';
import { cn } from '@/lib/utils';

export default function StaffSchedule() {
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState<StaffEventFilter>('week');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  const { data: events, isLoading, error } = useStaffEvents(filter);
  const { data: selectedEvent } = useStaffEvent(selectedEventId);

  // Mobile: Show details view when event selected
  const showMobileDetails = isMobile && selectedEventId && selectedEvent;

  const handleCardClick = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleBack = () => {
    setSelectedEventId(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <p className="text-destructive mb-2">Failed to load events</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // Mobile Details View
  if (showMobileDetails) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 bg-background border-b">
          <div className="flex items-center h-14 px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="h-11 w-11 min-w-[44px] -ml-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-medium ml-2">Event Details</span>
          </div>
        </div>
        
        {/* Details content */}
        <div className="p-4 pb-24">
          <StaffEventDetails event={selectedEvent} onBack={handleBack} />
        </div>
        
        <MobileAdminNav />
      </div>
    );
  }

  // Mobile List View
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 bg-background border-b">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h1 className="font-semibold text-lg">Staff Schedule</h1>
            </div>
          </div>
          
          {/* Filter tabs */}
          <div className="px-4 pb-3">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as StaffEventFilter)}>
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="today" className="h-10">Today</TabsTrigger>
                <TabsTrigger value="week" className="h-10">This Week</TabsTrigger>
                <TabsTrigger value="all" className="h-10">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Event cards */}
        <div className="p-4 pb-24 space-y-3">
          {events && events.length > 0 ? (
            events.map((event) => (
              <StaffEventCard 
                key={event.id} 
                event={event}
                onClick={() => handleCardClick(event.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No upcoming events</p>
              <p className="text-sm text-muted-foreground/70">
                {filter === 'today' && 'No events scheduled for today'}
                {filter === 'week' && 'No events scheduled this week'}
                {filter === 'all' && 'No upcoming events found'}
              </p>
            </div>
          )}
        </div>
        
        <MobileAdminNav />
      </div>
    );
  }

  // Desktop Split View
  return (
    <div className="h-screen bg-background">
      {/* Desktop header */}
      <div className="h-14 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-lg">Staff Schedule</h1>
        </div>
        
        <Tabs value={filter} onValueChange={(v) => setFilter(v as StaffEventFilter)}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="all">All Events</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-3.5rem)]">
        {/* Left panel: Event list */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {events && events.length > 0 ? (
                events.map((event) => (
                  <StaffEventCard 
                    key={event.id} 
                    event={event}
                    isSelected={event.id === selectedEventId}
                    onClick={() => handleCardClick(event.id)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No upcoming events</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right panel: Event details */}
        <ResizablePanel defaultSize={65}>
          <ScrollArea className="h-full">
            <div className="p-6">
              {selectedEvent ? (
                <StaffEventDetails event={selectedEvent} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Select an event to view details</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
