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
    
    // Normalize status to lowercase for consistent matching
    const normalizedStatus = status?.toLowerCase();
    
    switch (normalizedStatus) {
      // Quote workflow statuses
      case 'pending':
        return {
          label: 'Pending',
          icon: Clock,
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
          description: 'Awaiting review'
        };
      case 'under_review':
      case 'reviewed':
        return {
          label: 'Under Review',
          icon: Eye,
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
          description: 'Quote is being reviewed'
        };
      case 'quoted':
      case 'estimated':
        return {
          label: 'Quoted',
          icon: FileText,
          className: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
          description: 'Quote has been prepared'
        };
      case 'confirmed':
        return {
          label: 'Confirmed',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
          description: 'Event confirmed'
        };
      case 'completed':
        return {
          label: 'Completed',
          icon: CheckCircle,
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
          description: 'Event completed'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: AlertTriangle,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
          description: 'Event cancelled'
        };
        
      // Invoice workflow statuses
      case 'draft':
        return {
          label: 'Draft',
          icon: Edit3,
          className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
          description: 'Invoice draft'
        };
      case 'await_approval':
      case 'pending_approval':
        return {
          label: 'Awaiting Approval',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
          description: 'Pending customer approval'
        };
      case 'approved':
        return {
          label: 'Approved',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
          description: 'Customer approved'
        };
      case 'sent':
        return {
          label: 'Sent',
          icon: Send,
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
          description: 'Sent to customer'
        };
      case 'viewed':
        return {
          label: 'Viewed',
          icon: Eye,
          className: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
          description: 'Customer viewed'
        };
      case 'paid':
      case 'deposit_paid':
        return {
          label: normalizedStatus === 'deposit_paid' ? 'Deposit Paid' : 'Paid',
          icon: DollarSign,
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
          description: 'Payment received'
        };
      case 'overdue':
        return {
          label: 'Overdue',
          icon: AlertTriangle,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
          description: 'Payment overdue'
        };
      default:
        return {
          label: status || 'Unknown',
          icon: Clock,
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
          description: 'Status unknown'
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