import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Users, MapPin, Clock, AlertCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
    dietary_changes: '',
    menu_changes: '',
    service_changes: '',
    customer_comments: '',
    contact_preference: 'email',
    urgency: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateEstimatedCostChange = () => {
    let costChange = 0;
    
    // Simple cost estimation logic
    if (formData.new_guest_count && parseInt(formData.new_guest_count) !== quote.guest_count) {
      const guestDiff = parseInt(formData.new_guest_count) - quote.guest_count;
      costChange += guestDiff * 50; // $50 per guest difference
    }
    
    if (formData.menu_changes) {
      costChange += 100; // Base charge for menu changes
    }
    
    if (formData.service_changes) {
      costChange += 150; // Base charge for service changes
    }
    
    return costChange;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const estimatedCostChange = calculateEstimatedCostChange();
      
      const requestedChanges = {
        event_date: formData.new_event_date !== quote.event_date ? formData.new_event_date : null,
        guest_count: formData.new_guest_count !== quote.guest_count.toString() ? parseInt(formData.new_guest_count) : null,
        location: formData.new_location !== quote.location ? formData.new_location : null,
        start_time: formData.new_start_time !== quote.start_time ? formData.new_start_time : null,
        dietary_changes: formData.dietary_changes || null,
        menu_changes: formData.menu_changes || null,
        service_changes: formData.service_changes || null,
        contact_preference: formData.contact_preference,
        urgency: formData.urgency
      };

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
          estimated_cost_change: estimatedCostChange * 100, // Convert to cents
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
        description: "We've received your change request and will review it within 24 hours.",
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

  const estimatedCostChange = calculateEstimatedCostChange();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          Request Changes to Your Quote
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Use this form to request modifications to your current quote. We'll review your changes and provide an updated estimate.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Type of Change Request</Label>
            <RadioGroup
              value={formData.request_type}
              onValueChange={(value) => handleInputChange('request_type', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="modification" id="modification" />
                <Label htmlFor="modification">Modify existing details</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="addition" id="addition" />
                <Label htmlFor="addition">Add services or items</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reduction" id="reduction" />
                <Label htmlFor="reduction">Remove services or reduce scope</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Event Details Changes */}
          <div className="space-y-4">
            <h4 className="font-medium text-base border-b pb-2">Event Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new_event_date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  New Event Date
                </Label>
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
                <Label htmlFor="new_start_time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  New Start Time
                </Label>
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
                <Label htmlFor="new_guest_count" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  New Guest Count
                </Label>
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
                <Label htmlFor="new_location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  New Location
                </Label>
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

          {/* Service Changes */}
          <div className="space-y-4">
            <h4 className="font-medium text-base border-b pb-2">Service & Menu Changes</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="menu_changes">Menu Modifications</Label>
                <Textarea
                  id="menu_changes"
                  value={formData.menu_changes}
                  onChange={(e) => handleInputChange('menu_changes', e.target.value)}
                  placeholder="Describe any changes to the menu, food items, or dietary requirements..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_changes">Service Modifications</Label>
                <Textarea
                  id="service_changes"
                  value={formData.service_changes}
                  onChange={(e) => handleInputChange('service_changes', e.target.value)}
                  placeholder="Describe changes to service style, setup, staff requirements, etc..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietary_changes">Dietary Requirements</Label>
                <Textarea
                  id="dietary_changes"
                  value={formData.dietary_changes}
                  onChange={(e) => handleInputChange('dietary_changes', e.target.value)}
                  placeholder="New or updated dietary restrictions, allergies, special requirements..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Additional Comments */}
          <div className="space-y-2">
            <Label htmlFor="customer_comments">Additional Comments</Label>
            <Textarea
              id="customer_comments"
              value={formData.customer_comments}
              onChange={(e) => handleInputChange('customer_comments', e.target.value)}
              placeholder="Any additional information or special requests..."
              rows={3}
            />
          </div>

          {/* Contact Preferences */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Preferred Contact Method</Label>
            <RadioGroup
              value={formData.contact_preference}
              onValueChange={(value) => handleInputChange('contact_preference', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone" />
                <Label htmlFor="phone">Phone Call</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both">Both Email and Phone</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Urgency */}
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

          {/* Cost Estimate */}
          {estimatedCostChange !== 0 && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Estimated Cost Impact</h4>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={estimatedCostChange > 0 ? "destructive" : "default"}
                  className={estimatedCostChange > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                >
                  {estimatedCostChange > 0 ? '+' : ''}${Math.abs(estimatedCostChange)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {estimatedCostChange > 0 ? 'Additional cost' : 'Potential savings'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This is a preliminary estimate. Final pricing will be provided with your updated quote.
              </p>
            </div>
          )}

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