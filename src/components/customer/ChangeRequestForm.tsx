import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Users, MapPin, Clock, AlertCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CurrentMenuDisplay } from './CurrentMenuDisplay';
import { MenuChangeSelector } from './MenuChangeSelector';

interface ChangeRequestFormProps {
  quote: any;
  invoice: any;
  onRequestSubmitted: () => void;
}

export function ChangeRequestForm({ quote, invoice, onRequestSubmitted }: ChangeRequestFormProps) {
  const [formData, setFormData] = useState({
    request_type: 'modification',
    priority: 'medium',
    new_event_date: quote.event_date || '',
    new_guest_count: quote.guest_count || '',
    new_location: quote.location || '',
    new_start_time: quote.start_time || '',
    customer_comments: '',
    contact_preference: 'email',
    urgency: false
  });
  const [menuChanges, setMenuChanges] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const requestedChanges: any = {
        event_date: formData.new_event_date !== quote.event_date ? formData.new_event_date : null,
        guest_count: formData.new_guest_count !== quote.guest_count.toString() ? parseInt(formData.new_guest_count) : null,
        location: formData.new_location !== quote.location ? formData.new_location : null,
        start_time: formData.new_start_time !== quote.start_time ? formData.new_start_time : null,
        contact_preference: formData.contact_preference,
        urgency: formData.urgency
      };

      // Add structured menu changes
      if (menuChanges) {
        requestedChanges.menu_changes = menuChanges;
      }

      // Remove null values
      Object.keys(requestedChanges).forEach(key => {
        if (requestedChanges[key] === null || requestedChanges[key] === '') {
          delete requestedChanges[key];
        }
      });

      // Validate required data
      if (!invoice?.id) {
        throw new Error('Invoice ID is required');
      }

      const { data: newRequest, error } = await supabase
        .from('change_requests')
        .insert({
          invoice_id: invoice.id,
          customer_email: quote.email,
          request_type: formData.request_type,
          priority: formData.urgency ? 'high' : formData.priority,
          status: 'pending',
          customer_comments: formData.customer_comments,
          requested_changes: requestedChanges,
          estimated_cost_change: 0,
          original_details: {
            event_date: quote.event_date,
            guest_count: quote.guest_count,
            location: quote.location,
            start_time: quote.start_time
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to submit change request: ${error.message}`);
      }

      if (!newRequest) {
        throw new Error('Failed to create change request');
      }

      // Update invoice workflow status to indicate customer requested changes
      const { error: invoiceUpdateError } = await supabase
        .from('invoices')
        .update({
          workflow_status: 'viewed',
          status: 'viewed',
          last_customer_action: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.id);

      if (invoiceUpdateError) {
        console.error('Failed to update invoice status:', invoiceUpdateError);
        // Don't throw - the change request was created successfully
      }

      // Log the workflow state change
      const { error: logError } = await supabase
        .from('workflow_state_log')
        .insert({
          entity_type: 'invoices',
          entity_id: invoice.id,
          previous_status: invoice.status,
          new_status: 'viewed',
          changed_by: quote.email,
          change_reason: `Customer submitted change request: ${formData.request_type}`,
          metadata: {
            change_request_id: newRequest.id,
            request_type: formData.request_type,
            priority: formData.urgency ? 'high' : formData.priority
          }
        });

      if (logError) {
        console.error('Failed to log workflow change:', logError);
        // Don't throw - the change request was created successfully
      }

      toast({
        title: "Change Request Submitted",
        description: "We've received your change request and will review it shortly. We'll send you an updated quote with final pricing within 24 hours.",
      });

      onRequestSubmitted();
    } catch (error) {
      console.error('Error submitting change request:', error);
      toast({
        title: "Error",
        description: "Failed to submit change request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          Request Changes to Your Quote
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Use this form to request modifications to your current quote. We'll review your changes and send you an updated quote with final pricing within 24 hours.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Menu Display */}
          <CurrentMenuDisplay quote={quote} />

          <Separator />

          {/* Menu Changes Selector */}
          <MenuChangeSelector quote={quote} onChange={setMenuChanges} />

          <Separator />

          {/* Event Details - Only if different from current */}
          <div className="space-y-4">
            <h4 className="font-medium text-base border-b pb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Event Details Changes (Optional)
            </h4>
            <p className="text-sm text-muted-foreground">
              Only fill in the fields you want to change. Leave others as-is.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new_event_date">Event Date</Label>
                <Input
                  id="new_event_date"
                  type="date"
                  value={formData.new_event_date}
                  onChange={(e) => handleInputChange('new_event_date', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Current: {quote.event_date ? new Date(quote.event_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_start_time">Start Time</Label>
                <Input
                  id="new_start_time"
                  type="time"
                  value={formData.new_start_time}
                  onChange={(e) => handleInputChange('new_start_time', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Current: {quote.start_time || 'Not set'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_guest_count">Guest Count</Label>
                <Input
                  id="new_guest_count"
                  type="number"
                  min="1"
                  value={formData.new_guest_count}
                  onChange={(e) => handleInputChange('new_guest_count', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Current: {quote.guest_count} guests
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_location">Location</Label>
                <Input
                  id="new_location"
                  value={formData.new_location}
                  onChange={(e) => handleInputChange('new_location', e.target.value)}
                  placeholder="Enter new event location"
                />
                <p className="text-xs text-muted-foreground">
                  Current: {quote.location}
                </p>
              </div>
            </div>
          </div>


          {/* Additional Comments & Urgency */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_comments">Additional Comments or Special Requests</Label>
              <Textarea
                id="customer_comments"
                value={formData.customer_comments}
                onChange={(e) => handleInputChange('customer_comments', e.target.value)}
                placeholder="Any additional information we should know about your changes..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="urgency"
                checked={formData.urgency}
                onCheckedChange={(checked) => handleInputChange('urgency', checked)}
              />
              <Label htmlFor="urgency" className="text-sm font-medium">
                This is urgent (event is within 7 days)
              </Label>
            </div>
          </div>

          {/* Info Message */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              After you submit this request, our team will review your changes and send you an updated quote with accurate pricing within 24 hours. We'll contact you via your preferred method if we need any additional information.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Change Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}