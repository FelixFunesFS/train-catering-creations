import { describe, it, expect } from 'bun:test';
import { findMyAssignment, getDirectionsUrl } from './myShift';

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

describe('getDirectionsUrl', () => {
  it('uses Apple Maps on iPhone', () => {
    expect(getDirectionsUrl('1 King St', 'iPhone')).toBe('https://maps.apple.com/?daddr=1%20King%20St');
  });
  it('uses Google Maps on Android', () => {
    expect(getDirectionsUrl('1 King St', 'Android Chrome')).toContain('google.com/maps/dir');
  });
});
