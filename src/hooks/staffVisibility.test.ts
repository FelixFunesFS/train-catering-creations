// @ts-ignore
import { describe, it, expect } from 'bun:test';
import { isPrivateNoteCategory, STAFF_VISIBLE_STATUSES } from './useStaffEvents';
import { readFileSync } from 'fs';

describe('staff visibility rules', () => {
  it('hides billing and customer-call notes from staff', () => {
    expect(isPrivateNoteCategory('billing')).toBe(true);
    expect(isPrivateNoteCategory('Call')).toBe(true);
    expect(isPrivateNoteCategory('setup')).toBe(false);
    expect(isPrivateNoteCategory(null)).toBe(false);
  });
  it('calendar feed includes every status the portal shows', () => {
    const feed = readFileSync('supabase/functions/staff-calendar-feed/index.ts', 'utf8');
    for (const s of STAFF_VISIBLE_STATUSES) expect(feed.includes(`'${s}'`)).toBe(true);
  });
});
