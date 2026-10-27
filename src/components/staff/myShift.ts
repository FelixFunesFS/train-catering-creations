import type { StaffAssignment } from '@/hooks/useStaffEvents';

export interface StaffIdentity {
  email?: string | null;
  fullName?: string | null;
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Assignments only store a staff name, so we match the signed-in user by name.
 * Every word (3+ letters) in the assigned name must appear in the user's
 * full name or email username. Returns null when nothing matches confidently.
 */
export function findMyAssignment(
  assignments: StaffAssignment[],
  identity: StaffIdentity
): StaffAssignment | null {
  const haystacks = [identity.fullName, identity.email?.split('@')[0]]
    .filter((v): v is string => !!v && v.trim().length > 0)
    .map(normalize);
  if (haystacks.length === 0) return null;

  for (const a of assignments) {
    const tokens = a.staff_name
      .split(/\s+/)
      .map(normalize)
      .filter((t) => t.length >= 3);
    if (tokens.length === 0) continue;
    if (haystacks.some((h) => tokens.every((t) => h.includes(t)))) return a;
  }
  return null;
}

export function isAppleDevice(ua: string = typeof navigator !== 'undefined' ? navigator.userAgent : ''): boolean {
  return /iPhone|iPad|iPod|Macintosh/.test(ua) && !/Android/.test(ua);
}

/** Turn-by-turn directions link: Apple Maps on Apple devices, Google Maps elsewhere. */
export function getDirectionsUrl(location: string, ua?: string): string {
  const q = encodeURIComponent(location);
  return isAppleDevice(ua)
    ? `https://maps.apple.com/?daddr=${q}`
    : `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}
