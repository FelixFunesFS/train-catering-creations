import { FileText, CheckCircle, DollarSign, Calendar, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EstimateProgressTrackerProps {
  status: string;
  className?: string;
}

const steps = [
  { id: 'sent', label: 'Estimate Sent', icon: FileText, statuses: ['sent', 'viewed'] },
  { id: 'approved', label: 'You Approved', icon: CheckCircle, statuses: ['approved', 'payment_pending'] },
  { id: 'paid', label: 'Payment Received', icon: DollarSign, statuses: ['partially_paid', 'paid'] },
  { id: 'confirmed', label: 'Event Confirmed', icon: Calendar, statuses: ['confirmed', 'completed'] }
];

function getCurrentStepIndex(status: string): number {
  const index = steps.findIndex(step => step.statuses.includes(status));
  return index === -1 ? 0 : index;
}

export function EstimateProgressTracker({ status, className }: EstimateProgressTrackerProps) {
  const currentStepIndex = getCurrentStepIndex(status);

  return (
    <div className={cn("w-full py-8", className)}>
      <div className="flex items-center justify-between max-w-4xl mx-auto px-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step indicator */}
              <div className="flex flex-col items-center relative">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompleted && "bg-green-600 text-white shadow-lg shadow-green-600/30",
                    isActive && "bg-crimson text-white shadow-lg shadow-crimson/30 scale-110",
                    isUpcoming && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                
                {/* Label */}
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors whitespace-nowrap",
                      isActive && "text-foreground font-semibold",
                      isCompleted && "text-green-600",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 mt-[-40px]">
                  <div className="h-1 relative">
                    <div className="absolute inset-0 bg-muted rounded-full" />
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full transition-all duration-500",
                        isCompleted ? "bg-green-600 w-full" : "bg-transparent w-0"
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status description */}
      <div className="text-center mt-6">
        <p className="text-muted-foreground text-sm">
          {status === 'sent' && "We've sent your estimate. Please review and approve."}
          {status === 'viewed' && "Thank you for viewing! Waiting for your approval."}
          {status === 'approved' && "Great! Your estimate is approved. Payment options are available below."}
          {status === 'payment_pending' && "Waiting for payment to confirm your booking."}
          {status === 'partially_paid' && "Deposit received! Remaining balance due before the event."}
          {status === 'paid' && "Payment complete! Your event is confirmed."}
          {status === 'confirmed' && "All set! We're looking forward to your event."}
          {status === 'completed' && "Thank you for choosing Soul Train's Eatery!"}
        </p>
      </div>
    </div>
  );
}
