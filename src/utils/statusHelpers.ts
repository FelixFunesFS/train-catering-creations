/**
 * Status helper utilities for deriving estimate and payment status
 * from invoice workflow status and payment milestones.
 */

export interface EstimateStatusInfo {
  label: string;
  color: string;
  icon: string;
}

export interface PaymentStatusInfo {
  label: string;
  color: string;
  icon: string;
  showBadge: boolean;
}

/**
 * Derive estimate status from invoice workflow status
 * This represents the document lifecycle: Draft → Sent → Viewed → Approved
 */
export function getEstimateStatus(workflowStatus: string): EstimateStatusInfo {
  const statusMap: Record<string, EstimateStatusInfo> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'FileEdit' },
    pending_review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: 'Clock' },
    sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'Send' },
    viewed: { label: 'Viewed', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: 'Eye' },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: 'CheckCircle' },
    payment_pending: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: 'CheckCircle' },
    partially_paid: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: 'CheckCircle' },
    paid: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: 'CheckCircle' },
    overdue: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: 'CheckCircle' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: 'XCircle' },
  };
  return statusMap[workflowStatus] || statusMap.draft;
}

/**
 * Derive payment status from workflow status AND next due milestone type.
 * Only returns a status for approved+ states (when payment tracking is relevant).
 * 
 * Milestone types map to context-aware labels:
 * - DEPOSIT: "Deposit Due" (45+ days, 10% to secure date)
 * - COMBINED: "Booking Payment Due" (15-44 days, 60%)
 * - FULL: "Full Payment Due" (≤14 days rush, 100%)
 * - MILESTONE: "Milestone Due" (50% at 30 days before)
 * - BALANCE: "Balance Due" (final 40%)
 * - FINAL: "Net 30 Pending" (government contracts)
 */
export function getPaymentStatus(
  workflowStatus: string, 
  nextMilestoneType?: string | null
): PaymentStatusInfo | null {
  // Only show payment status for approved+ states
  const paymentStates = ['approved', 'payment_pending', 'partially_paid', 'paid', 'overdue'];
  if (!paymentStates.includes(workflowStatus)) return null;

  // Paid in full - no milestone needed
  if (workflowStatus === 'paid') {
    return { 
      label: 'Paid in Full', 
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
      icon: 'CheckCircle2',
      showBadge: true 
    };
  }

  // Overdue
  if (workflowStatus === 'overdue') {
    return { 
      label: 'Overdue', 
      color: 'bg-red-100 text-red-700 border-red-200', 
      icon: 'AlertTriangle',
      showBadge: true 
    };
  }

  // Context-aware labels based on milestone type
  const milestoneLabels: Record<string, PaymentStatusInfo> = {
    deposit: { 
      label: 'Deposit Due', 
      color: 'bg-amber-100 text-amber-700 border-amber-200', 
      icon: 'Lock',
      showBadge: true 
    },
    combined: { 
      label: 'Booking Payment Due', 
      color: 'bg-amber-100 text-amber-700 border-amber-200', 
      icon: 'CreditCard',
      showBadge: true 
    },
    full: { 
      label: 'Full Payment Due', 
      color: 'bg-orange-100 text-orange-700 border-orange-200', 
      icon: 'AlertCircle',
      showBadge: true 
    },
    milestone: { 
      label: 'Milestone Due', 
      color: 'bg-blue-100 text-blue-700 border-blue-200', 
      icon: 'Clock',
      showBadge: true 
    },
    balance: { 
      label: 'Balance Due', 
      color: 'bg-purple-100 text-purple-700 border-purple-200', 
      icon: 'Wallet',
      showBadge: true 
    },
    final: { 
      label: 'Net 30 Pending', 
      color: 'bg-slate-100 text-slate-700 border-slate-200', 
      icon: 'FileText',
      showBadge: true 
    },
  };

  // Use milestone type if provided, otherwise generic "Payment Due"
  if (nextMilestoneType && milestoneLabels[nextMilestoneType.toLowerCase()]) {
    return milestoneLabels[nextMilestoneType.toLowerCase()];
  }

  // Fallback for partially_paid without specific milestone info
  if (workflowStatus === 'partially_paid') {
    return { 
      label: 'Partial', 
      color: 'bg-teal-100 text-teal-700 border-teal-200', 
      icon: 'CircleDot',
      showBadge: true 
    };
  }

  // Generic payment due
  return { 
    label: 'Payment Due', 
    color: 'bg-amber-100 text-amber-700 border-amber-200', 
    icon: 'CreditCard',
    showBadge: true 
  };
}

/**
 * Helper to get next unpaid milestone from a list.
 * Returns the first non-paid milestone ordered by due_date.
 */
export function getNextUnpaidMilestone(milestones: Array<{ 
  milestone_type: string; 
  status: string | null;
  due_date: string | null;
}>): { milestone_type: string; due_date: string | null } | null {
  if (!milestones || milestones.length === 0) return null;
  
  // Find first non-paid milestone, ordered by due_date
  const unpaid = milestones
    .filter(m => m.status !== 'paid')
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  
  return unpaid[0] || null;
}
