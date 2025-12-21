import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Mail, CheckCircle2, Send } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TestEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fromEmail] = useState('soultrainseatery@gmail.com');
  const [toEmail, setToEmail] = useState('');
  const { toast } = useToast();

  const sendTestEmail = async () => {
    if (!toEmail) {
      toast({
        title: "Missing recipient",
        description: "Please enter a recipient email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-smtp-email', {
        body: {
          to: toEmail,
          subject: "Test Email - Soul Train's Eatery SMTP Integration",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #DC143C, #8B0000); padding: 30px; text-align: center; border-radius: 8px;">
                <h1 style="color: #FFD700; margin: 0;">🚂 Soul Train's Eatery</h1>
                <p style="color: white; margin: 10px 0 0 0;">SMTP Email Test</p>
              </div>
              <div style="padding: 30px; background: #fff; border: 1px solid #eee; border-radius: 0 0 8px 8px;">
                <h2 style="color: #333;">✅ SMTP Email Test Successful!</h2>
                <p>This is a test email sent via SMTP (smtp.gmail.com).</p>
                <p><strong>From:</strong> ${fromEmail}</p>
                <p><strong>To:</strong> ${toEmail}</p>
                <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 14px;">
                  If you're seeing this email, the SMTP integration is working correctly!
                </p>
              </div>
            </div>
          `,
          from: `Soul Train's Eatery <${fromEmail}>`
        }
      });

      if (error) throw error;

      toast({
        title: "Test email sent!",
        description: `Email sent successfully to ${toEmail}`,
      });
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast({
        title: "Failed to send test email",
        description: error.message || "Please check SMTP configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              SMTP Email Configuration
            </span>
            <Badge variant="default" className="bg-green-500">Connected</Badge>
          </CardTitle>
          <CardDescription>
            Emails are sent via SMTP using smtp.gmail.com with app password authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-300">SMTP Configured</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              Using Gmail SMTP with existing credentials. No OAuth token management or periodic 
              reauthorization required. Emails will be sent reliably without token expiration issues.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Test Email
          </CardTitle>
          <CardDescription>
            Send a test email to verify the SMTP configuration is working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from">From Email</Label>
            <Input
              id="from"
              type="email"
              value={fromEmail}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Emails are sent from the configured SMTP account
            </p>
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
            disabled={isLoading || !toEmail}
            className="w-full"
          >
            <Mail className="mr-2 h-4 w-4" />
            {isLoading ? "Sending..." : "Send Test Email"}
          </Button>
          
          <p className="text-sm text-muted-foreground">
            This will send a test email using SMTP to verify 
            that email delivery is working correctly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestEmail;
