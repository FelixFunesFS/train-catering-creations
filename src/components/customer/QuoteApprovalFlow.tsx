import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, MessageSquare, DollarSign, Calendar, Users, MapPin } from 'lucide-react';
import { ChangeRequestService } from '@/services/ChangeRequestService';
import { toast } from '@/hooks/use-toast';

interface QuoteApprovalFlowProps {
  quote: any;
  onApprovalChange: (approved: boolean, comments?: string) => void;
}

export function QuoteApprovalFlow({ quote, onApprovalChange }: QuoteApprovalFlowProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isSubmittingChange, setIsSubmittingChange] = useState(false);
  const [comments, setComments] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await ChangeRequestService.updateQuoteStatus({
        quoteId: quote.id,
        status: 'confirmed',
        comments
      });

      // Notify admin (fire and forget)
      void ChangeRequestService.sendQuoteNotification(quote.id, 'confirmed', comments);

      toast({
        title: "Quote Confirmed!",
        description: "Thank you for confirming your quote. We'll begin preparing your event details.",
        variant: "default"
      });

      onApprovalChange(true, comments);
    } catch (error) {
      console.error('Error approving quote:', error);
      toast({
        title: "Error",
        description: "Failed to approve quote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      await ChangeRequestService.updateQuoteStatus({
        quoteId: quote.id,
        status: 'cancelled',
        comments
      });

      // Notify admin (fire and forget)
      void ChangeRequestService.sendQuoteNotification(quote.id, 'cancelled', comments || 'No comments provided');

      toast({
        title: "Quote Cancelled",
        description: "We've received your response. Feel free to contact us for any modifications.",
        variant: "default"
      });

      onApprovalChange(false, comments);
    } catch (error) {
      console.error('Error declining quote:', error);
      toast({
        title: "Error",
        description: "Failed to decline quote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeclining(false);
    }
  };

  const handleSubmitChangeRequest = async () => {
    setIsSubmittingChange(true);
    try {
      await ChangeRequestService.submitChangeRequest({
        quoteRequestId: quote.id,
        customerEmail: quote.email,
        requestType: 'modification',
        customerComments: comments,
        requestedChanges: { comments }
      });

      // Notify admin (fire and forget)
      void ChangeRequestService.sendQuoteNotification(quote.id, 'change_requested', comments);

      toast({
        title: "Change Request Submitted",
        description: "We've received your change request and will review it shortly.",
      });

      setShowCommentBox(false);
      setComments('');
    } catch (error) {
      console.error('Error submitting change request:', error);
      toast({
        title: "Error",
        description: "Failed to submit change request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingChange(false);
    }
  };

  const getStatusBadge = () => {
    switch (quote.workflow_status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      default:
        return <Badge variant="outline">{quote.workflow_status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Quote Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Quote Details</CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Event Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Event Date:</span>
                <span>{quote.event_date ? formatDate(quote.event_date) : 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Guest Count:</span>
                <span>{quote.guest_count} guests</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span>{quote.location}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Estimated Total:</span>
                <span className="text-lg font-semibold text-primary">
                  {quote.estimated_total ? formatCurrency(quote.estimated_total) : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Service Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>Service Type: {quote.service_type || 'Standard Catering'}</div>
              <div>Event Type: {quote.event_type || 'Corporate Event'}</div>
            </div>
          </div>

          {/* Special Requests */}
          {quote.special_requests && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Special Requests</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {quote.special_requests}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Actions */}
      {quote.workflow_status === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Review & Approve Quote
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Please review the quote details above. You can approve, request changes, or decline this quote.
            </p>

            {/* Comment Box */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Comments (Optional)</label>
              <Textarea
                placeholder="Add any comments, questions, or special requests..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleApprove}
                disabled={isApproving || isDeclining}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isApproving ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Quote
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowCommentBox(!showCommentBox)}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleDecline}
                disabled={isApproving || isDeclining}
                className="flex-1"
              >
                {isDeclining ? (
                  <>Processing...</>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline Quote
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Changes Form */}
      {showCommentBox && quote.workflow_status === 'pending' && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800">Request Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Please describe the changes you'd like to request..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="border-orange-200 focus:border-orange-400"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitChangeRequest}
                  disabled={isSubmittingChange}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmittingChange ? 'Submitting...' : 'Submit Change Request'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCommentBox(false);
                    setComments('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Information */}
      {quote.workflow_status !== 'pending' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              {quote.workflow_status === 'estimated' && (
                <>
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <h3 className="text-lg font-semibold text-green-800">Quote Sent!</h3>
                  <p className="text-muted-foreground">
                    Your estimate has been sent. Please check your email for details.
                  </p>
                </>
              )}
              {quote.workflow_status === 'cancelled' && (
                <>
                  <XCircle className="h-12 w-12 text-red-600 mx-auto" />
                  <h3 className="text-lg font-semibold text-red-800">Quote Cancelled</h3>
                  <p className="text-muted-foreground">
                    We understand this quote wasn't quite right. Please contact us to discuss alternatives.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
