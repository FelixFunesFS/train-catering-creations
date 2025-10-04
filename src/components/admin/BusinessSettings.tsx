import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building2, Save, Loader2 } from 'lucide-react';

interface BusinessConfig {
  company_name: string;
  phone: string;
  email: string;
  address: string;
  tax_rate: number;
  default_deposit_percentage: number;
  cancellation_policy: string;
  terms_and_conditions: string;
}

export function BusinessSettings() {
  const [config, setConfig] = useState<BusinessConfig>({
    company_name: "Soul Train's Eatery",
    phone: '(843) 970-0265',
    email: 'soultrainseatery@gmail.com',
    address: 'Charleston, SC',
    tax_rate: 8.5,
    default_deposit_percentage: 50,
    cancellation_policy: 'Cancellations must be made at least 7 days prior to the event for a full refund.',
    terms_and_conditions: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('business_config')
        .select('*')
        .eq('config_key', 'general_settings')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.config_value && typeof data.config_value === 'object') {
        setConfig({ ...config, ...(data.config_value as any) });
      }
    } catch (err: any) {
      console.error('Error fetching config:', err);
      toast({
        title: 'Error',
        description: 'Failed to load business settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('business_config')
        .upsert([{
          config_key: 'general_settings',
          config_value: config as any,
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'config_key'
        });

      if (error) throw error;

      toast({
        title: 'Settings Saved',
        description: 'Business settings have been updated successfully'
      });
    } catch (err: any) {
      console.error('Error saving config:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Business Settings
        </CardTitle>
        <CardDescription>
          Configure your company information and default policies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Information */}
        <div className="space-y-4">
          <h3 className="font-semibold">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={config.company_name}
                onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={config.phone}
                onChange={(e) => setConfig({ ...config, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={config.address}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold">Financial Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={config.tax_rate}
                onChange={(e) => setConfig({ ...config, tax_rate: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_deposit">Default Deposit (%)</Label>
              <Input
                id="default_deposit"
                type="number"
                step="5"
                min="0"
                max="100"
                value={config.default_deposit_percentage}
                onChange={(e) => setConfig({ ...config, default_deposit_percentage: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="space-y-4">
          <h3 className="font-semibold">Policies</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
              <Textarea
                id="cancellation_policy"
                value={config.cancellation_policy}
                onChange={(e) => setConfig({ ...config, cancellation_policy: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms_and_conditions">Terms & Conditions</Label>
              <Textarea
                id="terms_and_conditions"
                value={config.terms_and_conditions}
                onChange={(e) => setConfig({ ...config, terms_and_conditions: e.target.value })}
                rows={5}
                placeholder="Enter your standard terms and conditions..."
              />
            </div>
          </div>
        </div>

        <Button onClick={saveConfig} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
