import { describe, it, expect } from 'vitest';
import { getProposalStatus } from '@/utils/proposalStatus';

const now = new Date('2026-10-10T12:00:00Z');

describe('proposal status (7-day validity)', () => {
  it('approved invoices are not proposals', () => {
    expect(getProposalStatus({ workflow_status: 'approved', sent_at: '2026-09-01T00:00:00Z' }, now)).toBeNull();
  });
  it('sent within 7 days awaits approval', () => {
    expect(getProposalStatus({ workflow_status: 'sent', sent_at: '2026-10-05T12:00:00Z' }, now)?.state).toBe('awaiting');
  });
  it('over 7 days with no logged contact needs follow-up', () => {
    expect(getProposalStatus({ workflow_status: 'sent', sent_at: '2026-10-01T12:00:00Z' }, now)?.state).toBe('needs_follow_up');
  });
  it('over 7 days with contact logged after sending stays in discussion', () => {
    expect(getProposalStatus({ workflow_status: 'viewed', sent_at: '2026-10-01T12:00:00Z', last_customer_interaction: '2026-10-06T12:00:00Z' }, now)?.state).toBe('in_discussion');
  });
  it('contact logged before sending does not count', () => {
    expect(getProposalStatus({ workflow_status: 'sent', sent_at: '2026-10-01T12:00:00Z', last_customer_interaction: '2026-09-20T12:00:00Z' }, now)?.state).toBe('needs_follow_up');
  });
});
