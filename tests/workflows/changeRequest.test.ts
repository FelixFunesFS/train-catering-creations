import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChangeRequestProcessor } from '@/services/ChangeRequestProcessor';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    functions: { invoke: vi.fn() },
  },
}));

// Chainable, awaitable query mock: any .select/.eq/.update/... chain resolves to { data, error: null }.
function chain(data: any = null): any {
  const result = { data, error: null };
  const handler: ProxyHandler<any> = {
    get(_t, prop) {
      if (prop === 'then') return (res: any, rej: any) => Promise.resolve(result).then(res, rej);
      return () => new Proxy({}, handler);
    },
  };
  return new Proxy({}, handler);
}

function mockTables(tables: Record<string, any>) {
  (supabase.from as any).mockImplementation((t: string) => chain(tables[t] ?? null));
  (supabase.functions.invoke as any).mockResolvedValue({ data: null, error: null });
}

describe('ChangeRequestProcessor', () => {
  let processor: ChangeRequestProcessor;

  beforeEach(() => {
    processor = new ChangeRequestProcessor();
    vi.clearAllMocks();
  });

  describe('approveChangeRequest', () => {
    it('should apply changes when cost change is under 5% (auto-approve)', async () => {
      const mockChangeRequest = {
        id: 'change-123',
        invoice_id: 'invoice-123',
        customer_email: 'test@example.com',
        requested_changes: { guest_count: 150, menu_changes: { add_items: ['Fried Chicken'] } },
        estimated_cost_change: 200,
      };
      mockTables({
        invoices: { id: 'invoice-123', total_amount: 10000, quote_request_id: 'quote-123', workflow_status: 'sent' },
        quote_requests: { id: 'quote-123', contact_name: 'Test Customer', event_name: 'Test Event', event_date: '2027-06-01', guest_count: 100, service_type: 'full-service', workflow_status: 'estimated', proteins: ['fried-chicken'], sides: ['mac-cheese'], appetizers: [], desserts: [], drinks: [], extras: [], utensils: [], dietary_restrictions: [] },
        estimate_versions: { id: 'ver-1' },
        invoice_line_items: [],
      });

      const result = await processor.approveChangeRequest(mockChangeRequest as any, {
        adminResponse: 'Changes approved automatically',
        finalCostChange: 200,
      });

      expect(result.success).toBe(true);
    });

    it('should require manual approval when cost change exceeds 5%', async () => {
      const mockChangeRequest = {
        id: 'change-456',
        invoice_id: 'invoice-456',
        customer_email: 'test@example.com',
        requested_changes: { guest_count: 200 },
        estimated_cost_change: 600,
      };
      mockTables({
        invoices: { id: 'invoice-456', total_amount: 10000, quote_request_id: 'quote-456', workflow_status: 'sent' },
        quote_requests: { id: 'quote-456', contact_name: 'Test Customer', event_name: 'Test Event', event_date: '2027-06-01', guest_count: 100, service_type: 'full-service', workflow_status: 'estimated', proteins: ['fried-chicken'], sides: ['mac-cheese'], appetizers: [], desserts: [], drinks: [], extras: [], utensils: [], dietary_restrictions: [] },
        estimate_versions: { id: 'ver-1' },
        invoice_line_items: [],
      });

      const result = await processor.approveChangeRequest(mockChangeRequest as any, {
        adminResponse: 'Approved with price adjustment',
        finalCostChange: 600,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('rejectChangeRequest', () => {
    it('should update change request status to rejected', async () => {
      const mockChangeRequest = {
        id: 'change-789',
        invoice_id: 'invoice-789',
        customer_email: 'test@example.com',
        requested_changes: {},
        workflow_status: 'pending',
      };
      mockTables({
        invoices: { id: 'invoice-789', total_amount: 10000, quote_request_id: 'quote-789', workflow_status: 'sent' },
        quote_requests: { id: 'quote-789', contact_name: 'Test Customer', event_name: 'Test Event', event_date: '2027-06-01', guest_count: 100, service_type: 'full-service', workflow_status: 'estimated', proteins: ['fried-chicken'], sides: ['mac-cheese'], appetizers: [], desserts: [], drinks: [], extras: [], utensils: [], dietary_restrictions: [] },
      });

      const result = await processor.rejectChangeRequest(
        mockChangeRequest as any,
        'Sorry, we cannot accommodate these changes'
      );

      expect(result.success).toBe(true);
    });
  });
});
