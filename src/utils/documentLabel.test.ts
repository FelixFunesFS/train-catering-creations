import { describe, it, expect } from 'vitest';
import { getDocumentKind } from './documentLabel';

describe('getDocumentKind', () => {
  it('sent estimate is a quote', () => expect(getDocumentKind('sent')).toBe('quote'));
  it('viewed estimate is a quote', () => expect(getDocumentKind('viewed')).toBe('quote'));
  it('approved becomes an invoice', () => expect(getDocumentKind('approved')).toBe('invoice'));
  it('partially paid is an invoice', () => expect(getDocumentKind('partially_paid')).toBe('invoice'));
  it('overdue is an invoice', () => expect(getDocumentKind('overdue')).toBe('invoice'));
  it('paid is a receipt', () => expect(getDocumentKind('paid')).toBe('receipt'));
});
