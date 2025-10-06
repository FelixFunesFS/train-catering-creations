/**
 * Status Migration Helper
 * Provides compatibility layer during migration from .status to .workflow_status
 * 
 * TEMPORARY FILE - Remove after migration complete
 */

// Helper to safely access workflow_status with fallback
export function getStatus(entity: any): string {
  return entity?.workflow_status || entity?.status || 'unknown';
}

// Status comparisons
export function isStatus(entity: any, targetStatus: string): boolean {
  return getStatus(entity) === targetStatus;
}

export function isStatusIn(entity: any, statuses: string[]): boolean {
  return statuses.includes(getStatus(entity));
}

// Map old status values to workflow_status values
export const STATUS_MAPPING = {
  // Quote statuses
  'pending': 'pending',
  'reviewed': 'under_review',
  'quoted': 'estimated',
  'confirmed': 'confirmed',
  'completed': 'completed',
  'cancelled': 'cancelled',
  
  // Invoice statuses
  'draft': 'draft',
  'approved': 'approved',
  'sent': 'sent',
  'viewed': 'viewed',
  'paid': 'paid',
  'overdue': 'overdue',
  'change_requested': 'pending_review'
} as const;
