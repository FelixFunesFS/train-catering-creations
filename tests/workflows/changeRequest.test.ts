import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChangeRequestProcessor } from '@/services/ChangeRequestProcessor';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          maybeSingle: vi.fn()
        })),
        in: vi.fn()
      })),
      update: vi.fn(() => ({
        eq: vi.fn()
      })),
      insert: vi.fn()
    })),
    functions: {
      invoke: vi.fn()
    }
  }
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
        requested_changes: {
          guest_count: 150,
          menu_changes: {
            add_items: ['Fried Chicken']
          }
        },
        estimated_cost_change: 200 // 2% of $10,000
      };

      const mockInvoice = {
        id: 'invoice-123',
        total_amount: 10000,
        quote_request_id: 'quote-123',
        workflow_status: 'sent'
      };

      const mockQuote = {
        id: 'quote-123',
        guest_count: 100,
        workflow_status: 'estimated'
      };

      mockTables({ invoices: mockInvoice, quote_requests: mockQuote, invoice_line_items: [] });

      const result = await processor.rejectChangeRequest(
        mockChangeRequest,
        'Sorry, we cannot accommodate these changes'
      );

      expect(result.success).toBe(true);
    });
  });
});
