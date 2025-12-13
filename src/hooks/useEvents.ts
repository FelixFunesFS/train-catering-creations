import { useQuery } from '@tanstack/react-query';
import { EventDataService, EventSummary, EventFilters } from '@/services/EventDataService';

/**
 * Hook for fetching events with optional filters
 */
export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => EventDataService.getEvents(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for fetching a single event by quote ID
 */
export function useEvent(quoteId: string | null) {
  return useQuery({
    queryKey: ['event', quoteId],
    queryFn: () => quoteId ? EventDataService.getEventById(quoteId) : null,
    enabled: !!quoteId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook for fetching at-risk events
 */
export function useAtRiskEvents() {
  return useQuery({
    queryKey: ['events', 'at-risk'],
    queryFn: () => EventDataService.getAtRiskEvents(),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook for fetching upcoming events
 */
export function useUpcomingEvents(days: number = 7) {
  return useQuery({
    queryKey: ['events', 'upcoming', days],
    queryFn: () => EventDataService.getUpcomingEvents(days),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook for fetching events for a specific month (calendar view)
 */
export function useEventsForMonth(year: number, month: number) {
  return useQuery({
    queryKey: ['events', 'month', year, month],
    queryFn: () => EventDataService.getEventsForMonth(year, month),
    staleTime: 1000 * 60 * 5, // 5 minutes for calendar
  });
}

/**
 * Hook for fetching dashboard KPIs
 */
export function useDashboardKPIs() {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => EventDataService.getDashboardKPIs(),
    staleTime: 1000 * 60 * 1, // 1 minute for KPIs
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
  });
}
