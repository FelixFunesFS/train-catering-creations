import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Send, 
  Eye, 
  CreditCard, 
  Calendar,
  FileText,
  DollarSign
} from 'lucide-react';

interface CustomerStatusTimelineProps {
  invoice: any;
  quote: any;
}

export function CustomerStatusTimeline({ invoice, quote }: CustomerStatusTimelineProps) {
  const getTimelineSteps = () => {
    const steps = [
      {
        id: 'submitted',
        title: 'Quote Requested',
        description: 'Your catering request has been submitted',
        icon: FileText,
        status: 'completed',
        date: quote.created_at
      },
      {
        id: 'estimate_created',
        title: 'Estimate Prepared',
        description: 'Our team has prepared your catering estimate',
        icon: FileText,
        status: invoice.is_draft ? 'pending' : 'completed',
        date: invoice.created_at
      },
      {
        id: 'sent',
        title: 'Estimate Sent',
        description: 'Your estimate has been sent for review',
        icon: Send,
        status: ['sent', 'viewed', 'approved', 'deposit_paid', 'confirmed'].includes(invoice.workflow_status) ? 'completed' : 'pending',
        date: invoice.sent_at
      },
      {
        id: 'viewed',
        title: 'Estimate Reviewed',
        description: 'You have reviewed the estimate details',
        icon: Eye,
        status: ['viewed', 'approved', 'deposit_paid', 'confirmed'].includes(invoice.workflow_status) ? 'completed' : 'pending',
        date: invoice.viewed_at
      },
      {
        id: 'approved',
        title: 'Estimate Approved',
        description: 'You have approved the catering estimate',
        icon: CheckCircle,
        status: ['approved', 'deposit_paid', 'confirmed'].includes(invoice.workflow_status) ? 'completed' : 'pending',
        date: invoice.workflow_status === 'approved' ? new Date().toISOString() : null
      },
      {
        id: 'payment',
        title: 'Deposit Payment',
        description: 'Secure your event date with deposit payment',
        icon: CreditCard,
        status: ['deposit_paid', 'confirmed'].includes(invoice.workflow_status) ? 'completed' : 'pending',
        date: invoice.workflow_status === 'deposit_paid' ? invoice.paid_at : null
      },
      {
        id: 'confirmed',
        title: 'Event Confirmed',
        description: 'Your catering event is confirmed and scheduled',
        icon: Calendar,
        status: invoice.workflow_status === 'confirmed' ? 'completed' : 'pending',
        date: invoice.workflow_status === 'confirmed' ? invoice.updated_at : null
      }
    ];

    return steps;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'current':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'pending':
        return 'text-gray-400 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-400 bg-gray-100 border-gray-200';
    }
  };

  const steps = getTimelineSteps();
  
  // Find current step
  const currentStepIndex = steps.findIndex(step => 
    step.status === 'pending' && steps[Math.max(0, steps.indexOf(step) - 1)]?.status === 'completed'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Event Progress Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            const isCurrent = index === currentStepIndex;
            const stepStatus = isCurrent ? 'current' : step.status;
            
            return (
              <div key={step.id} className="relative flex items-start">
                {/* Timeline line */}
                {!isLast && (
                  <div 
                    className={`absolute left-6 top-12 w-0.5 h-8 ${
                      step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                    }`}
                  />
                )}
                
                {/* Icon */}
                <div className={`
                  flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center
                  ${getStatusColor(stepStatus)}
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                
                {/* Content */}
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${
                      stepStatus === 'completed' ? 'text-green-900' : 
                      stepStatus === 'current' ? 'text-blue-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {stepStatus === 'current' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          Current Step
                        </Badge>
                      )}
                      {step.date && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(step.date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm ${
                    stepStatus === 'completed' ? 'text-green-700' : 
                    stepStatus === 'current' ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                  
                  {/* Additional info for current step */}
                  {isCurrent && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium">
                        {getCurrentStepGuidance(invoice.workflow_status)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Progress indicator */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getCurrentStepGuidance(status: string): string {
  switch (status) {
    case 'sent':
      return 'Please review your estimate and contact us with any questions or requested changes.';
    case 'viewed':
      return 'Ready to move forward? Contact us to approve your estimate and proceed to payment.';
    case 'approved':
      return 'Your estimate is approved! Please submit your deposit payment to secure your event date.';
    case 'deposit_paid':
      return 'Thank you! Your deposit has been received and your event is confirmed.';
    default:
      return 'We\'ll keep you updated as we process your request.';
  }
}