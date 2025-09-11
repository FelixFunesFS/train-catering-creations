import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { 
  FileText,
  Calendar,
  Users,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Plus,
  Trash2,
  Send,
  Eye,
  Loader2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { type LineItem } from '@/utils/invoiceFormatters';

interface SimplifiedNewRequestsManagerProps {
  quotes: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function SimplifiedNewRequestsManager({ quotes, loading, onRefresh }: SimplifiedNewRequestsManagerProps) {
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);
  const [estimateData, setEstimateData] = useState<Record<string, any>>({});
  const [processingQuotes, setProcessingQuotes] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Filter for new requests (pending or reviewed quotes without non-draft invoices)
  const newRequests = quotes.filter(quote => 
    (quote.status === 'pending' || quote.status === 'reviewed') && 
    !quotes.some(q => q.id === quote.id && q.invoices?.some(inv => !inv.is_draft))
  );

  const needsAttention = newRequests.filter(quote => {
    const createdDate = new Date(quote.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 24; // Older than 24 hours
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getUrgencyBadge = (quote: any) => {
    const createdDate = new Date(quote.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 48) {
      return <Badge variant="destructive">Urgent - 48h+</Badge>;
    } else if (hoursDiff > 24) {
      return <Badge variant="secondary">Needs Attention - 24h+</Badge>;
    } else {
      return <Badge variant="outline">New</Badge>;
    }
  };

  const initializeEstimateData = (quoteId: string, quote: any) => {
    if (!estimateData[quoteId]) {
      setEstimateData(prev => ({
        ...prev,
        [quoteId]: {
          lineItems: [
            {
              id: `item_${Date.now()}`,
              title: 'Catering Service',
              description: 'Professional catering service with setup',
              quantity: 1,
              unit_price: 0,
              total_price: 0,
              category: 'service'
            }
          ],
          isGovernmentContract: false,
          notes: ''
        }
      }));
    }
  };

  const addLineItem = (quoteId: string) => {
    const newItem: LineItem = {
      id: `item_${Date.now()}`,
      title: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      category: 'other'
    };

    setEstimateData(prev => ({
      ...prev,
      [quoteId]: {
        ...prev[quoteId],
        lineItems: [...(prev[quoteId]?.lineItems || []), newItem]
      }
    }));
  };

  const updateLineItem = (quoteId: string, itemId: string, updates: Partial<LineItem>) => {
    setEstimateData(prev => ({
      ...prev,
      [quoteId]: {
        ...prev[quoteId],
        lineItems: prev[quoteId]?.lineItems?.map((item: LineItem) => 
          item.id === itemId 
            ? { 
                ...item, 
                ...updates,
                total_price: updates.quantity !== undefined || updates.unit_price !== undefined
                  ? (updates.quantity ?? item.quantity) * (updates.unit_price ?? item.unit_price)
                  : item.total_price
              }
            : item
        ) || []
      }
    }));
  };

  const removeLineItem = (quoteId: string, itemId: string) => {
    setEstimateData(prev => ({
      ...prev,
      [quoteId]: {
        ...prev[quoteId],
        lineItems: prev[quoteId]?.lineItems?.filter((item: LineItem) => item.id !== itemId) || []
      }
    }));
  };

  const calculateTotals = (lineItems: LineItem[]) => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxRate = 0.08; // 8% tax
    const taxAmount = Math.round(subtotal * taxRate);
    const grandTotal = subtotal + taxAmount;
    
    return { subtotal, taxAmount, grandTotal };
  };

  const createEstimate = async (quoteId: string) => {
    setProcessingQuotes(prev => new Set(prev).add(quoteId));
    
    try {
      const quote = quotes.find(q => q.id === quoteId);
      const data = estimateData[quoteId];
      
      if (!data || !data.lineItems?.length) {
        throw new Error('Please add at least one line item');
      }

      const { subtotal, taxAmount, grandTotal } = calculateTotals(data.lineItems);

      // Create customer first
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .upsert({
          name: quote.contact_name,
          email: quote.email,
          phone: quote.phone
        }, {
          onConflict: 'email'
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // Create invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          customer_id: customerData.id,
          quote_request_id: quoteId,
          invoice_number: `EST-${Date.now()}`,
          subtotal_amount: subtotal,
          tax_amount: taxAmount,
          total_amount: grandTotal,
          line_items: data.lineItems,
          status: 'draft',
          is_draft: true,
          government_contract: data.isGovernmentContract || false,
          notes: data.notes || ''
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Update quote status
      await supabase
        .from('quote_requests')
        .update({ 
          status: 'quoted',
          estimated_total: grandTotal 
        })
        .eq('id', quoteId);

      toast({
        title: "Estimate Created",
        description: `Draft estimate created for ${quote.contact_name}`,
      });

      // Clear form data and refresh
      setEstimateData(prev => {
        const newData = { ...prev };
        delete newData[quoteId];
        return newData;
      });
      setExpandedQuote(null);
      onRefresh();

    } catch (error) {
      console.error('Error creating estimate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create estimate",
        variant: "destructive"
      });
    } finally {
      setProcessingQuotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(quoteId);
        return newSet;
      });
    }
  };

  const handleQuoteExpand = (quoteId: string) => {
    if (expandedQuote === quoteId) {
      setExpandedQuote(null);
    } else {
      setExpandedQuote(quoteId);
      initializeEstimateData(quoteId, quotes.find(q => q.id === quoteId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading new requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Clock className="h-5 w-5 text-destructive" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold">{needsAttention.length}</p>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold">{newRequests.length}</p>
                <p className="text-sm text-muted-foreground">Total New Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold">{newRequests.length - needsAttention.length}</p>
                <p className="text-sm text-muted-foreground">Recent (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>New Quote Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {newRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No new requests</p>
              <p className="text-muted-foreground">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {newRequests.map((quote) => {
                const isExpanded = expandedQuote === quote.id;
                const isProcessing = processingQuotes.has(quote.id);
                const data = estimateData[quote.id];
                const lineItems = data?.lineItems || [];
                const totals = calculateTotals(lineItems);

                return (
                  <div key={quote.id} className="border rounded-lg p-4">
                    {/* Quote Summary Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold">{quote.event_name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{quote.contact_name}</span>
                            <span>•</span>
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(quote.event_date)}</span>
                            <span>•</span>
                            <Users className="h-3 w-3" />
                            <span>{quote.guest_count} guests</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getUrgencyBadge(quote)}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleQuoteExpand(quote.id)}
                          disabled={isProcessing}
                        >
                          {isExpanded ? 'Collapse' : 'Create Estimate'}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Estimate Creation */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t space-y-6">
                        {/* Quote Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{quote.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{quote.phone}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{quote.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{quote.service_type}</span>
                            </div>
                          </div>
                        </div>

                        {/* Line Items */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Line Items</h4>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => addLineItem(quote.id)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Item
                            </Button>
                          </div>

                          {lineItems.map((item: LineItem) => (
                            <div key={item.id} className="grid grid-cols-12 gap-3 p-3 border rounded">
                              <div className="col-span-4">
                                <Input
                                  value={item.title}
                                  onChange={(e) => updateLineItem(quote.id, item.id, { title: e.target.value })}
                                  placeholder="Item title"
                                />
                              </div>
                              <div className="col-span-3">
                                <Textarea
                                  value={item.description}
                                  onChange={(e) => updateLineItem(quote.id, item.id, { description: e.target.value })}
                                  placeholder="Description"
                                  className="min-h-[38px] resize-none"
                                  rows={1}
                                />
                              </div>
                              <div className="col-span-1">
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateLineItem(quote.id, item.id, { quantity: parseInt(e.target.value) || 0 })}
                                  min="0"
                                />
                              </div>
                              <div className="col-span-2">
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">$</span>
                                  <Input
                                    type="text"
                                    value={(item.unit_price / 100).toFixed(2)}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^0-9.]/g, '');
                                      const numValue = parseFloat(value || '0');
                                      if (!isNaN(numValue)) {
                                        updateLineItem(quote.id, item.id, { unit_price: Math.round(numValue * 100) });
                                      }
                                    }}
                                    className="pl-7"
                                  />
                                </div>
                              </div>
                              <div className="col-span-1 flex items-center">
                                <span className="text-sm font-medium">
                                  ${(item.total_price / 100).toFixed(2)}
                                </span>
                              </div>
                              <div className="col-span-1 flex items-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeLineItem(quote.id, item.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Totals */}
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(totals.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax (8%):</span>
                            <span>{formatCurrency(totals.taxAmount)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>{formatCurrency(totals.grandTotal)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setExpandedQuote(null)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => createEstimate(quote.id)}
                            disabled={isProcessing || !lineItems.length}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <FileText className="h-4 w-4 mr-2" />
                                Create Estimate
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}