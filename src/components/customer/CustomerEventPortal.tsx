import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FileText, 
  MessageSquare,
  Download,
  AlertCircle,
  Users,
  MapPin
} from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';

interface EventPortalProps {
  quote: any;
  invoice: any;
  token: string;
}

export function CustomerEventPortal({ quote, invoice, token }: EventPortalProps) {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEventData();
  }, [quote.id]);

  const fetchEventData = async () => {
    try {
      setLoading(true);

      // Fetch timeline tasks
      const { data: tasks } = await supabase
        .from('event_timeline_tasks')
        .select('*')
        .eq('quote_request_id', quote.id)
        .order('due_date', { ascending: true });

      setTimeline(tasks || []);

      // Fetch change requests as communication history
      const { data: changes } = await supabase
        .from('change_requests')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('created_at', { ascending: false });

      setMessages(changes || []);

      // Mock documents - in production, fetch from storage
      setDocuments([
        { 
          id: '1', 
          name: 'Contract Agreement', 
          type: 'PDF', 
          date: invoice.created_at,
          url: '#'
        },
        { 
          id: '2', 
          name: 'Final Invoice', 
          type: 'PDF', 
          date: invoice.updated_at,
          url: '#'
        }
      ]);

    } catch (error: any) {
      console.error('Error fetching event data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const eventDate = new Date(quote.event_date);
  const daysUntil = differenceInDays(eventDate, new Date());
  const isEventPast = isPast(eventDate);
  const completedTasks = timeline.filter(t => t.completed).length;
  const totalTasks = timeline.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  const getTaskStatusBadge = (task: any) => {
    if (task.completed) {
      return <Badge className="bg-green-500">Completed</Badge>;
    }
    const taskDate = new Date(task.due_date);
    const daysUntilTask = differenceInDays(taskDate, new Date());
    
    if (daysUntilTask < 0) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In Progress</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Event Overview Card */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Event Date</span>
              </div>
              <p className="text-xl font-bold">{format(eventDate, 'MMM dd, yyyy')}</p>
              {!isEventPast && (
                <p className="text-sm text-muted-foreground">{daysUntil} days away</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">Guest Count</span>
              </div>
              <p className="text-xl font-bold">{quote.guest_count} guests</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Total Investment</span>
              </div>
              <p className="text-xl font-bold">{formatCurrency(invoice.total_amount)}</p>
              {invoice.status === 'paid' && (
                <Badge className="bg-green-500">Paid</Badge>
              )}
            </div>
          </div>

          {/* Event Progress */}
          {!isEventPast && totalTasks > 0 && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Event Preparation</span>
                <span className="font-medium">{completedTasks} of {totalTasks} tasks complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="messages">Updates</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Event Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-4">Loading timeline...</p>
              ) : timeline.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Timeline will be available once your event is confirmed
                </p>
              ) : (
                <div className="space-y-4">
                  {timeline.map((task, index) => (
                    <div key={task.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0">
                        {task.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{task.task_name}</p>
                            {task.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{task.notes}</p>
                            )}
                          </div>
                          {getTaskStatusBadge(task)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(task.due_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Event Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(doc.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {documents.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No documents available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communication History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No updates or changes yet
                </p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-4 rounded-lg border space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium capitalize">{msg.request_type.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(msg.created_at), 'MMM dd, yyyy h:mm a')}
                          </p>
                        </div>
                        <Badge 
                          variant={msg.status === 'approved' ? 'default' : 'outline'}
                          className={msg.status === 'approved' ? 'bg-green-500' : ''}
                        >
                          {msg.status}
                        </Badge>
                      </div>
                      {msg.customer_comments && (
                        <p className="text-sm">{msg.customer_comments}</p>
                      )}
                      {msg.admin_response && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                          <p className="font-medium text-xs text-muted-foreground mb-1">Admin Response:</p>
                          <p>{msg.admin_response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
