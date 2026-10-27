import type { StaffAssignment } from '@/hooks/useStaffEvents';

export interface StaffIdentity {
  email?: string | null;
  fullName?: string | null;
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const ALIAS_GROUPS: string[][] = [
  ['mike', 'mikey', 'michael'], ['bob', 'rob', 'robbie', 'robert'], ['bill', 'will', 'billy', 'william'],
  ['jim', 'jimmy', 'james'], ['tony', 'anthony'], ['chris', 'christopher', 'christina', 'christine'],
  ['liz', 'beth', 'elizabeth'], ['kate', 'katie', 'kathy', 'katherine', 'catherine'], ['dan', 'danny', 'daniel'],
  ['joe', 'joey', 'joseph'], ['tom', 'tommy', 'thomas'], ['dave', 'david'], ['steve', 'steven', 'stephen'],
  ['matt', 'matthew'], ['nick', 'nicholas'], ['sam', 'samuel', 'samantha'], ['alex', 'alexander', 'alexandra'],
  ['jen', 'jenny', 'jennifer'], ['pat', 'patrick', 'patricia'], ['ron', 'ronald'], ['ken', 'kenny', 'kenneth'],
];
// Mirrors public.staff_name_aliases in the database.
const aliasesFor = (t: string) => ALIAS_GROUPS.find((g) => g.includes(t)) ?? [t];

const tokensOf = (name: string) => name.split(/\s+/).map(normalize).filter((t) => t.length >= 3);

const haystacksOf = (identity: StaffIdentity) =>
  [identity.fullName, identity.email?.split('@')[0]]
    .filter((v): v is string => !!v && v.trim().length > 0)
    .map(normalize);

/** Mirrors public.staff_name_matches: strict = every name part appears; loose = first part may be a nickname. */
export function nameMatches(staffName: string, identity: StaffIdentity, loose = false): boolean {
  const tokens = tokensOf(staffName);
  if (tokens.length === 0) return false;
  return haystacksOf(identity).some((h) =>
    tokens.every((t, i) => (loose && i === 0 ? aliasesFor(t).some((a) => h.includes(a)) : h.includes(t)))
  );
}

/**
 * Assignments only store a staff name, so we match the signed-in user by name.
 * Strict matches win. A nickname / first-name match is accepted only when it is
 * the single loose match on the event, so nobody can claim someone else's shift.
 */
export function findMyAssignment(
  assignments: StaffAssignment[],
  identity: StaffIdentity
): StaffAssignment | null {
  const strict = assignments.find((a) => nameMatches(a.staff_name, identity));
  if (strict) return strict;
  const loose = assignments.filter((a) => nameMatches(a.staff_name, identity, true));
  return loose.length === 1 ? loose[0] : null;
}

/** True when some staff login plausibly matches this assigned name (used to flag typos for admins). */
export function hasMatchingLogin(staffName: string, directory: StaffIdentity[]): boolean {
  return directory.some((d) => nameMatches(staffName, d, true));
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
