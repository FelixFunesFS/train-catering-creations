import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";

export default function TestEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [fromEmail, setFromEmail] = useState("soultrainseatery@gmail.com");
  const [toEmail, setToEmail] = useState("felixfunes2001.ff@gmail.com");
  const { toast } = useToast();

  const sendTestEmail = async () => {
    setIsLoading(true);
    
    try {
      console.log('🧪 Testing email delivery...');
      
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          from: fromEmail,
          to: toEmail
        }
      });

      if (error) {
        throw error;
      }

      console.log('✅ Test email response:', data);
      
      toast({
        title: "Test Email Sent!",
        description: `Test email sent from ${fromEmail} to ${toEmail}`,
      });

    } catch (error: any) {
      console.error('❌ Test email failed:', error);
      
      toast({
        title: "Email Test Failed",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pt-20">
      <ResponsiveWrapper>
        <div className="max-w-2xl mx-auto">
          <Card className="neumorphic-card-1 border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-elegant text-center">
                Email Delivery Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">From Email:</label>
                  <Input
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="sender@domain.com"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">To Email:</label>
                  <Input
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    placeholder="recipient@domain.com"
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                onClick={sendTestEmail}
                disabled={isLoading || !fromEmail || !toEmail}
                className="w-full neumorphic-button-primary"
              >
                {isLoading ? 'Sending Test Email...' : 'Send Test Email'}
              </Button>

              <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Test Details:</h4>
                <ul className="space-y-1">
                  <li>• This will test the Gmail SMTP configuration</li>
                  <li>• Check console logs for detailed error information</li>
                  <li>• Verify both sender and recipient receive emails</li>
                  <li>• Check spam folders if emails don't arrive</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </ResponsiveWrapper>
    </div>
  );
}