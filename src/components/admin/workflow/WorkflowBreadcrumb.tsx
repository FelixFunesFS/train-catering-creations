import { ChevronRight } from "lucide-react";

interface WorkflowBreadcrumbProps {
  currentStep: string;
  invoiceStatus: string;
}

export function WorkflowBreadcrumb({ currentStep, invoiceStatus }: WorkflowBreadcrumbProps) {
  const steps = [
    { id: 'draft', label: 'Create Estimate', status: 'completed' },
    { id: 'sent', label: 'Send to Customer', status: invoiceStatus === 'draft' ? 'current' : 'completed' },
    { id: 'approved', label: 'Customer Approval', status: invoiceStatus === 'sent' ? 'current' : invoiceStatus === 'approved' ? 'completed' : 'pending' },
    { id: 'contract', label: 'Generate Contract', status: invoiceStatus === 'approved' ? 'current' : invoiceStatus === 'contract_generated' ? 'completed' : 'pending' },
    { id: 'planning', label: 'Event Planning', status: invoiceStatus === 'contract_generated' ? 'current' : invoiceStatus === 'planning' ? 'completed' : 'pending' }
  ];

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'current':
        return 'text-primary bg-primary/10';
      case 'pending':
        return 'text-muted-foreground bg-muted';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="flex items-center gap-2 mb-6 p-4 bg-muted/30 rounded-lg">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStepColor(step.status)}`}>
            {step.label}
          </div>
          {index < steps.length - 1 && (
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  );
}