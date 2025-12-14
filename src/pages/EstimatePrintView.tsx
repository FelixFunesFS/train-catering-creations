import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { formatDate, formatTime, formatServiceType } from '@/utils/formatters';
import { DEFAULT_TERMS } from '@/hooks/useCateringAgreement';

interface LineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
}

interface EstimateData {
  id: string;
  invoice_number: string;
  workflow_status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  due_date: string;
  sent_at: string | null;
  created_at: string;
  notes: string;
  discount_amount: number | null;
  discount_type: string | null;
  discount_description: string | null;
  customers: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  quote_requests: {
    id: string;
    event_name: string;
    event_date: string;
    start_time: string;
    location: string;
    service_type: string;
    guest_count: number;
    special_requests: string;
    contact_name: string;
    email: string;
    phone: string;
    event_type: string;
    compliance_level: string;
    guest_count_with_restrictions: string;
    vegetarian_entrees: unknown;
    proteins: unknown;
    sides: unknown;
    appetizers: unknown;
    desserts: unknown;
    drinks: unknown;
    both_proteins_available: boolean;
  };
}

interface PaymentMilestone {
  id: string;
  milestone_type: string;
  percentage: number;
  amount_cents: number;
  due_date: string;
  status: string;
}

// Cast data safely
const safeVegetarianEntrees = (entrees: unknown): string[] => {
  if (Array.isArray(entrees)) return entrees as string[];
  return [];
};

export default function EstimatePrintView() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoiceId) {
      fetchEstimate();
    }
  }, [invoiceId]);

  const fetchEstimate = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!customer_id (id, name, email, phone, address),
          quote_requests!quote_request_id (
            id, event_name, event_date, start_time, location, service_type,
            guest_count, special_requests, contact_name, email, phone,
            event_type, compliance_level, guest_count_with_restrictions, vegetarian_entrees,
            proteins, sides, appetizers, desserts, drinks, both_proteins_available
          )
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Estimate not found');

      const { data: lineItemsData } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('sort_order', { ascending: true });

      const { data: milestonesData } = await supabase
        .from('payment_milestones')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('due_date', { ascending: true });

      setEstimate(data);
      setLineItems(lineItemsData || []);
      setMilestones(milestonesData || []);
    } catch (error) {
      console.error('Error fetching estimate:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center print:hidden">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading estimate...</span>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center print:hidden">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Estimate Not Found</h3>
          <p className="text-gray-500">The estimate you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const quote = estimate.quote_requests;
  const isGovernment = quote?.compliance_level === 'government';
  const terms = DEFAULT_TERMS;
  const discountAmount = estimate.discount_amount || 0;

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          @page { 
            size: letter; 
            margin: 0.5in; 
          }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
        }
      `}</style>

      <div className="bg-white min-h-screen">
        {/* Print Button - Hidden in print */}
        <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => window.print()}
            className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
          >
            Print / Download PDF
          </button>
          <button
            onClick={() => window.close()}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>

        {/* === PAGE 1: ESTIMATE === */}
        <div className="max-w-[8.5in] mx-auto p-8 print:p-0">
          {/* Header */}
          <header className="flex justify-between items-start mb-8 pb-6 border-b-4 border-[#DC143C]">
            <div>
              <h1 className="text-3xl font-bold text-[#DC143C]">Soul Train's Eatery</h1>
              <p className="text-gray-600 mt-1">Authentic Southern Catering</p>
              <p className="text-sm text-gray-500 mt-2">Charleston's Lowcountry • (843) 970-0265</p>
              <p className="text-sm text-gray-500">soultrainseatery@gmail.com</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800">ESTIMATE</h2>
              <p className="text-lg text-gray-600 mt-1">#{estimate.invoice_number || 'DRAFT'}</p>
              <p className="text-sm text-gray-500 mt-2">Date: {formatDate(estimate.created_at)}</p>
              {estimate.due_date && (
                <p className="text-sm text-gray-500">Due: {formatDate(estimate.due_date)}</p>
              )}
            </div>
          </header>

          {/* Customer & Event Info */}
          <div className="grid grid-cols-2 gap-8 mb-8 avoid-break">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Prepared For</h3>
              <p className="font-medium text-gray-900">{quote?.contact_name}</p>
              <p className="text-gray-600">{quote?.email}</p>
              <p className="text-gray-600">{quote?.phone}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Event Details</h3>
              <p className="font-medium text-gray-900">{quote?.event_name}</p>
              <p className="text-gray-600">
                {formatDate(quote?.event_date)} {quote?.start_time && `at ${formatTime(quote.start_time)}`}
              </p>
              <p className="text-gray-600">{quote?.location}</p>
              <p className="text-gray-600">
                {quote?.guest_count} guests • {formatServiceType(quote?.service_type)}
              </p>
              {quote?.event_type && (
                <p className="text-gray-600 capitalize">{quote.event_type.replace('_', ' ')}</p>
              )}
            </div>
          </div>

          {/* Government Badge */}
          {isGovernment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-700 font-medium text-sm">🏛️ Government Contract • Tax Exempt • Net 30 Payment Terms</p>
            </div>
          )}

          {/* Line Items Table */}
          <table className="w-full mb-6 avoid-break">
            <thead>
              <tr className="bg-[#DC143C] text-white">
                <th className="text-left p-3 font-semibold">Description</th>
                <th className="text-center p-3 font-semibold w-20">Qty</th>
                <th className="text-right p-3 font-semibold w-28">Unit Price</th>
                <th className="text-right p-3 font-semibold w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 border-b border-gray-200">
                    <p className="font-medium text-gray-900">{item.title || 'Line Item'}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    )}
                  </td>
                  <td className="p-3 text-center border-b border-gray-200">{item.quantity}</td>
                  <td className="p-3 text-right border-b border-gray-200">${(item.unit_price / 100).toFixed(2)}</td>
                  <td className="p-3 text-right border-b border-gray-200 font-medium">${(item.total_price / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72 avoid-break">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${(estimate.subtotal / 100).toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200 text-green-600">
                  <span>Discount {estimate.discount_description && `(${estimate.discount_description})`}</span>
                  <span>-${(discountAmount / 100).toFixed(2)}</span>
                </div>
              )}
              {!isGovernment && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Hospitality Tax (2%)</span>
                    <span className="font-medium">${((estimate.tax_amount || 0) * 2/9 / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Service Tax (7%)</span>
                    <span className="font-medium">${((estimate.tax_amount || 0) * 7/9 / 100).toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-3 bg-[#DC143C] text-white px-3 rounded-lg mt-2">
                <span className="font-bold text-lg">TOTAL</span>
                <span className="font-bold text-lg">${(estimate.total_amount / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          {estimate.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 avoid-break">
              <h3 className="font-semibold text-amber-800 mb-2 text-sm">📝 Notes</h3>
              <p className="text-amber-700 text-sm">{estimate.notes}</p>
            </div>
          )}

          {/* Special Requests */}
          {quote?.special_requests && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 avoid-break">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">Special Requests</h3>
              <p className="text-gray-600 text-sm italic">{quote.special_requests}</p>
            </div>
          )}
        </div>

        {/* === PAGE 2: PAYMENT SCHEDULE (if milestones exist) === */}
        {milestones.length > 0 && (
          <div className="max-w-[8.5in] mx-auto p-8 print:p-0 page-break">
            <h2 className="text-2xl font-bold text-[#DC143C] mb-6 pb-4 border-b-2 border-[#DC143C]">
              Payment Schedule
            </h2>

            <table className="w-full mb-8">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 font-semibold">Payment</th>
                  <th className="text-center p-3 font-semibold">Percentage</th>
                  <th className="text-right p-3 font-semibold">Amount</th>
                  <th className="text-right p-3 font-semibold">Due Date</th>
                  <th className="text-center p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((milestone, idx) => (
                  <tr key={milestone.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 border-b border-gray-200 capitalize">
                      {milestone.milestone_type.replace('_', ' ')}
                    </td>
                    <td className="p-3 text-center border-b border-gray-200">{milestone.percentage}%</td>
                    <td className="p-3 text-right border-b border-gray-200 font-medium">
                      ${(milestone.amount_cents / 100).toFixed(2)}
                    </td>
                    <td className="p-3 text-right border-b border-gray-200">
                      {milestone.due_date ? formatDate(milestone.due_date) : 'TBD'}
                    </td>
                    <td className="p-3 text-center border-b border-gray-200">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        milestone.status === 'paid' ? 'bg-green-100 text-green-700' :
                        milestone.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {milestone.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Payment Methods Accepted</h3>
              <p className="text-gray-600 text-sm">
                We accept credit cards (Visa, Mastercard, American Express), checks, and bank transfers.
                Online payment is available through your customer portal link.
              </p>
            </div>
          </div>
        )}

        {/* === PAGE 3: TERMS & CONDITIONS === */}
        <div className="max-w-[8.5in] mx-auto p-8 print:p-0 page-break">
          <h2 className="text-2xl font-bold text-[#DC143C] mb-6 pb-4 border-b-2 border-[#DC143C]">
            {terms.agreement_title}
          </h2>

          <p className="text-gray-600 text-sm italic mb-6 leading-relaxed">{terms.intro_text}</p>

          {terms.sections.map((section, idx) => (
            <div key={idx} className="mb-6 avoid-break">
              <h3 className="font-semibold text-gray-900 mb-2 text-base border-b border-[#FFD700] pb-1 inline-block">
                {section.title}
              </h3>
              {section.description && (
                <p className="text-gray-600 text-sm mb-2 leading-relaxed">{section.description}</p>
              )}
              {section.items && section.items.length > 0 && (
                <ul className="list-disc pl-5 space-y-1">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-gray-600 text-sm leading-relaxed">{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Government-specific terms */}
          {isGovernment && (
            <div className="mb-6 avoid-break bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2 text-base">Government Contract Compliance</h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                Payment terms follow Net 30 schedule (100% due 30 days after event completion). 
                Tax-exempt status applies. PO number required for billing.
              </p>
            </div>
          )}

          {/* Acceptance */}
          <div className="bg-gray-50 p-4 rounded-lg mt-8 avoid-break">
            <p className="text-gray-800 font-medium text-sm mb-2">{terms.acceptance_text}</p>
            <p className="text-gray-600 text-sm italic">{terms.closing_text}</p>
          </div>

          {/* Signature */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#DC143C] flex items-center justify-center text-white text-xl">
              ✍️
            </div>
            <div>
              <p className="font-semibold text-gray-900">{terms.owner_signature.name}</p>
              <p className="text-gray-600 text-sm">{terms.owner_signature.title}</p>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>Soul Train's Eatery • Charleston's Lowcountry</p>
            <p>(843) 970-0265 • soultrainseatery@gmail.com</p>
            <p className="mt-2 italic">Bringing people together around exceptional Southern food</p>
          </footer>
        </div>
      </div>
    </>
  );
}
