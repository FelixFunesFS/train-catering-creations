import { useMemo, useState, useEffect, useRef } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useQuotes, useUpdateQuoteStatus } from '@/hooks/useQuotes';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { parseDateFromLocalString } from '@/utils/dateHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Inbox, Clock, ArrowRight, Loader2, Users, MapPin, XCircle, ChevronDown } from 'lucide-react';
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
  
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  const { data: quotes, isLoading } = useQuotes();
  const updateStatus = useUpdateQuoteStatus();

  const [pendingCancel, setPendingCancel] = useState<QuoteRequest | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(() => {
    try { return localStorage.getItem('admin.submissions.expanded') !== 'false'; } catch { return true; }
  });
  const toggleExpanded = () => setExpanded(v => {
    try { localStorage.setItem('admin.submissions.expanded', String(!v)); } catch {}
    return !v;
  });

  const handleCancel = (e: React.MouseEvent, event: QuoteRequest) => {
    e.preventDefault();
    e.stopPropagation();
    setPendingCancel(event);
  };

  const confirmCancel = async () => {
    const event = pendingCancel;
    setPendingCancel(null);
    if (!event) return;
    setCancellingId(event.id);
    try {
      await updateStatus.mutateAsync({ quoteId: event.id, status: 'cancelled', reason: 'Dismissed from New Submissions' });
    } catch {
      // error toast is shown by the mutation hook
    } finally {
      setCancellingId(null);
    }
  };

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
    } else {
      navigate(`/admin/event/${event.id}`);
    }
  };

  const submissionCount = submissions.length;

  // Auto-expand when a new submission arrives
  const prevCount = useRef<number | null>(null);
  useEffect(() => {
    if (prevCount.current !== null && submissionCount > prevCount.current) setExpanded(true);
    prevCount.current = submissionCount;
  }, [submissionCount]);
  const latest = submissions[0];

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
      <CardHeader className="p-0">
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          className="w-full flex items-center justify-between gap-3 p-4 sm:px-6 text-left min-h-[56px]"
        >
          <div className="min-w-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Inbox className="h-5 w-5 text-amber-600 shrink-0" />
              New Submissions
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                {submissionCount}
              </Badge>
            </CardTitle>
            {!expanded && latest && (
              <p className="text-xs text-muted-foreground truncate mt-1">
                Latest: {latest.contact_name} · {latest.event_name} ({format(parseDateFromLocalString(latest.event_date), 'MMM d')})
              </p>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 shrink-0">
            {expanded ? 'Hide' : 'Show'}
            <ChevronDown className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </span>
        </button>
      </CardHeader>
      {expanded && (
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
                  <span>{format(parseDateFromLocalString(event.event_date), 'MMM d, yyyy')}</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {event.guest_count}
                  </span>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 text-xs font-medium gap-1.5 px-3 text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleCancel(e, event)}
                    disabled={cancellingId === event.id}
                    aria-label={`Cancel submission from ${event.contact_name}`}
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </Button>
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
                <TableHead className="w-[180px]"></TableHead>
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
                        {format(parseDateFromLocalString(event.event_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell whitespace-nowrap">
                    {format(parseDateFromLocalString(event.event_date), 'MMM d, yyyy')}
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
                    <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleCancel(e, event)}
                      disabled={cancellingId === event.id}
                      title="Cancel submission (no email sent)"
                      aria-label={`Cancel submission from ${event.contact_name}`}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      )}
      <AlertDialog open={!!pendingCancel} onOpenChange={(o) => !o && setPendingCancel(null)}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this submission?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingCancel?.event_name}" for {pendingCancel?.contact_name} moves to the Cancelled tab. The customer will NOT be emailed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Keep it</AlertDialogCancel>
            <AlertDialogAction className="min-h-[44px] bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmCancel}>
              Cancel submission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
