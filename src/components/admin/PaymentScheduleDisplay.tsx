import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PaymentMilestone {
  id?: string;
  milestone_type: string;
  percentage: number;
  amount_cents: number;
  due_date?: string;
  is_due_now: boolean;
  is_net30: boolean;
  description: string;
  status: string;
}

interface PaymentScheduleDisplayProps {
  milestones: PaymentMilestone[];
  customerType: 'PERSON' | 'ORG' | 'GOV';
  totalAmount: number;
  eventDate?: string;
  className?: string;
}

export function PaymentScheduleDisplay({ 
  milestones, 
  customerType, 
  totalAmount, 
  eventDate,
  className = ""
}: PaymentScheduleDisplayProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getMilestoneIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit':
        return <DollarSign className="h-4 w-4" />;
      case 'milestone':
        return <Clock className="h-4 w-4" />;
      case 'balance':
      case 'final':
        return <Calendar className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string, isDueNow: boolean, isNet30: boolean) => {
    if (isNet30) return 'secondary';
    if (isDueNow) return 'destructive';
    
    switch (status.toLowerCase()) {
      case 'paid':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string, isDueNow: boolean, isNet30: boolean) => {
    if (isNet30) return 'Net 30';
    if (isDueNow) return 'Due Now';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (!milestones || milestones.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              Payment schedule will be generated when estimate is approved
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payment Schedule
          <Badge variant="outline">
            {customerType === 'GOV' ? 'Government' : 'Standard'}
          </Badge>
        </CardTitle>
        {customerType === 'GOV' && (
          <p className="text-sm text-muted-foreground">
            Net 30 payment terms after event completion
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div 
              key={milestone.id || index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getMilestoneIcon(milestone.milestone_type)}
                </div>
                <div>
                  <div className="font-medium">
                    {milestone.description || `${milestone.milestone_type} Payment`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {milestone.percentage}% of total
                    {milestone.due_date && !milestone.is_net30 && (
                      <span className="ml-2">
                        Due: {formatDate(milestone.due_date)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(milestone.amount_cents / 100)}
                </div>
                <Badge 
                  variant={getStatusColor(milestone.status, milestone.is_due_now, milestone.is_net30)}
                  className="text-xs"
                >
                  {getStatusText(milestone.status, milestone.is_due_now, milestone.is_net30)}
                </Badge>
              </div>
            </div>
          ))}
          
          <div className="border-t pt-3">
            <div className="flex justify-between items-center font-semibold">
              <span>Total Amount:</span>
              <span>{formatCurrency(totalAmount / 100)}</span>
            </div>
            {eventDate && (
              <div className="text-sm text-muted-foreground mt-1">
                Event Date: {formatDate(eventDate)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PaymentScheduleDisplay;