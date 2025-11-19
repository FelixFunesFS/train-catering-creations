import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2,
  Send,
  FileText,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface EventPlanningWorkflowProps {
  quotes: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function EventPlanningWorkflow({ quotes, loading, onRefresh }: EventPlanningWorkflowProps) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [planningNotes, setPlanningNotes] = useState('');
  const [finalDetails, setFinalDetails] = useState('');
  const { toast } = useToast();

  // Filter quotes that have been paid and are ready for event planning
  const confirmedEvents = quotes.filter(quote => 
    quote.workflow_status === 'confirmed'
  );

  const upcomingEvents = confirmedEvents.filter(quote => {
    const eventDate = new Date(quote.event_date);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return eventDate >= now && eventDate <= thirtyDaysFromNow;
  }).sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  const getDaysUntilEvent = (eventDate: string) => {
    const days = Math.ceil((new Date(eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getEventUrgency = (eventDate: string) => {
    const days = getDaysUntilEvent(eventDate);
    if (days <= 3) return { level: 'high', color: 'destructive', label: 'Urgent' };
    if (days <= 7) return { level: 'medium', color: 'default', label: 'Soon' };
    return { level: 'low', color: 'secondary', label: 'Upcoming' };
  };

  const sendEventConfirmation = async (quote: any) => {
    try {
      const { error } = await supabase.functions.invoke('send-gmail-email', {
        body: {
          to: quote.email,
          subject: `Event Confirmation - ${quote.event_name}`,
          html: `
            <h2>Event Confirmation</h2>
            <p>Dear ${quote.contact_name},</p>
            <p>We're excited to confirm your upcoming event details:</p>
            <div style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
              <strong>Event:</strong> ${quote.event_name}<br>
              <strong>Date:</strong> ${new Date(quote.event_date).toLocaleDateString()}<br>
              <strong>Location:</strong> ${quote.location}<br>
              <strong>Guests:</strong> ${quote.guest_count}
            </div>
            <p>We'll be in touch with final details closer to your event date.</p>
            <p>Best regards,<br>Soul Train's Eatery Team</p>
          `
        }
      });

      if (error) throw error;

      toast({
        title: "Confirmation sent!",
        description: "Event confirmation email sent to customer",
      });
    } catch (error) {
      console.error('Error sending confirmation:', error);
      toast({
        title: "Failed to send confirmation",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const sendFinalDetails = async (quote: any) => {
    try {
      const { error } = await supabase.functions.invoke('send-gmail-email', {
        body: {
          to: quote.email,
          subject: `Final Event Details - ${quote.event_name}`,
          html: `
            <h2>Final Event Details</h2>
            <p>Dear ${quote.contact_name},</p>
            <p>Your event is coming up soon! Here are the final details:</p>
            <div style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
              <strong>Event:</strong> ${quote.event_name}<br>
              <strong>Date:</strong> ${new Date(quote.event_date).toLocaleDateString()}<br>
              <strong>Time:</strong> ${quote.start_time || 'TBD'}<br>
              <strong>Location:</strong> ${quote.location}<br>
              <strong>Guests:</strong> ${quote.guest_count}
            </div>
            ${finalDetails ? `<p><strong>Additional Details:</strong><br>${finalDetails}</p>` : ''}
            <p>We're looking forward to making your event amazing!</p>
            <p>Best regards,<br>Soul Train's Eatery Team</p>
          `
        }
      });

      if (error) throw error;

      toast({
        title: "Final details sent!",
        description: "Final event details sent to customer",
      });
    } catch (error) {
      console.error('Error sending final details:', error);
      toast({
        title: "Failed to send details",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const saveEventNotes = async (quoteId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('admin_notes')
        .insert({
          quote_request_id: quoteId,
          note_content: notes,
          category: 'event_planning',
          priority_level: 'normal'
        });

      if (error) throw error;

      toast({
        title: "Notes saved",
        description: "Event planning notes saved successfully",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Failed to save notes",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Planning Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Confirmed Events</span>
            </div>
            <div className="text-2xl font-bold">{confirmedEvents.length}</div>
            <p className="text-xs text-muted-foreground">Ready for planning</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Next 30 Days</span>
            </div>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming events</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">This Week</span>
            </div>
            <div className="text-2xl font-bold">
              {upcomingEvents.filter(e => getDaysUntilEvent(e.event_date) <= 7).length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Upcoming Events</h3>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((quote) => {
            const urgency = getEventUrgency(quote.event_date);
            const daysUntil = getDaysUntilEvent(quote.event_date);
            const isSelected = selectedEvent === quote.id;

            return (
              <Card key={quote.id} className={`${isSelected ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-lg">{quote.event_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {quote.contact_name} • {daysUntil} days away
                        </p>
                      </div>
                      <Badge variant={urgency.color as any}>
                        {urgency.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendEventConfirmation(quote)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Confirmation
                      </Button>
                      <Button
                        variant={isSelected ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setSelectedEvent(isSelected ? null : quote.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {isSelected ? 'Close' : 'Plan Event'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(quote.event_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{quote.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{quote.guest_count} guests</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{quote.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{quote.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Event Planning Panel */}
                  {isSelected && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                      <h4 className="font-medium">Event Planning</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Planning Notes</label>
                          <Textarea
                            placeholder="Add event planning notes, vendor coordination, setup requirements..."
                            value={planningNotes}
                            onChange={(e) => setPlanningNotes(e.target.value)}
                            rows={3}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => saveEventNotes(quote.id, planningNotes)}
                          >
                            Save Notes
                          </Button>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block">Final Details for Customer</label>
                          <Textarea
                            placeholder="Final details to send to customer (timing, special instructions, etc.)"
                            value={finalDetails}
                            onChange={(e) => setFinalDetails(e.target.value)}
                            rows={2}
                          />
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => sendFinalDetails(quote)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Final Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No upcoming events</h3>
                <p>Confirmed events will appear here for planning.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}