import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GovernmentContractPanelProps {
  quote: any;
  invoice: any;
  onBack: () => void;
  onContinue: () => void;
}

export function GovernmentContractPanel({ quote, invoice, onBack, onContinue }: GovernmentContractPanelProps) {
  const [poNumber, setPoNumber] = useState(quote.po_number || '');
  const [contractingOffice, setContractingOffice] = useState('');
  const [contractingOfficer, setContractingOfficer] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [complianceChecklist, setComplianceChecklist] = useState({
    federal_tax_id: false,
    duns_number: false,
    sam_registration: false,
    insurance_certificate: false,
    safety_certifications: false,
    background_checks: false,
  });

  const allChecklistComplete = Object.values(complianceChecklist).every(v => v);

  const saveGovernmentContract = async () => {
    if (!poNumber.trim()) {
      toast({
        title: "PO Number Required",
        description: "Please enter a Purchase Order number",
        variant: "destructive"
      });
      return;
    }

    if (!allChecklistComplete) {
      toast({
        title: "Compliance Incomplete",
        description: "Please complete all compliance requirements",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Update quote with PO number
      await supabase
        .from('quote_requests')
        .update({ 
          po_number: poNumber,
          compliance_level: 'government'
        })
        .eq('id', quote.id);

      // Create or update government contract record
      const { error: govError } = await supabase
        .from('government_contracts')
        .upsert({
          quote_request_id: quote.id,
          contract_status: 'compliance_verified',
          compliance_checklist: complianceChecklist,
          special_requirements: {
            contracting_office: contractingOffice,
            contracting_officer: contractingOfficer,
            additional_notes: specialRequirements
          },
          submitted_at: new Date().toISOString()
        }, {
          onConflict: 'quote_request_id'
        });

      if (govError) throw govError;

      // Update invoice for Net-30 terms
      await supabase
        .from('invoices')
        .update({
          payment_schedule_type: 'net30',
          document_type: 'government_invoice'
        })
        .eq('id', invoice.id);

      toast({
        title: "Government Contract Setup Complete",
        description: "PO number saved and compliance verified"
      });

      onContinue();
    } catch (error) {
      console.error('Error saving government contract:', error);
      toast({
        title: "Error",
        description: "Failed to save government contract information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Government Contract Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PO Number */}
        <div className="space-y-2">
          <Label htmlFor="po-number">
            Purchase Order Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="po-number"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
            placeholder="Enter PO number"
            required
          />
        </div>

        {/* Contracting Office Details */}
        <div className="space-y-4">
          <h3 className="font-semibold">Contracting Office Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="contracting-office">Contracting Office</Label>
            <Input
              id="contracting-office"
              value={contractingOffice}
              onChange={(e) => setContractingOffice(e.target.value)}
              placeholder="e.g., Naval Station Charleston"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contracting-officer">Contracting Officer</Label>
            <Input
              id="contracting-officer"
              value={contractingOfficer}
              onChange={(e) => setContractingOfficer(e.target.value)}
              placeholder="Officer name"
            />
          </div>
        </div>

        {/* Compliance Checklist */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Compliance Checklist</h3>
            {allChecklistComplete ? (
              <Badge className="bg-green-500">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            ) : (
              <Badge variant="outline">
                <AlertCircle className="w-3 h-3 mr-1" />
                Incomplete
              </Badge>
            )}
          </div>

          <div className="space-y-3 border rounded-lg p-4">
            {Object.entries({
              federal_tax_id: 'Federal Tax ID on file',
              duns_number: 'DUNS Number verified',
              sam_registration: 'SAM.gov registration active',
              insurance_certificate: 'Insurance certificate provided',
              safety_certifications: 'Food safety certifications current',
              background_checks: 'Background checks completed'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={key}
                  checked={complianceChecklist[key as keyof typeof complianceChecklist]}
                  onCheckedChange={(checked) =>
                    setComplianceChecklist(prev => ({ ...prev, [key]: checked as boolean }))
                  }
                />
                <label htmlFor={key} className="text-sm cursor-pointer">
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Special Requirements */}
        <div className="space-y-2">
          <Label htmlFor="special-requirements">Special Requirements or Notes</Label>
          <Textarea
            id="special-requirements"
            value={specialRequirements}
            onChange={(e) => setSpecialRequirements(e.target.value)}
            placeholder="Base access requirements, security clearances, etc."
            rows={4}
          />
        </div>

        {/* Payment Terms Notice */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Net-30 Payment Terms</h4>
          <p className="text-sm text-muted-foreground">
            This government contract will be set up with Net-30 payment terms. 
            Invoice will be generated after event completion and sent to the contracting office.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
          <Button 
            onClick={saveGovernmentContract} 
            disabled={loading || !poNumber.trim() || !allChecklistComplete}
            className="flex-1"
          >
            {loading ? "Saving..." : "Save & Continue to Contract"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
