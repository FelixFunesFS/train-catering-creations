import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, CheckCircle2, XCircle } from "lucide-react";

export const EdgeFunctionTester = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [testEmail, setTestEmail] = useState("soultrainseatery@gmail.com");

  const testFunction = async (functionName: string, body: any) => {
    setLoading(prev => ({ ...prev, [functionName]: true }));
    try {
      console.log(`Testing ${functionName} with:`, body);
      const { data, error } = await supabase.functions.invoke(functionName, { body });
      
      if (error) throw error;
      
      setResults(prev => ({ ...prev, [functionName]: { success: true, data } }));
      toast({
        title: "✅ Function Executed",
        description: `${functionName} completed successfully`,
      });
      return data;
    } catch (error: any) {
      console.error(`${functionName} error:`, error);
      setResults(prev => ({ ...prev, [functionName]: { success: false, error: error.message } }));
      toast({
        title: "❌ Function Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [functionName]: false }));
    }
  };

  const testGmailEmail = () => testFunction('send-gmail-email', {
    to: testEmail,
    subject: "Test Email from Soul Train's Eatery",
    html: `
      <h1>Test Email</h1>
      <p>This is a test email sent at ${new Date().toLocaleString()}</p>
      <p>If you received this, your Gmail integration is working!</p>
    `
  });

  const testWorkflowEmail = async () => {
    // First, get a real invoice ID from the database
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id')
      .limit(1)
      .single();
    
    if (!invoices) {
      toast({
        title: "No Invoice Found",
        description: "Create an invoice first to test workflow emails",
        variant: "destructive",
      });
      return;
    }

    testFunction('send-workflow-email', {
      invoiceId: invoices.id,
      emailType: 'estimate_ready'
    });
  };

  const testAutoWorkflow = () => testFunction('auto-workflow-manager', {});

  const ResultBadge = ({ functionName }: { functionName: string }) => {
    const result = results[functionName];
    if (!result) return null;
    
    return result.success ? (
      <CheckCircle2 className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edge Function Testing & Deployment Verification</CardTitle>
        <CardDescription>
          Test critical edge functions to verify deployment and email delivery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email Address</Label>
          <Input
            id="test-email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your-email@example.com"
          />
        </div>

        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={testGmailEmail}
              disabled={loading['send-gmail-email']}
              className="flex-1"
            >
              {loading['send-gmail-email'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              Test Gmail Email
            </Button>
            <ResultBadge functionName="send-gmail-email" />
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={testWorkflowEmail}
              disabled={loading['send-workflow-email']}
              className="flex-1"
            >
              {loading['send-workflow-email'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              Test Workflow Email
            </Button>
            <ResultBadge functionName="send-workflow-email" />
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={testAutoWorkflow}
              disabled={loading['auto-workflow-manager']}
              className="flex-1"
            >
              {loading['auto-workflow-manager'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              Test Auto Workflow Manager
            </Button>
            <ResultBadge functionName="auto-workflow-manager" />
          </div>
        </div>

        {Object.keys(results).length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Test Results:</h4>
            <pre className="text-xs overflow-auto max-h-64">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
