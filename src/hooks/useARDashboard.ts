import { useQuery } from '@tanstack/react-query';
import { PaymentDataService, ARAgingBucket } from '@/services/PaymentDataService';

export interface ARDashboardData {
  agingBuckets: ARAgingBucket[];
  stats: {
    totalOutstanding: number;
    totalOverdue: number;
    pendingCount: number;
    overdueCount: number;
  };
}

/**
 * Hook for fetching AR aging buckets
 */
export function useARAgingBuckets() {
  return useQuery({
    queryKey: ['ar-dashboard', 'aging'],
    queryFn: () => PaymentDataService.getARAgingBuckets(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Combined hook for AR Dashboard with aging buckets and stats
 */
export function useARDashboard() {
  const agingQuery = useQuery({
    queryKey: ['ar-dashboard', 'aging'],
    queryFn: () => PaymentDataService.getARAgingBuckets(),
    staleTime: 1000 * 60 * 2,
  });

  const statsQuery = useQuery({
    queryKey: ['ar-dashboard', 'stats'],
    queryFn: () => PaymentDataService.getPaymentStats(),
    staleTime: 1000 * 60 * 2,
  });

  return {
    agingBuckets: agingQuery.data || [],
    stats: statsQuery.data || {
      totalOutstanding: 0,
      totalOverdue: 0,
      pendingCount: 0,
      overdueCount: 0,
    },
    isLoading: agingQuery.isLoading || statsQuery.isLoading,
    isError: agingQuery.isError || statsQuery.isError,
    error: agingQuery.error || statsQuery.error,
    refetch: () => {
      agingQuery.refetch();
      statsQuery.refetch();
    }
  };
}

/**
 * Format currency helper
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}
