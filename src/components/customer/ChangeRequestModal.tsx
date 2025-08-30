import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Users, 
  ChefHat, 
  Settings, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface ChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  customerEmail: string;
  onSubmit?: () => void;
}

export function ChangeRequestModal({ isOpen, onClose, invoiceId, customerEmail, onSubmit }: ChangeRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [priority, setPriority] = useState('medium');
  const [comments, setComments] = useState('');
  const [specificChanges, setSpecificChanges] = useState({
    guestCount: '',
    eventDate: '',
    menuChanges: '',
    locationChanges: '',
    timeChanges: ''
  });

  const { toast } = useToast();

  const requestTypes = [
    { value: 'guest_count', label: 'Change Guest Count', icon: Users },
    { value: 'event_date', label: 'Change Event Date/Time', icon: Calendar },
    { value: 'menu_modification', label: 'Menu Modifications', icon: ChefHat },
    { value: 'service_level', label: 'Service Level Changes', icon: Settings },
    { value: 'general', label: 'General Request', icon: MessageSquare }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low - Minor changes', color: 'text-green-600' },
    { value: 'medium', label: 'Medium - Standard changes', color: 'text-yellow-600' },
    { value: 'high', label: 'High - Urgent changes', color: 'text-red-600' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        invoice_id: invoiceId,
        customer_email: customerEmail,
        request_type: requestType,
        priority: priority,
        customer_comments: comments,
        requested_changes: {
          type: requestType,
          specificChanges: specificChanges,
          comments: comments
        },
        status: 'pending'
      };

      const { error } = await supabase
        .from('change_requests')
        .insert(requestData);

      if (error) throw error;

      toast({
        title: "Change Request Submitted",
        description: "Your change request has been submitted. We'll review it and get back to you soon.",
      });

      // Reset form
      setRequestType('');
      setPriority('medium');
      setComments('');
      setSpecificChanges({
        guestCount: '',
        eventDate: '',
        menuChanges: '',
        locationChanges: '',
        timeChanges: ''
      });

      if (onSubmit) onSubmit();
      onClose();

    } catch (error) {
      console.error('Error submitting change request:', error);
      toast({
        title: "Error",
        description: "Failed to submit your change request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSpecificFields = () => {
    switch (requestType) {
      case 'guest_count':
        return (
          <div>
            <Label htmlFor="guestCount">New Guest Count</Label>
            <Input
              id="guestCount"
              type="number"
              placeholder="Enter new guest count"
              value={specificChanges.guestCount}
              onChange={(e) => setSpecificChanges(prev => ({ ...prev, guestCount: e.target.value }))}
            />
          </div>
        );
      
      case 'event_date':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="eventDate">Preferred New Date</Label>
              <Input
                id="eventDate"
                type="date"
                value={specificChanges.eventDate}
                onChange={(e) => setSpecificChanges(prev => ({ ...prev, eventDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="timeChanges">Time Changes</Label>
              <Input
                id="timeChanges"
                placeholder="e.g., Start at 6:00 PM instead of 5:00 PM"
                value={specificChanges.timeChanges}
                onChange={(e) => setSpecificChanges(prev => ({ ...prev, timeChanges: e.target.value }))}
              />
            </div>
          </div>
        );
      
      case 'menu_modification':
        return (
          <div>
            <Label htmlFor="menuChanges">Menu Changes</Label>
            <Textarea
              id="menuChanges"
              placeholder="Describe the menu changes you'd like to make..."
              value={specificChanges.menuChanges}
              onChange={(e) => setSpecificChanges(prev => ({ ...prev, menuChanges: e.target.value }))}
              rows={3}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Changes to Your Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Summary */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <h3 className="font-medium mb-3">Request Changes</h3>
              <p className="text-sm text-muted-foreground">
                Use this form to request changes to your catering event. Our team will review 
                your request and respond with updated pricing if applicable.
              </p>
            </CardContent>
          </Card>

          {/* Request Type */}
          <div>
            <Label htmlFor="requestType">What would you like to change?</Label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger>
                <SelectValue placeholder="Select the type of change you need" />
              </SelectTrigger>
              <SelectContent>
                {requestTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Specific Fields */}
          {requestType && (
            <div className="space-y-4">
              {renderSpecificFields()}
            </div>
          )}

          {/* Priority */}
          <div>
            <Label htmlFor="priority">Priority Level</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <span className={level.color}>{level.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Comments */}
          <div>
            <Label htmlFor="comments">Additional Comments</Label>
            <Textarea
              id="comments"
              placeholder="Please provide any additional details about your request..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">Important Notice</p>
                <p className="text-yellow-700">
                  Changes to your event may affect pricing and availability. We'll review your request 
                  and provide an updated estimate if needed. Changes made close to your event date 
                  may incur additional fees.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !requestType || !comments.trim()}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Change Request'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}