import { useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useQuotes } from '@/hooks/useQuotes';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Inbox, Clock, ArrowRight, Loader2, Users, MapPin } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  under_review: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
};

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

interface SubmissionsCardProps {
  onEventClick?: (event: QuoteRequest) => void;
}

export function SubmissionsCard({ onEventClick }: SubmissionsCardProps) {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  const { data: quotes, isLoading } = useQuotes();

  // Filter for pending and under_review only
  const submissions = useMemo(() => {
    if (!quotes) return [];
    return quotes
      .filter(q => q.workflow_status === 'pending' || q.workflow_status === 'under_review')
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [quotes]);

  const handleClick = (event: QuoteRequest) => {
    if (onEventClick) {
      onEventClick(event);
    } else if (isDesktop) {
      navigate(`/admin/event/${event.id}`);
    }
  };

  const submissionCount = submissions.length;

  if (isLoading) {
    return (
      <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10 dark:border-amber-800/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Inbox className="h-5 w-5 text-amber-600" />
            New Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submissionCount === 0) {
    return (
      <Card className="border-green-200 bg-green-50/30 dark:bg-green-950/10 dark:border-green-800/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Inbox className="h-5 w-5 text-green-600" />
            New Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No new submissions — all caught up!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10 dark:border-amber-800/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Inbox className="h-5 w-5 text-amber-600" />
            New Submissions
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              {submissionCount}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {isMobile ? (
          /* Mobile Card Layout */
          <div className="space-y-3">
            {submissions.map((event) => (
              <div
                key={event.id}
                className="p-4 border border-amber-200 rounded-lg bg-card active:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleClick(event)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{event.contact_name}</p>
                    <p className="text-sm text-muted-foreground truncate">{event.event_name}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`shrink-0 ml-2 text-xs ${statusColors[event.workflow_status] || ''}`}
                  >
                    {formatStatus(event.workflow_status)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span className="font-medium text-amber-700 dark:text-amber-400">
                    {formatDistanceToNow(new Date(event.created_at!), { addSuffix: true })}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{format(new Date(event.event_date), 'MMM d, yyyy')}</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {event.guest_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table Layout */
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Submitted
                  </span>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Guests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((event) => (
                <TableRow 
                  key={event.id} 
                  className="cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
                  onClick={() => handleClick(event)}
                >
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium text-sm">
                      {formatDistanceToNow(new Date(event.created_at!), { addSuffix: true })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{event.contact_name}</p>
                      <p className="text-xs text-muted-foreground hidden sm:block">{event.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{event.event_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 md:hidden">
                        {format(new Date(event.event_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell whitespace-nowrap">
                    {format(new Date(event.event_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    {event.guest_count}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={statusColors[event.workflow_status] || ''}
                    >
                      {formatStatus(event.workflow_status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1 text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(event);
                      }}
                    >
                      Review
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
