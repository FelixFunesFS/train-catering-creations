import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle2, 
  Star, 
  MessageSquare, 
  DollarSign,
  Calendar,
  Send,
  FileText,
  Users,
  MapPin,
  ThumbsUp
} from 'lucide-react';

interface EventCloseoutWorkflowProps {
  quotes: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function EventCloseoutWorkflow({ quotes, loading, onRefresh }: EventCloseoutWorkflowProps) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [eventNotes, setEventNotes] = useState('');
  const [eventRating, setEventRating] = useState<'excellent' | 'good' | 'fair' | 'poor' | ''>('');
  const { toast } = useToast();

  // Filter quotes for events that are completed or need closeout
  const completedEvents = quotes.filter(quote => {
    const eventDate = new Date(quote.event_date);
    const now = new Date();
    return eventDate < now && quote.status === 'confirmed';
  });

  const recentEvents = completedEvents.filter(quote => {
    const eventDate = new Date(quote.event_date);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return eventDate >= sevenDaysAgo;
  }).sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  const getDaysAgo = (eventDate: string) => {
    const days = Math.floor((new Date().getTime() - new Date(eventDate).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const markEventComplete = async (quoteId: string) => {
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ 
          status: 'completed',
          workflow_status: 'completed'
        })
        .eq('id', quoteId);

      if (error) throw error;

      toast({
        title: "Event marked complete",
        description: "Event status updated successfully",
      });

      onRefresh();
    } catch (error) {
      console.error('Error marking event complete:', error);
      toast({
        title: "Failed to update status",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const sendThankYouEmail = async (quote: any) => {
    try {
      const { error } = await supabase.functions.invoke('send-gmail-email', {
        body: {
          to: quote.email,
          subject: `Thank you for choosing Soul Train's Eatery!`,
          html: `
            <h2>Thank You!</h2>
            <p>Dear ${quote.contact_name},</p>
            <p>Thank you for choosing Soul Train's Eatery for your ${quote.event_name}. It was our pleasure to be part of your special event!</p>
            <p>We hope you and your guests enjoyed the authentic Southern cuisine and hospitality that we're known for.</p>
            <div style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
              <p><strong>We'd love your feedback!</strong></p>
              <p>Your experience matters to us. If you have a moment, we'd appreciate a review to help us continue providing exceptional catering services.</p>
            </div>
            <p>Thank you again for trusting us with your event. We look forward to serving you again in the future!</p>
            <p>Warm regards,<br>The Soul Train's Eatery Family</p>
            <p><em>Charleston's trusted catering partner for memorable events from the heart.</em></p>
          `
        }
      });

      if (error) throw error;

      toast({
        title: "Thank you email sent!",
        description: "Thank you and feedback request sent to customer",
      });
    } catch (error) {
      console.error('Error sending thank you email:', error);
      toast({
        title: "Failed to send email",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const sendFeedbackRequest = async (quote: any) => {
    try {
      const { error } = await supabase.functions.invoke('send-gmail-email', {
        body: {
          to: quote.email,
          subject: `How was your experience with Soul Train's Eatery?`,
          html: `
            <h2>How Did We Do?</h2>
            <p>Dear ${quote.contact_name},</p>
            <p>We hope your ${quote.event_name} was everything you hoped for and more!</p>
            <p>As a family-run business, your feedback means the world to us. It helps us continue to bring people together around exceptional Southern food.</p>
            <div style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px; text-align: center;">
              <p><strong>Please share your experience:</strong></p>
              <p>Reply to this email with your thoughts, or leave us a review online.</p>
              <p>Your feedback helps other families discover our authentic Southern catering.</p>
            </div>
            <p>Thank you for choosing Soul Train's Eatery for your special event!</p>
            <p>With gratitude,<br>The Soul Train's Eatery Team</p>
            <p><em>Phone: (843) 970-0265 • Email: soultrainseatery@gmail.com</em></p>
          `
        }
      });

      if (error) throw error;

      toast({
        title: "Feedback request sent!",
        description: "Feedback request sent to customer",
      });
    } catch (error) {
      console.error('Error sending feedback request:', error);
      toast({
        title: "Failed to send request",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const saveEventCloseout = async (quoteId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notes')
        .insert({
          quote_request_id: quoteId,
          note_content: `Event Closeout - Rating: ${eventRating}\nNotes: ${eventNotes}`,
          category: 'event_closeout',
          priority_level: 'normal'
        });

      if (error) throw error;

      toast({
        title: "Closeout notes saved",
        description: "Event closeout information saved successfully",
      });
    } catch (error) {
      console.error('Error saving closeout notes:', error);
      toast({
        title: "Failed to save notes",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Closeout Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Completed Events</span>
            </div>
            <div className="text-2xl font-bold">{completedEvents.length}</div>
            <p className="text-xs text-muted-foreground">Need closeout</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Recent Events</span>
            </div>
            <div className="text-2xl font-bold">{recentEvents.length}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Feedback Pending</span>
            </div>
            <div className="text-2xl font-bold">{completedEvents.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Completed Events List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Completed Events</h3>
        {recentEvents.length > 0 ? (
          recentEvents.map((quote) => {
            const daysAgo = getDaysAgo(quote.event_date);
            const isSelected = selectedEvent === quote.id;

            return (
              <Card key={quote.id} className={`${isSelected ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-lg">{quote.event_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {quote.contact_name} • {daysAgo} {daysAgo === 1 ? 'day' : 'days'} ago
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Completed
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendThankYouEmail(quote)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Send Thank You
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendFeedbackRequest(quote)}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Request Feedback
                      </Button>
                      <Button
                        variant={isSelected ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setSelectedEvent(isSelected ? null : quote.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {isSelected ? 'Close' : 'Closeout'}
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
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${(quote.estimated_total / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Event Closeout Panel */}
                  {isSelected && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                      <h4 className="font-medium">Event Closeout</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Event Rating</label>
                          <Select value={eventRating} onValueChange={(value: any) => setEventRating(value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Rate the event execution" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent - Everything perfect</SelectItem>
                              <SelectItem value="good">Good - Minor issues</SelectItem>
                              <SelectItem value="fair">Fair - Some problems</SelectItem>
                              <SelectItem value="poor">Poor - Major issues</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block">Event Notes</label>
                          <Textarea
                            placeholder="Event execution notes, customer feedback, areas for improvement..."
                            value={eventNotes}
                            onChange={(e) => setEventNotes(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => saveEventCloseout(quote.id)}
                            disabled={!eventRating || !eventNotes}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Save Closeout
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markEventComplete(quote.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark Complete
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
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No recent events</h3>
                <p>Completed events will appear here for closeout.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}