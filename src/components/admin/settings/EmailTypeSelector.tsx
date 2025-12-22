import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Send, 
  CheckCircle, 
  CreditCard, 
  Bell, 
  Calendar,
  Edit,
  Heart,
  Clock
} from "lucide-react";

export type EmailType = 
  | 'quote_received' 
  | 'quote_confirmation'
  | 'estimate_ready' 
  | 'estimate_reminder'
  | 'approval_confirmation'
  | 'payment_received' 
  | 'payment_reminder'
  | 'event_reminder'
  | 'change_request_submitted'
  | 'change_request_response'
  | 'admin_notification'
  | 'event_followup';

interface EmailTypeInfo {
  id: EmailType;
  label: string;
  description: string;
  icon: React.ReactNode;
  hasCustomer: boolean;
  hasAdmin: boolean;
}

interface EmailStage {
  id: string;
  label: string;
  color: string;
  emails: EmailTypeInfo[];
}

const EMAIL_STAGES: EmailStage[] = [
  {
    id: 'inquiry',
    label: 'Inquiry',
    color: 'bg-blue-500',
    emails: [
      { 
        id: 'quote_received', 
        label: 'Quote Received', 
        description: 'Admin notification of new quote',
        icon: <FileText className="h-4 w-4" />,
        hasCustomer: false,
        hasAdmin: true
      },
      { 
        id: 'quote_confirmation', 
        label: 'Quote Confirmation', 
        description: 'Customer confirmation of submission',
        icon: <CheckCircle className="h-4 w-4" />,
        hasCustomer: true,
        hasAdmin: false
      },
    ]
  },
  {
    id: 'estimate',
    label: 'Estimate',
    color: 'bg-amber-500',
    emails: [
      { 
        id: 'estimate_ready', 
        label: 'Estimate Ready', 
        description: 'Notify customer estimate is ready',
        icon: <Send className="h-4 w-4" />,
        hasCustomer: true,
        hasAdmin: false
      },
      { 
        id: 'estimate_reminder', 
        label: 'Estimate Reminder', 
        description: 'Remind customer to review estimate',
        icon: <Clock className="h-4 w-4" />,
        hasCustomer: true,
        hasAdmin: false
      },
    ]
  },
  {
    id: 'approval',
    label: 'Approval',
    color: 'bg-green-500',
    emails: [
      { 
        id: 'approval_confirmation', 
        label: 'Approval Confirmation', 
        description: 'Confirm estimate approval',
        icon: <CheckCircle className="h-4 w-4" />,
        hasCustomer: true,
        hasAdmin: true
      },
      { 
        id: 'change_request_submitted', 
        label: 'Change Request Submitted', 
        description: 'Acknowledge change request',
        icon: <Edit className="h-4 w-4" />,
        hasCustomer: true,
        hasAdmin: true
      },
      { 
        id: 'change_request_response', 
        label: 'Change Request Response', 
        description: 'Response to change request',
        icon: <Edit className="h-4 w-4" />,
        hasCustomer: true,
        hasAdmin: false
      },
    ]
  },
  {
    id: 'payment',
    label: 'Payment',
    color: 'bg-purple-500',
    emails: [
      { 
        id: 'payment_received', 
        label: 'Payment Received', 
        description: 'Confirm payment was processed',
        icon: <CreditCard className="h-4 w-4" />,
        hasCustomer: true,
        hasAdmin: true
      },
      { 
        id: 'payment_reminder', 
        label: 'Payment Reminder', 
        description: 'Remind about upcoming payment',
        icon: <Bell className="h-4 w-4" />,
        hasCustomer: true,
        hasAdmin: false
      },
    ]
  },
  {
    id: 'event',
    label: 'Event',
    color: 'bg-rose-500',
    emails: [
      { 
        id: 'event_reminder', 
        label: 'Event Reminder', 
        description: 'Remind about upcoming event',
        icon: <Calendar className="h-4 w-4" />,
        hasCustomer: true,
        hasAdmin: true
      },
      { 
        id: 'event_followup', 
        label: 'Event Follow-up', 
        description: 'Thank you after event',
        icon: <Heart className="h-4 w-4" />,
        hasCustomer: true,
        hasAdmin: false
      },
    ]
  },
  {
    id: 'admin',
    label: 'Admin',
    color: 'bg-slate-500',
    emails: [
      { 
        id: 'admin_notification', 
        label: 'Admin Notification', 
        description: 'General admin alerts',
        icon: <Bell className="h-4 w-4" />,
        hasCustomer: false,
        hasAdmin: true
      },
    ]
  },
];

interface EmailTypeSelectorProps {
  selectedType: EmailType;
  selectedVariant: 'customer' | 'admin';
  onSelectType: (type: EmailType) => void;
  onSelectVariant: (variant: 'customer' | 'admin') => void;
}

export function EmailTypeSelector({ 
  selectedType, 
  selectedVariant,
  onSelectType,
  onSelectVariant 
}: EmailTypeSelectorProps) {
  const selectedEmailInfo = EMAIL_STAGES
    .flatMap(s => s.emails)
    .find(e => e.id === selectedType);

  return (
    <div className="space-y-4">
      {EMAIL_STAGES.map((stage) => (
        <div key={stage.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", stage.color)} />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {stage.label}
            </span>
          </div>
          <div className="space-y-1 pl-4">
            {stage.emails.map((email) => {
              const isSelected = selectedType === email.id;
              return (
                <button
                  key={email.id}
                  onClick={() => {
                    onSelectType(email.id);
                    // Auto-select first available variant
                    if (email.hasCustomer && !email.hasAdmin) {
                      onSelectVariant('customer');
                    } else if (email.hasAdmin && !email.hasCustomer) {
                      onSelectVariant('admin');
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                    isSelected 
                      ? "bg-primary/10 border border-primary/30" 
                      : "hover:bg-muted/50 border border-transparent"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-md",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {email.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-medium truncate",
                        isSelected && "text-primary"
                      )}>
                        {email.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {email.description}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {email.hasCustomer && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">C</Badge>
                    )}
                    {email.hasAdmin && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">A</Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Variant selector for current email */}
      {selectedEmailInfo && (selectedEmailInfo.hasCustomer && selectedEmailInfo.hasAdmin) && (
        <div className="border-t pt-4 mt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            View As
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onSelectVariant('customer')}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                selectedVariant === 'customer'
                  ? "bg-blue-500 text-white"
                  : "bg-muted hover:bg-muted/70"
              )}
            >
              Customer
            </button>
            <button
              onClick={() => onSelectVariant('admin')}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                selectedVariant === 'admin'
                  ? "bg-amber-500 text-white"
                  : "bg-muted hover:bg-muted/70"
              )}
            >
              Admin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { EMAIL_STAGES };