import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TestEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [fromEmail, setFromEmail] = useState("soultrainseatery@gmail.com");
  const [toEmail, setToEmail] = useState("felixfunes2001.ff@gmail.com");
  const { toast } = useToast();

  const handleGmailAuth = async () => {
    setIsAuthLoading(true);
    try {
      console.log("Initiating Gmail OAuth...");
      
      const { data, error } = await supabase.functions.invoke('gmail-oauth-init');

      if (error) {
        console.error("OAuth init error:", error);
        throw error;
      }

      if (data?.authUrl) {
        // Open OAuth URL in a new window
        const authWindow = window.open(
          data.authUrl,
          'gmail-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        if (authWindow) {
          // Check if the window is closed (user completed auth)
          const checkClosed = setInterval(() => {
            if (authWindow.closed) {
              clearInterval(checkClosed);
              toast({
                title: "Authorization Complete",
                description: "Gmail account has been connected. You can now send emails.",
              });
            }
          }, 1000);
        }
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (error: any) {
      console.error("Error initiating Gmail auth:", error);
      toast({
        title: "Authorization Error",
        description: `Failed to initiate Gmail authorization: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const sendTestEmail = async () => {
    setIsLoading(true);
    try {
      console.log("Sending test email...");
      
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          from: fromEmail,
          to: toEmail,
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      console.log("Test email response:", data);

      if (data?.success) {
        toast({
          title: "Success!",
          description: `Test email sent successfully from ${fromEmail} to ${toEmail}`,
        });
      } else {
        throw new Error(data?.error || "Unknown error occurred");
      }
    } catch (error: any) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description: `Failed to send test email: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Gmail OAuth Setup</CardTitle>
          <CardDescription>
            First, authorize Gmail access to enable email sending.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGmailAuth} 
            disabled={isAuthLoading}
            className="w-full mb-4"
          >
            {isAuthLoading ? "Authorizing..." : "Authorize Gmail Access"}
          </Button>
          <p className="text-sm text-muted-foreground">
            This will open a new window to authorize Gmail access for sending emails from your account.
          </p>
        </CardContent>
      </Card>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test Email System</CardTitle>
          <CardDescription>
            Send a test email to verify the email delivery system is working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from">From Email</Label>
            <Input
              id="from"
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="sender@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="to">To Email</Label>
            <Input
              id="to"
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>
          
          <Button 
            onClick={sendTestEmail} 
            disabled={isLoading || !fromEmail || !toEmail}
            className="w-full"
          >
            {isLoading ? "Sending..." : "Send Test Email"}
          </Button>
          
          <p className="text-sm text-muted-foreground">
            This will send a test email using the Gmail API to verify 
            that email delivery is working correctly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestEmail;