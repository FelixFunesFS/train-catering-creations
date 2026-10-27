// @ts-ignore - bun test runner types are not part of the app tsconfig
import { describe, it, expect } from 'bun:test';
import { findMyAssignment, getDirectionsUrl, hasMatchingLogin } from './myShift';

const a = (staff_name: string) => ({ id: staff_name, staff_name, role: 'Server', arrival_time: '13:30', confirmed: true, notes: null });

describe('findMyAssignment', () => {
  it('matches a staff name against the email username', () => {
    expect(findMyAssignment([a('Bob Lee'), a('Tanya Ward')], { email: 'tanyaward35@gmail.com' })?.staff_name).toBe('Tanya Ward');
  });
  it('does not match when only one name part matches', () => {
    expect(findMyAssignment([a('Tanya Smith')], { email: 'tanyaward35@gmail.com' })).toBeNull();
  });
  it('matches on full name when provided', () => {
    expect(findMyAssignment([a('Margery Funes')], { email: 'x@y.com', fullName: 'Margery Funes' })?.staff_name).toBe('Margery Funes');
  });
});

describe('nickname and first-name matching', () => {
  it('matches Mike Jones to michaeljones', () => {
    expect(findMyAssignment([a('Mike Jones')], { email: 'michaeljones@gmail.com' })?.staff_name).toBe('Mike Jones');
  });
  it('matches a first-name-only assignment when it is the only match', () => {
    expect(findMyAssignment([a('Tanya'), a('Bob Lee')], { email: 'tanyaward35@gmail.com' })?.staff_name).toBe('Tanya');
  });
  it('refuses a nickname match when two people on the event match', () => {
    expect(findMyAssignment([a('Mike'), a('Michael')], { email: 'michaelb@gmail.com' })?.staff_name).toBe('Michael');
    expect(findMyAssignment([a('Mike'), a('Mikey')], { email: 'michaelb@gmail.com' })).toBeNull();
  });
  it('flags names with no matching staff login', () => {
    const dir = [{ email: 'tanyaward35@gmail.com' }];
    expect(hasMatchingLogin('Tanya Ward', dir)).toBe(true);
    expect(hasMatchingLogin('Jamal Price', dir)).toBe(false);
  });
});

describe('getDirectionsUrl', () => {
  it('uses Apple Maps on iPhone', () => {
    expect(getDirectionsUrl('1 King St', 'iPhone')).toBe('https://maps.apple.com/?daddr=1%20King%20St');
  });
  it('uses Google Maps on Android', () => {
    expect(getDirectionsUrl('1 King St', 'Android Chrome')).toContain('google.com/maps/dir');
  });
});
