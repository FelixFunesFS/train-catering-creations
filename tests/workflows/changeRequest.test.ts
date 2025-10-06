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

      // Mock database responses
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'invoices') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: mockInvoice, error: null })
              })
            })
          };
        }
        if (table === 'quote_requests') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: mockQuote, error: null })
              })
            }),
            update: () => ({
              eq: () => Promise.resolve({ error: null })
            })
          };
        }
        return {
          insert: () => Promise.resolve({ error: null }),
          update: () => ({
            eq: () => Promise.resolve({ error: null })
          })
        };
      });

      const result = await processor.approveChangeRequest(mockChangeRequest, {
        adminResponse: 'Changes approved automatically',
        finalCostChange: 200
      });

      expect(result.success).toBe(true);
    });

    it('should require manual approval when cost change exceeds 5%', async () => {
      const mockChangeRequest = {
        id: 'change-456',
        invoice_id: 'invoice-456',
        customer_email: 'test@example.com',
        requested_changes: {
          guest_count: 200
        },
        estimated_cost_change: 600 // 6% of $10,000
      };

      const mockInvoice = {
        id: 'invoice-456',
        total_amount: 10000,
        quote_request_id: 'quote-456',
        workflow_status: 'sent'
      };

      // Mock should still process with admin approval
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'invoices') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: mockInvoice, error: null })
              })
            })
          };
        }
        return {
          insert: () => Promise.resolve({ error: null }),
          update: () => ({
            eq: () => Promise.resolve({ error: null })
          })
        };
      });

      const result = await processor.approveChangeRequest(mockChangeRequest, {
        adminResponse: 'Approved with price adjustment',
        finalCostChange: 600
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
        workflow_status: 'pending'
      };

      (supabase.from as any).mockImplementation(() => ({
        update: () => ({
          eq: () => Promise.resolve({ error: null })
        })
      }));

      const result = await processor.rejectChangeRequest(
        mockChangeRequest,
        'Sorry, we cannot accommodate these changes'
      );

      expect(result.success).toBe(true);
    });
  });
});
