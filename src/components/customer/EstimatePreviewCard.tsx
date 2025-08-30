import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { 
  FileText, 
  Download, 
  Eye, 
  CreditCard,
  Calendar,
  Users,
  MapPin,
  Clock
} from 'lucide-react';

interface EstimatePreviewCardProps {
  invoice: any;
  quote: any;
  onViewEstimate: () => void;
  onRequestChanges: () => void;
  onMakePayment?: () => void;
}

export function EstimatePreviewCard({ 
  invoice, 
  quote, 
  onViewEstimate, 
  onRequestChanges, 
  onMakePayment 
}: EstimatePreviewCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getActionButtons = () => {
    const status = invoice.status;
    
    switch (status) {
      case 'sent':
      case 'viewed':
        return (
          <div className="flex gap-2 flex-wrap">
            <Button onClick={onViewEstimate} className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Review Estimate
            </Button>
            <Button onClick={onRequestChanges} variant="outline">
              Request Changes
            </Button>
          </div>
        );
      
      case 'approved':
        return (
          <div className="flex gap-2 flex-wrap">
            <Button onClick={onMakePayment} className="flex-1 bg-green-600 hover:bg-green-700">
              <CreditCard className="h-4 w-4 mr-2" />
              Make Payment
            </Button>
            <Button onClick={onViewEstimate} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Estimate
            </Button>
          </div>
        );
      
      case 'deposit_paid':
      case 'confirmed':
        return (
          <div className="flex gap-2 flex-wrap">
            <Button onClick={onViewEstimate} className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              View Contract
            </Button>
            <Button onClick={onRequestChanges} variant="outline">
              Contact Us
            </Button>
          </div>
        );
      
      default:
        return (
          <Button onClick={onViewEstimate} className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        );
    }
  };

  return (
    <Card className="shadow-lg border-2 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-2">{quote.event_name}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(quote.event_date)}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {quote.guest_count} guests
              </div>
            </div>
          </div>
          <StatusBadge 
            status={invoice.status} 
            isDraft={invoice.is_draft}
            size="lg"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Event Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{quote.start_time || 'Time TBD'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{quote.location}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(invoice.total_amount)}
            </div>
            <div className="text-sm text-muted-foreground">
              Estimate Total
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {getActionButtons()}

        {/* Contact Information */}
        <div className="text-center pt-4 border-t text-sm text-muted-foreground">
          <p>Questions? Contact us at</p>
          <div className="flex justify-center gap-4 mt-1">
            <a href="mailto:soultrainseatery@gmail.com" className="text-primary hover:underline">
              soultrainseatery@gmail.com
            </a>
            <a href="tel:(843) 970-0265" className="text-primary hover:underline">
              (843) 970-0265
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}