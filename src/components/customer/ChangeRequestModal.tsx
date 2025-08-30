import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar,
  Clock,
  Users,
  MapPin,
  UtensilsCrossed,
  MessageSquare,
  Send,
  Loader2
} from 'lucide-react';

interface ChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  customerEmail: string;
  currentDetails: {
    event_name: string;
    event_date: string;
    guest_count: number;
    location: string;
    service_type: string;
    special_requests?: string;
  };
}

export function ChangeRequestModal({ 
  isOpen, 
  onClose, 
  invoiceId, 
  customerEmail, 
  currentDetails 
}: ChangeRequestModalProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [requestType, setRequestType] = useState<string>('modification');
  const [priority, setPriority] = useState<string>('medium');
  
  const [formData, setFormData] = useState({
    event_name: currentDetails.event_name,
    event_date: currentDetails.event_date,
    guest_count: currentDetails.guest_count.toString(),
    location: currentDetails.location,
    service_type: currentDetails.service_type,
    special_requests: currentDetails.special_requests || '',
    customer_comments: '',
    changes_requested: [] as string[]
  });

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      changes_requested: checked 
        ? [...prev.changes_requested, field]
        : prev.changes_requested.filter(item => item !== field)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const requestedChanges = {
        event_name: formData.changes_requested.includes('event_name') ? formData.event_name : undefined,
        event_date: formData.changes_requested.includes('event_date') ? formData.event_date : undefined,
        guest_count: formData.changes_requested.includes('guest_count') ? parseInt(formData.guest_count) : undefined,
        location: formData.changes_requested.includes('location') ? formData.location : undefined,
        service_type: formData.changes_requested.includes('service_type') ? formData.service_type : undefined,
        special_requests: formData.changes_requested.includes('special_requests') ? formData.special_requests : undefined,
        changes_summary: formData.changes_requested
      };

      const { error } = await supabase
        .from('change_requests')
        .insert({
          invoice_id: invoiceId,
          customer_email: customerEmail,
          request_type: requestType,
          priority: priority,
          original_details: currentDetails,
          requested_changes: requestedChanges,
          customer_comments: formData.customer_comments
        });

      if (error) throw error;

      toast({
        title: "Change Request Submitted",
        description: "Your change request has been sent to our team. We'll review it and get back to you within 24 hours.",
      });

      onClose();
    } catch (error) {
      console.error('Error submitting change request:', error);
      toast({
        title: "Error",
        description: "Failed to submit change request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Request Changes to Your Estimate
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Type */}
          <div className="space-y-2">
            <Label htmlFor="request-type">Type of Request</Label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modification">Event Modification</SelectItem>
                <SelectItem value="postponement">Event Postponement</SelectItem>
                <SelectItem value="cancellation">Event Cancellation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - No rush</SelectItem>
                <SelectItem value="medium">Medium - Within a few days</SelectItem>
                <SelectItem value="high">High - Within 24 hours</SelectItem>
                <SelectItem value="urgent">Urgent - ASAP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {requestType === 'modification' && (
            <>
              {/* Current Details */}
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">Current Event Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{currentDetails.event_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(currentDetails.event_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{currentDetails.guest_count} guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{currentDetails.location}</span>
                  </div>
                </div>
              </div>

              {/* Changes to Request */}
              <div className="space-y-3">
                <Label className="text-base font-medium">What would you like to change?</Label>
                
                <div className="space-y-4">
                  {/* Event Name */}
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="change-event-name"
                      checked={formData.changes_requested.includes('event_name')}
                      onCheckedChange={(checked) => handleCheckboxChange('event_name', checked as boolean)}
                    />
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="change-event-name" className="text-sm font-medium">
                        Event Name
                      </Label>
                      {formData.changes_requested.includes('event_name') && (
                        <Input
                          value={formData.event_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, event_name: e.target.value }))}
                          placeholder="New event name"
                        />
                      )}
                    </div>
                  </div>

                  {/* Event Date */}
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="change-event-date"
                      checked={formData.changes_requested.includes('event_date')}
                      onCheckedChange={(checked) => handleCheckboxChange('event_date', checked as boolean)}
                    />
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="change-event-date" className="text-sm font-medium">
                        Event Date
                      </Label>
                      {formData.changes_requested.includes('event_date') && (
                        <Input
                          type="date"
                          value={formData.event_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                        />
                      )}
                    </div>
                  </div>

                  {/* Guest Count */}
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="change-guest-count"
                      checked={formData.changes_requested.includes('guest_count')}
                      onCheckedChange={(checked) => handleCheckboxChange('guest_count', checked as boolean)}
                    />
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="change-guest-count" className="text-sm font-medium">
                        Guest Count
                      </Label>
                      {formData.changes_requested.includes('guest_count') && (
                        <Input
                          type="number"
                          value={formData.guest_count}
                          onChange={(e) => setFormData(prev => ({ ...prev, guest_count: e.target.value }))}
                          placeholder="Number of guests"
                        />
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="change-location"
                      checked={formData.changes_requested.includes('location')}
                      onCheckedChange={(checked) => handleCheckboxChange('location', checked as boolean)}
                    />
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="change-location" className="text-sm font-medium">
                        Event Location
                      </Label>
                      {formData.changes_requested.includes('location') && (
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="New event location"
                        />
                      )}
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="change-special-requests"
                      checked={formData.changes_requested.includes('special_requests')}
                      onCheckedChange={(checked) => handleCheckboxChange('special_requests', checked as boolean)}
                    />
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="change-special-requests" className="text-sm font-medium">
                        Special Requests or Menu Changes
                      </Label>
                      {formData.changes_requested.includes('special_requests') && (
                        <Textarea
                          value={formData.special_requests}
                          onChange={(e) => setFormData(prev => ({ ...prev, special_requests: e.target.value }))}
                          placeholder="Describe any menu changes or special requests"
                          rows={3}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Additional Comments */}
          <div className="space-y-2">
            <Label htmlFor="customer-comments">Additional Comments</Label>
            <Textarea
              id="customer-comments"
              value={formData.customer_comments}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_comments: e.target.value }))}
              placeholder="Please provide any additional details about your request..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || (requestType === 'modification' && formData.changes_requested.length === 0)}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}