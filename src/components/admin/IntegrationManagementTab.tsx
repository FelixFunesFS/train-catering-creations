import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Calendar, 
  Mail, 
  CreditCard, 
  MessageSquare, 
  FileText, 
  Cloud, 
  Settings,
  Check,
  AlertCircle,
  Plus,
  ExternalLink,
  Zap
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'calendar' | 'email' | 'payment' | 'communication' | 'documentation' | 'automation';
  status: 'connected' | 'disconnected' | 'error';
  icon: React.ReactNode;
  features: string[];
  lastSync?: string;
  configured: boolean;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  lastTriggered?: string;
}

export function IntegrationManagementTab() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      // Sample integrations data
      const integrationsData: Integration[] = [
        {
          id: '1',
          name: 'Google Calendar',
          description: 'Sync events and scheduling automatically',
          category: 'calendar',
          status: 'connected',
          icon: <Calendar className="h-5 w-5" />,
          features: ['Event sync', 'Availability check', 'Auto-scheduling'],
          lastSync: '2024-01-15T10:30:00Z',
          configured: true
        },
        {
          id: '2',
          name: 'Gmail',
          description: 'Send emails and manage communications',
          category: 'email',
          status: 'connected',
          icon: <Mail className="h-5 w-5" />,
          features: ['Email sending', 'Template management', 'Tracking'],
          lastSync: '2024-01-15T09:45:00Z',
          configured: true
        },
        {
          id: '3',
          name: 'Stripe',
          description: 'Process payments and manage billing',
          category: 'payment',
          status: 'connected',
          icon: <CreditCard className="h-5 w-5" />,
          features: ['Payment processing', 'Subscription billing', 'Invoice generation'],
          lastSync: '2024-01-15T08:20:00Z',
          configured: true
        },
        {
          id: '4',
          name: 'Slack',
          description: 'Team notifications and alerts',
          category: 'communication',
          status: 'disconnected',
          icon: <MessageSquare className="h-5 w-5" />,
          features: ['Real-time notifications', 'Team alerts', 'Status updates'],
          configured: false
        },
        {
          id: '5',
          name: 'QuickBooks',
          description: 'Accounting and financial management',
          category: 'documentation',
          status: 'error',
          icon: <FileText className="h-5 w-5" />,
          features: ['Invoice sync', 'Expense tracking', 'Financial reports'],
          configured: false
        },
        {
          id: '6',
          name: 'Zapier',
          description: 'Connect with 3000+ apps',
          category: 'automation',
          status: 'disconnected',
          icon: <Zap className="h-5 w-5" />,
          features: ['Workflow automation', 'Data sync', 'Custom triggers'],
          configured: false
        }
      ];

      const webhooksData: WebhookEndpoint[] = [
        {
          id: '1',
          name: 'Order Processing',
          url: 'https://api.example.com/webhooks/orders',
          events: ['quote.approved', 'invoice.created', 'payment.received'],
          status: 'active',
          lastTriggered: '2024-01-15T10:15:00Z'
        },
        {
          id: '2',
          name: 'Customer Updates',
          url: 'https://crm.example.com/webhooks/customers',
          events: ['customer.created', 'customer.updated'],
          status: 'active',
          lastTriggered: '2024-01-14T16:30:00Z'
        },
        {
          id: '3',
          name: 'Notification Service',
          url: 'https://notifications.example.com/webhooks',
          events: ['event.scheduled', 'reminder.sent'],
          status: 'inactive'
        }
      ];

      setIntegrations(integrationsData);
      setWebhooks(webhooksData);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (integrationId: string, connect: boolean) => {
    try {
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { 
                ...integration, 
                status: connect ? 'connected' : 'disconnected',
                lastSync: connect ? new Date().toISOString() : undefined
              }
            : integration
        )
      );
      
      toast.success(`Integration ${connect ? 'connected' : 'disconnected'} successfully`);
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast.error('Failed to update integration');
    }
  };

  const syncIntegration = async (integrationId: string) => {
    try {
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, lastSync: new Date().toISOString() }
            : integration
        )
      );
      
      toast.success('Integration synced successfully');
    } catch (error) {
      console.error('Error syncing integration:', error);
      toast.error('Failed to sync integration');
    }
  };

  const toggleWebhook = async (webhookId: string, active: boolean) => {
    try {
      setWebhooks(prev => 
        prev.map(webhook => 
          webhook.id === webhookId 
            ? { ...webhook, status: active ? 'active' : 'inactive' }
            : webhook
        )
      );
      
      toast.success(`Webhook ${active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling webhook:', error);
      toast.error('Failed to update webhook');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'calendar': return <Calendar className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'communication': return <MessageSquare className="h-4 w-4" />;
      case 'documentation': return <FileText className="h-4 w-4" />;
      case 'automation': return <Zap className="h-4 w-4" />;
      default: return <Cloud className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Integration Management</h3>
          <p className="text-sm text-muted-foreground">
            Connect and manage external services and APIs
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Connected Services</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api-keys">API Management</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {integration.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={getStatusColor(integration.status)}>
                            {getStatusIcon(integration.status)}
                            <span className="ml-1 capitalize">{integration.status}</span>
                          </Badge>
                          <Badge variant="outline">
                            {getCategoryIcon(integration.category)}
                            <span className="ml-1 capitalize">{integration.category}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Features</Label>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {integration.lastSync && (
                    <div className="text-xs text-muted-foreground">
                      Last sync: {new Date(integration.lastSync).toLocaleDateString()}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <Switch
                      checked={integration.status === 'connected'}
                      onCheckedChange={(checked) => toggleIntegration(integration.id, checked)}
                    />
                    
                    <div className="flex space-x-2">
                      {integration.status === 'connected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncIntegration(integration.id)}
                        >
                          Sync
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Webhook Endpoints</h4>
              <p className="text-sm text-muted-foreground">
                Manage webhook destinations for real-time notifications
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </div>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold">{webhook.name}</h4>
                        <Badge variant={getStatusColor(webhook.status)}>
                          {getStatusIcon(webhook.status)}
                          <span className="ml-1 capitalize">{webhook.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-mono text-muted-foreground">
                            {webhook.url}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Events:</span>
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.map((event, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {webhook.lastTriggered && (
                          <div className="text-xs text-muted-foreground">
                            Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Test
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Switch
                        checked={webhook.status === 'active'}
                        onCheckedChange={(checked) => toggleWebhook(webhook.id, checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>
                Manage API keys and authentication tokens for integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="stripe-key"
                      type="password"
                      placeholder="sk_live_..."
                      defaultValue="sk_live_••••••••••••••••"
                    />
                    <Button variant="outline">Update</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gmail-token">Gmail OAuth Token</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="gmail-token"
                      type="password"
                      placeholder="ya29...."
                      defaultValue="ya29.••••••••••••••••"
                    />
                    <Button variant="outline">Refresh</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="calendar-key">Google Calendar API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="calendar-key"
                      type="password"
                      placeholder="AIza..."
                      defaultValue="AIza••••••••••••••••"
                    />
                    <Button variant="outline">Update</Button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Security Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-rotate">Auto-rotate API keys</Label>
                    <Switch id="auto-rotate" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="audit-logs">Enable audit logging</Label>
                    <Switch id="audit-logs" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rate-limiting">Rate limiting</Label>
                    <Switch id="rate-limiting" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}