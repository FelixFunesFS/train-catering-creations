export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount / 100);
};

export const getRelativeTime = (date: string): string => {
  const now = new Date();
  const target = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - target.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return target.toLocaleDateString();
};

export const getChangeRequestPriorityWeight = (priority: string): number => {
  switch (priority) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
};

export const sortChangeRequestsByPriority = (requests: any[]): any[] => {
  return requests.sort((a, b) => {
    const priorityDiff = getChangeRequestPriorityWeight(b.priority) - getChangeRequestPriorityWeight(a.priority);
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same priority, sort by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};