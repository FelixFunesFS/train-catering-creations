import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Clock, DollarSign, Eye, FileText, Mail, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { generateProfessionalLineItems } from '@/utils/invoiceFormatters';

interface PipelineStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'completed' | 'active' | 'pending';
  count?: number;
}

interface QuoteRequest {
  id: string;
  contact_name: string;
  event_name: string;
  event_date: string;
  guest_count: number;
  status: string;
  estimated_total: number;
  created_at: string;
  email: string;
  phone: string;
  location: string;
  primary_protein?: string;
  secondary_protein?: string;
  appetizers?: any;
  sides?: any;
  desserts?: any;
  drinks?: any;
  service_type: string;
  wait_staff_requested?: boolean;
  chafers_requested?: boolean;
  tables_chairs_requested?: boolean;
  linens_requested?: boolean;
  dietary_restrictions?: any;
  special_requests?: string;
}

interface LinearRequestPipelineProps {
  onStartPricing?: (request: QuoteRequest) => void;
}

export function LinearRequestPipeline({ onStartPricing }: LinearRequestPipelineProps) {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const { toast } = useToast();

  const pipelineSteps: PipelineStep[] = [
    {
      id: 'new-request',
      title: 'New Request',
      description: 'Initial quote submission',
      icon: FileText,
      status: 'active',
      count: requests.filter(r => r.status === 'pending').length
    },
    {
      id: 'review-price',
      title: 'Review & Price',
      description: 'Auto-group items and set pricing',
      icon: DollarSign,
      status: 'pending'
    },
    {
      id: 'send-estimate',
      title: 'Send Estimate',
      description: 'Preview and send to customer',
      icon: Mail,
      status: 'pending'
    },
    {
      id: 'customer-action',
      title: 'Customer Action',
      description: 'Approval or change requests',
      icon: Eye,
      status: 'pending'
    },
    {
      id: 'invoice-payment',
      title: 'Invoice & Payment',
      description: 'Convert to invoice with payment link',
      icon: Clock,
      status: 'pending'
    }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRequests((data || []) as QuoteRequest[]);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequest = (request: QuoteRequest) => {
    setSelectedRequest(request);
    setCurrentStep(request.status === 'pending' ? 0 : 1);
  };

  const handleStartPricing = () => {
    if (selectedRequest && onStartPricing) {
      onStartPricing(selectedRequest);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Linear Request Pipeline</h1>
          <p className="text-muted-foreground">Streamlined workflow from request to payment</p>
        </div>
        <Button onClick={fetchRequests} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {pipelineSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex flex-col items-center ${
                  index === currentStep ? 'text-primary' : 
                  index < currentStep ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index === currentStep ? 'border-primary bg-primary/10' :
                    index < currentStep ? 'border-green-600 bg-green-600/10' : 'border-muted'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium mt-2 text-center max-w-20">{step.title}</span>
                  {step.count !== undefined && step.count > 0 && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {step.count}
                    </Badge>
                  )}
                </div>
                {index < pipelineSteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 mx-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              New Requests ({requests.filter(r => r.status === 'pending').length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {requests.filter(r => r.status === 'pending').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No new requests</p>
              </div>
            ) : (
              requests.filter(r => r.status === 'pending').map((request) => (
                <div
                  key={request.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedRequest?.id === request.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleSelectRequest(request)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{request.event_name}</h3>
                      <p className="text-sm text-muted-foreground">{request.contact_name}</p>
                    </div>
                    <Badge variant="secondary">{request.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <span className="ml-1">{new Date(request.event_date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Guests:</span>
                      <span className="ml-1">{request.guest_count}</span>
                    </div>
                  </div>
                  {request.estimated_total > 0 && (
                    <div className="mt-2 text-sm font-medium">
                      Est. Total: {formatCurrency(request.estimated_total / 100)}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Request Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRequest ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">{selectedRequest.event_name}</h3>
                  <p className="text-muted-foreground">{selectedRequest.contact_name}</p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{selectedRequest.phone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Event Date:</span>
                    <p className="font-medium">{new Date(selectedRequest.event_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Guest Count:</span>
                    <p className="font-medium">{selectedRequest.guest_count}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-medium">{selectedRequest.location}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={handleStartPricing}>
                    Start Review & Pricing
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="w-8 h-8 mx-auto mb-2" />
                <p>Select a request to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}