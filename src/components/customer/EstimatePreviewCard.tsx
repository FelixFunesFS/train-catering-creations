import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { 
  Eye, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  CreditCard,
  CheckCircle,
  MessageSquare,
  Download,
  Phone
} from 'lucide-react';

interface EstimatePreviewCardProps {
  invoice: any;
  quote: any;
  onViewEstimate?: () => void;
  onRequestChanges?: () => void;
  onMakePayment?: () => void;
  onApprove?: () => void;
}

export function EstimatePreviewCard({ 
  invoice, 
  quote, 
  onViewEstimate,
  onRequestChanges,
  onMakePayment,
  onApprove
}: EstimatePreviewCardProps) {
  const formatCurrency = (amount: number) => {
    // Ensure consistent currency formatting across the app
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

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getActionButtons = () => {
    if (!invoice) return null;
    
    const status = invoice.status;
    const isEstimate = status === 'draft' || status === 'sent' || status === 'viewed' || invoice.is_draft;
    
    if (isEstimate) {
      return (
        <div className="flex gap-2 flex-wrap">
          <Button onClick={onApprove} className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve Estimate
          </Button>
          <Button onClick={onRequestChanges} variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Request Changes
          </Button>
        </div>
      );
    }
    
    if (status === 'approved') {
      return (
        <div className="flex gap-2 flex-wrap">
          <Button onClick={onMakePayment} className="flex-1 bg-green-600 hover:bg-green-700">
            <CreditCard className="h-4 w-4 mr-2" />
            Make Payment
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      );
    }

    if (status === 'paid') {
      return (
        <div className="flex justify-center">
          <Badge className="bg-green-600 text-white px-4 py-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            Payment Complete - Thank You!
          </Badge>
        </div>
      );
    }

    return null;
  };

  if (!invoice) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No estimate information available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Estimate Details</CardTitle>
          <StatusBadge 
            status={invoice.status} 
            isDraft={invoice.is_draft}
            size="lg"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Summary */}
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{quote?.event_name || 'Event Details'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quote?.event_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(quote.event_date)}</p>
                </div>
              </div>
            )}
            
            {quote?.start_time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{formatTime(quote.start_time)}</p>
                </div>
              </div>
            )}
            
            {quote?.guest_count && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-medium">{quote.guest_count} people</p>
                </div>
              </div>
            )}
            
            {quote?.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{quote.location}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Amount Summary */}
        <div className="border-2 border-primary/20 rounded-lg p-6 bg-primary/5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(invoice.total_amount)}
              </p>
            </div>
            {invoice.due_date && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">{formatDate(invoice.due_date)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4">
          {getActionButtons()}
        </div>

        {/* Contact Information */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>(843) 970-0265</span>
            </div>
            <div>
              <span>soultrainseatery@gmail.com</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}