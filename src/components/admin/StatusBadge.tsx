import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  Send, 
  Eye, 
  CheckCircle, 
  DollarSign, 
  AlertTriangle, 
  Clock,
  FileText 
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  isDraft?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function StatusBadge({ status, isDraft = false, showIcon = true, size = 'default' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    if (isDraft) {
      return {
        label: 'Draft',
        icon: Edit3,
        className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
        description: 'Estimate is being prepared'
      };
    }
    
    switch (status) {
      case 'sent':
        return {
          label: 'Sent',
          icon: Send,
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
          description: 'Estimate sent to customer'
        };
      case 'viewed':
        return {
          label: 'Viewed',
          icon: Eye,
          className: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
          description: 'Customer has viewed the estimate'
        };
      case 'approved':
        return {
          label: 'Approved',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
          description: 'Customer approved the estimate'
        };
      case 'paid':
      case 'deposit_paid':
        return {
          label: status === 'deposit_paid' ? 'Deposit Paid' : 'Paid',
          icon: DollarSign,
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
          description: 'Payment received'
        };
      case 'overdue':
        return {
          label: 'Overdue',
          icon: AlertTriangle,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
          description: 'Payment is overdue'
        };
      case 'confirmed':
        return {
          label: 'Event Confirmed',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
          description: 'Event is confirmed and scheduled'
        };
      default:
        return {
          label: 'Pending',
          icon: Clock,
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
          description: 'Awaiting action'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${sizeClasses[size]} font-medium transition-colors`}
      title={config.description}
    >
      {showIcon && <Icon className={`${iconSizes[size]} mr-1.5`} />}
      {config.label}
    </Badge>
  );
}