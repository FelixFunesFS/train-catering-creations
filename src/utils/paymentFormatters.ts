/**
 * Shared payment formatting utilities for customer portal
 * Single source of truth for milestone labels, currency formatting, and status logic
 */

export interface Milestone {
  id: string;
  milestone_type: string;
  amount_cents: number;
  percentage: number;
  status: string | null;
  due_date: string | null;
  is_due_now: boolean | null;
}

export interface MilestoneStatus {
  isPaid: boolean;
  isDue: boolean;
  isUpcoming: boolean;
}

/**
 * Format cents to USD currency string
 */
export const formatPaymentCurrency = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

/**
 * Get human-readable milestone type label
 */
export const getMilestoneLabel = (type: string): string => {
  const labels: Record<string, string> = {
    deposit: 'Booking Deposit',
    combined: 'Booking Deposit',
    milestone: 'Milestone Payment',
    balance: 'Final Balance',
    full: 'Full Payment',
    final: 'Full Payment (Net 30)',
  };
  return labels[type] || type.replace('_', ' ');
};

/**
 * Determine milestone payment status
 */
export const getMilestoneStatus = (milestone: Milestone): MilestoneStatus => {
  const isPaid = milestone.status === 'paid';
  const isDue = !isPaid && (
    milestone.is_due_now || 
    (milestone.due_date && new Date(milestone.due_date) <= new Date())
  );
  return { 
    isPaid, 
    isDue, 
    isUpcoming: !isPaid && !isDue 
  };
};

/**
 * Calculate payment progress from milestones
 */
export const calculatePaymentProgress = (milestones: Milestone[]): {
  amountPaid: number;
  totalAmount: number;
  remaining: number;
  percentComplete: number;
} => {
  const amountPaid = milestones
    .filter(m => m.status === 'paid')
    .reduce((sum, m) => sum + m.amount_cents, 0);
  
  const totalAmount = milestones.reduce((sum, m) => sum + m.amount_cents, 0);
  const remaining = totalAmount - amountPaid;
  const percentComplete = totalAmount > 0 ? Math.round((amountPaid / totalAmount) * 100) : 0;
  
  return { amountPaid, totalAmount, remaining, percentComplete };
};

/**
 * Find the next milestone that is due or upcoming
 */
export const getNextDueMilestone = (milestones: Milestone[]): Milestone | null => {
  // First look for a milestone that is currently due
  const dueMilestone = milestones.find(m => {
    const { isDue } = getMilestoneStatus(m);
    return isDue;
  });
  
  if (dueMilestone) return dueMilestone;
  
  // Otherwise find the next upcoming one
  return milestones.find(m => m.status !== 'paid') || null;
};
