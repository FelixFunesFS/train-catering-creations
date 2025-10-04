import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Star, MessageSquare, Camera } from 'lucide-react';
import { format } from 'date-fns';

interface EventCompletionPanelProps {
  quote: any;
  invoice: any;
  onBack: () => void;
  onComplete: () => void;
}

export function EventCompletionPanel({
  quote,
  invoice,
  onBack,
  onComplete
}: EventCompletionPanelProps) {
  const [actualGuestCount, setActualGuestCount] = useState(quote.guest_count.toString());
  const [internalNotes, setInternalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const completeEvent = async () => {
    setLoading(true);
    try {
      // Update quote status
      const { error: quoteError } = await supabase
        .from('quote_requests')
        .update({
          status: 'completed',
          workflow_status: 'completed'
        })
        .eq('id', quote.id);

      if (quoteError) throw quoteError;

      // Update invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          workflow_status: 'paid'
        })
        .eq('id', invoice.id);

      if (invoiceError) throw invoiceError;

      // Create admin note with completion details
      await supabase
        .from('admin_notes')
        .insert({
          quote_request_id: quote.id,
          note_content: `Event completed. Actual guest count: ${actualGuestCount}. ${internalNotes}`,
          category: 'completion',
          priority_level: 'normal',
          is_internal: true
        });

      // Send thank you email and feedback request
      await supabase.functions.invoke('send-estimate-email', {
        body: {
          quoteId: quote.id,
          invoiceId: invoice.id,
          emailType: 'thank_you_feedback'
        }
      });

      toast({
        title: 'Event Completed',
        description: 'Event marked as complete and feedback request sent'
      });

      onComplete();
    } catch (error: any) {
      console.error('Error completing event:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete event',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Event Completion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Summary */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-3">{quote.event_name}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Event Date</p>
                <p className="font-medium">{format(new Date(quote.event_date), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">{quote.location}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estimated Guests</p>
                <p className="font-medium">{quote.guest_count}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Amount</p>
                <p className="font-medium">${(invoice.total_amount / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Actual Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Actual Guest Count
              </label>
              <Input
                type="number"
                value={actualGuestCount}
                onChange={(e) => setActualGuestCount(e.target.value)}
                placeholder={quote.guest_count}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Original estimate: {quote.guest_count} guests
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Internal Notes (Optional)
              </label>
              <Textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Any notes about how the event went, issues, successes, etc..."
                rows={4}
              />
            </div>
          </div>

          {/* What Happens Next */}
          <div className="space-y-3">
            <h4 className="font-semibold">What happens next:</h4>
            
            <div className="flex gap-3 p-3 border rounded-lg">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Thank You Email</p>
                <p className="text-sm text-muted-foreground">
                  Automatic thank you email will be sent to the client
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 border rounded-lg">
              <Star className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Feedback Request</p>
                <p className="text-sm text-muted-foreground">
                  Client will be asked to provide feedback and rating
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 border rounded-lg">
              <Camera className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Photo Request (Wedding Events)</p>
                <p className="text-sm text-muted-foreground">
                  Wedding clients will be invited to share event photos
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
            <Button onClick={completeEvent} disabled={loading}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Event as Complete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
