// @ts-ignore - bun test runner types are not part of the app tsconfig
import { describe, expect, test } from 'bun:test';
import { validateCustomerChangeRequest } from '../../supabase/functions/_shared/customerChangeRequest';

const valid = {
  invoice_id: '00000000-0000-0000-0000-000000000001',
  access_token: '00000000-0000-0000-0000-000000000002',
  request_type: 'modification', requested_changes: { details: 'Please add a side' },
  customer_comments: 'Please add a side',
};
describe('customer change submission boundary', () => {
  test('accepts supported customer changes', () => expect(validateCustomerChangeRequest(valid)).not.toBeNull());
  test('rejects missing or malformed invoice-bound credentials', () => {
    expect(validateCustomerChangeRequest({ ...valid, access_token: undefined })).toBeNull();
    expect(validateCustomerChangeRequest({ ...valid, invoice_id: 'not-an-invoice' })).toBeNull();
  });
  test('rejects client supplied ownership and privileged states', () => {
    for (const field of ['customer_email', 'workflow_status', 'admin_response', 'reviewed_by', 'completed_at']) {
      expect(validateCustomerChangeRequest({ ...valid, [field]: 'forged' })).toBeNull();
    }
  });
  test('rejects invalid types, arrays, priorities and oversized notes', () => {
    expect(validateCustomerChangeRequest({ ...valid, request_type: 'approved' })).toBeNull();
    expect(validateCustomerChangeRequest({ ...valid, priority: 'invalid' })).toBeNull();
    expect(validateCustomerChangeRequest({ ...valid, requested_changes: [] })).toBeNull();
    expect(validateCustomerChangeRequest({ ...valid, customer_comments: 'a'.repeat(5001) })).toBeNull();
    expect(validateCustomerChangeRequest({ ...valid, requested_changes: { note: 'a'.repeat(20001) } })).toBeNull();
  });
});