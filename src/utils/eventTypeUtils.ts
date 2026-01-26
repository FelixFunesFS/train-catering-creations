/**
 * Military event detection and styling utilities
 */

export const isMilitaryEvent = (eventType: string | null | undefined): boolean => {
  return eventType === 'military_function';
};

export const getMilitaryBadgeStyles = () => ({
  className: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  iconColor: 'text-blue-600'
});
