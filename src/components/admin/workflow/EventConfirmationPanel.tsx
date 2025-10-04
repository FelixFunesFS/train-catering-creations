import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Calendar, Send, List } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface EventConfirmationPanelProps {
  quote: any;
  invoice: any;
  onBack: () => void;
  onContinue: () => void;
}

export function EventConfirmationPanel({
  quote,
  invoice,
  onBack,
  onContinue
}: EventConfirmationPanelProps) {
  const [confirmationNotes, setConfirmationNotes] = useState('');
  const [checklist, setChecklist] = useState({
    menuFinalized: false,
    staffingConfirmed: false,
    setupConfirmed: false,
    specialRequestsReviewed: false,
    timelineCreated: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const allChecked = Object.values(checklist).every(v => v);

  const confirmEvent = async () => {
    if (!allChecked) {
      toast({
        title: 'Incomplete Checklist',
        description: 'Please complete all confirmation items',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Update quote status
      const { error: quoteError } = await supabase
        .from('quote_requests')
        .update({
          status: 'confirmed',
          workflow_status: 'confirmed'
        })
        .eq('id', quote.id);

      if (quoteError) throw quoteError;

      // Update invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          status: 'approved',
          workflow_status: 'approved'
        })
        .eq('id', invoice.id);

      if (invoiceError) throw invoiceError;

      // Create timeline tasks
      await createTimelineTasks();

      // Send confirmation email
      await supabase.functions.invoke('send-estimate-email', {
        body: {
          quoteId: quote.id,
          invoiceId: invoice.id,
          emailType: 'event_confirmation',
          notes: confirmationNotes
        }
      });

      toast({
        title: 'Event Confirmed',
        description: 'Event has been confirmed and timeline created'
      });

      onContinue();
    } catch (error: any) {
      console.error('Error confirming event:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to confirm event',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createTimelineTasks = async () => {
    const eventDate = new Date(quote.event_date);
    
    const tasks = [
      {
        task_name: 'Finalize menu selections',
        task_type: 'planning',
        due_date: subDays(eventDate, 30).toISOString(),
        notes: 'Confirm final menu choices with client'
      },
      {
        task_name: 'Confirm final guest count',
        task_type: 'planning',
        due_date: subDays(eventDate, 14).toISOString(),
        notes: 'Get accurate headcount for food preparation'
      },
      {
        task_name: 'Finalize logistics and setup',
        task_type: 'logistics',
        due_date: subDays(eventDate, 7).toISOString(),
        notes: 'Confirm delivery time, setup requirements, and staff needs'
      },
      {
        task_name: 'Confirm delivery details',
        task_type: 'logistics',
        due_date: subDays(eventDate, 3).toISOString(),
        notes: 'Final confirmation of delivery time and location access'
      },
      {
        task_name: 'Event preparation',
        task_type: 'execution',
        due_date: subDays(eventDate, 1).toISOString(),
        notes: 'Prepare all food and equipment for event'
      },
      {
        task_name: 'Event setup',
        task_type: 'execution',
        due_date: eventDate.toISOString(),
        notes: 'On-site setup and service'
      },
      {
        task_name: 'Event follow-up',
        task_type: 'follow_up',
        due_date: new Date(eventDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Send thank you and request feedback'
      }
    ];

    const tasksToInsert = tasks.map(task => ({
      quote_request_id: quote.id,
      ...task
    }));

    const { error } = await supabase
      .from('event_timeline_tasks')
      .insert(tasksToInsert);

    if (error) throw error;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Event Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Summary */}
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-green-900 dark:text-green-100">
                  {quote.event_name}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {format(new Date(quote.event_date), 'EEEE, MMMM dd, yyyy')} at {quote.start_time}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {quote.guest_count} guests at {quote.location}
                </p>
              </div>
              <Badge className="bg-green-500">Ready to Confirm</Badge>
            </div>
          </div>

          {/* Confirmation Checklist */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <List className="h-5 w-5" />
              <h4 className="font-semibold">Confirmation Checklist</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Checkbox
                  checked={checklist.menuFinalized}
                  onCheckedChange={(checked) =>
                    setChecklist({ ...checklist, menuFinalized: !!checked })
                  }
                />
                <label className="flex-1 cursor-pointer">
                  Menu selections finalized and confirmed with client
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Checkbox
                  checked={checklist.staffingConfirmed}
                  onCheckedChange={(checked) =>
                    setChecklist({ ...checklist, staffingConfirmed: !!checked })
                  }
                />
                <label className="flex-1 cursor-pointer">
                  Staffing requirements confirmed (wait staff, setup crew)
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Checkbox
                  checked={checklist.setupConfirmed}
                  onCheckedChange={(checked) =>
                    setChecklist({ ...checklist, setupConfirmed: !!checked })
                  }
                />
                <label className="flex-1 cursor-pointer">
                  Setup details and timing confirmed
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Checkbox
                  checked={checklist.specialRequestsReviewed}
                  onCheckedChange={(checked) =>
                    setChecklist({ ...checklist, specialRequestsReviewed: !!checked })
                  }
                />
                <label className="flex-1 cursor-pointer">
                  All special requests and dietary restrictions reviewed
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Checkbox
                  checked={checklist.timelineCreated}
                  onCheckedChange={(checked) =>
                    setChecklist({ ...checklist, timelineCreated: !!checked })
                  }
                />
                <label className="flex-1 cursor-pointer">
                  Event timeline will be created automatically
                </label>
              </div>
            </div>
          </div>

          {/* Confirmation Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmation Notes (Optional)</label>
            <Textarea
              value={confirmationNotes}
              onChange={(e) => setConfirmationNotes(e.target.value)}
              placeholder="Add any final notes or reminders for the client..."
              rows={4}
            />
          </div>

          {/* What Happens Next */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-semibold mb-2">What happens next:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Client receives confirmation email</li>
              <li>✓ Event timeline tasks are created automatically</li>
              <li>✓ Event appears in confirmed events dashboard</li>
              <li>✓ Automated reminders will be sent at key milestones</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
            <Button
              onClick={confirmEvent}
              disabled={!allChecked || loading}
            >
              <Send className="h-4 w-4 mr-2" />
              Confirm Event & Send Notification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
