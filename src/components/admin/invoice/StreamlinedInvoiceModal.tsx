import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { InvoiceViewer } from './InvoiceViewer';
import { InvoicePricingPanel } from './InvoicePricingPanel';
import { InvoiceStatusManager } from './InvoiceStatusManager';
import { 
  FileText, 
  Calculator, 
  Settings, 
  Eye, 
  Send, 
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LineItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_override?: boolean;
}

interface InvoiceData {
  id?: string;
  invoice_number?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  line_items: LineItem[];
  status?: string;
  due_date?: string;
  stripe_invoice_id?: string;
  pdf_url?: string;
  manual_overrides?: any;
  override_reason?: string;
  is_draft?: boolean;
  last_quote_sync?: string;
}

interface StreamlinedInvoiceModalProps {
  quote: any;
  customer?: any;
  invoiceData?: InvoiceData;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (overrides?: any) => Promise<void>;
  onSend?: (invoiceId: string) => Promise<void>;
  onUpdateStatus?: (status: string) => Promise<void>;
  mode?: 'view' | 'edit' | 'status';
}

export function StreamlinedInvoiceModal({
  quote,
  customer,
  invoiceData,
  isOpen,
  onClose,
  onGenerate,
  onSend,
  onUpdateStatus,
  mode = 'view'
}: StreamlinedInvoiceModalProps) {
  const [activeTab, setActiveTab] = useState(mode);
  const [showPricingPanel, setShowPricingPanel] = useState(false);
  const [currentLineItems, setCurrentLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (invoiceData?.line_items) {
      setCurrentLineItems(invoiceData.line_items);
    }
  }, [invoiceData]);

  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getStatusBadge = () => {
    if (!invoiceData?.status) return null;
    
    const statusColors = {
      draft: 'bg-warning/10 text-warning border-warning/20',
      sent: 'bg-info/10 text-info border-info/20',
      viewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      paid: 'bg-success/10 text-success border-success/20',
      overdue: 'bg-destructive/10 text-destructive border-destructive/20'
    };

    return (
      <Badge className={statusColors[invoiceData.status as keyof typeof statusColors] || 'bg-muted'}>
        {invoiceData.status.toUpperCase()}
      </Badge>
    );
  };

  const handlePricingSave = async (overrides: any) => {
    setLoading(true);
    try {
      await onGenerate(overrides);
      setShowPricingPanel(false);
      setHasUnsavedChanges(false);
      toast({
        title: "Pricing Saved",
        description: "Invoice pricing has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save pricing changes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!invoiceData?.id || !onSend) return;
    
    setLoading(true);
    try {
      await onSend(invoiceData.id);
      toast({
        title: "Invoice Sent",
        description: "Invoice has been sent to the customer successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invoice.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const needsPricing = invoiceData?.line_items?.some(item => item.unit_price === 0) || false;
  const canSend = invoiceData && invoiceData.status === 'draft' && !needsPricing;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {invoiceData?.invoice_number ? `Invoice ${invoiceData.invoice_number}` : 'Invoice Management'}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                {invoiceData && (
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(invoiceData.total_amount)}
                  </span>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'view' | 'edit' | 'status')} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="view" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="edit" className="flex items-center gap-2" disabled={!invoiceData}>
                  <Calculator className="h-4 w-4" />
                  Pricing
                  {needsPricing && <Badge variant="destructive" className="text-xs">Required</Badge>}
                </TabsTrigger>
                <TabsTrigger value="status" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Status
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-auto">
                <TabsContent value="view" className="h-full mt-4">
                  {invoiceData ? (
                    <InvoiceViewer
                      invoice={invoiceData}
                      customer={customer}
                      quote={quote}
                      onSend={canSend ? handleSendInvoice : undefined}
                      onDownload={(id) => console.log('Download:', id)}
                      onViewInStripe={(id) => window.open(`https://dashboard.stripe.com/invoices/${id}`, '_blank')}
                      showActions={true}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Invoice Generated</h3>
                      <p className="text-muted-foreground mb-4">
                        Generate an invoice from this quote to view the preview.
                      </p>
                      <Button onClick={() => onGenerate()}>
                        Generate Invoice
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="edit" className="h-full mt-4">
                  {invoiceData ? (
                    <div className="space-y-4">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-muted/30 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold">{invoiceData.line_items.length}</div>
                          <div className="text-sm text-muted-foreground">Line Items</div>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold">{formatCurrency(invoiceData.subtotal)}</div>
                          <div className="text-sm text-muted-foreground">Subtotal</div>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold">{formatCurrency(invoiceData.tax_amount)}</div>
                          <div className="text-sm text-muted-foreground">Tax</div>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-primary">{formatCurrency(invoiceData.total_amount)}</div>
                          <div className="text-sm text-muted-foreground">Total</div>
                        </div>
                      </div>

                      {/* Pricing Action */}
                      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                        <div>
                          <h3 className="font-medium">Update Pricing & Line Items</h3>
                          <p className="text-sm text-muted-foreground">
                            {needsPricing ? 
                              'This invoice needs pricing before it can be sent.' : 
                              'Make changes to pricing, quantities, or add custom items.'
                            }
                          </p>
                        </div>
                        <Button 
                          onClick={() => setShowPricingPanel(true)}
                          variant={needsPricing ? "default" : "outline"}
                          className="flex items-center gap-2"
                        >
                          <Calculator className="h-4 w-4" />
                          {needsPricing ? 'Set Pricing' : 'Edit Pricing'}
                        </Button>
                      </div>

                      {/* Line Items Preview */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/30 px-4 py-3">
                          <h4 className="font-medium">Current Line Items</h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {invoiceData.line_items.map((item, index) => (
                            <div key={item.id || index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.title}</span>
                                  {item.is_override && <Badge variant="outline" className="text-xs">Modified</Badge>}
                                  {item.unit_price === 0 && <Badge variant="destructive" className="text-xs">No Price</Badge>}
                                </div>
                                <div className="text-sm text-muted-foreground">{item.description}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{formatCurrency(item.total_price)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {item.quantity} × {formatCurrency(item.unit_price)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Invoice to Edit</h3>
                      <p className="text-muted-foreground mb-4">
                        Generate an invoice first to access pricing tools.
                      </p>
                      <Button onClick={() => onGenerate()}>
                        Generate Invoice
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="status" className="h-full mt-4">
                  <InvoiceStatusManager
                    quote={quote}
                    invoice={invoiceData}
                    customer={customer}
                    onUpdateStatus={onUpdateStatus || (() => Promise.resolve())}
                    onSendInvoice={onSend}
                    onGenerateInvoice={() => onGenerate()}
                    loading={loading}
                  />
                </TabsContent>
              </div>

              {/* Footer Actions */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {invoiceData?.last_quote_sync && (
                      <span>Last synced: {new Date(invoiceData.last_quote_sync).toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={onClose}>
                      Close
                    </Button>
                    {invoiceData && canSend && (
                      <Button 
                        onClick={handleSendInvoice} 
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Send Invoice
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pricing Panel */}
      <InvoicePricingPanel
        isOpen={showPricingPanel}
        onClose={() => setShowPricingPanel(false)}
        lineItems={currentLineItems}
        onUpdateLineItems={setCurrentLineItems}
        onSave={handlePricingSave}
        loading={loading}
      />
    </>
  );
}