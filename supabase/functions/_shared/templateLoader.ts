import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

export interface EmailTemplate {
  id: string;
  template_name: string;
  template_type: string;
  subject_template: string;
  body_template: string;
  is_default: boolean;
}

/**
 * Load an email template from the database
 * Falls back to default template if custom template not found
 */
export async function loadEmailTemplate(
  supabase: ReturnType<typeof createClient>,
  templateType: string
): Promise<EmailTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', templateType)
      .order('is_default', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.warn(`Template not found for type: ${templateType}`, error.message);
      return null;
    }

    return data as EmailTemplate;
  } catch (error) {
    console.error('Error loading email template:', error);
    return null;
  }
}

/**
 * Parse template variables and replace with actual values
 * Variables are in format: {variable_name}
 */
export function parseTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let parsed = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    parsed = parsed.replace(regex, value || '');
  });
  
  return parsed;
}

/**
 * Format menu items for email display
 */
export function formatMenuItems(items: any): string {
  if (!items || (Array.isArray(items) && items.length === 0)) return 'None selected';
  if (typeof items === 'string') return formatMenuItem(items);
  if (Array.isArray(items)) return items.map(formatMenuItem).join(', ');
  return JSON.stringify(items);
}

function formatMenuItem(item: string): string {
  return item
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format currency from cents to display string
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(cents / 100);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format service type for display
 */
export function formatServiceType(serviceType: string): string {
  if (!serviceType) return 'Full Service';
  
  const typeMap: Record<string, string> = {
    'drop-off': 'Drop-Off',
    'delivery-setup': 'Delivery + Setup',
    'full-service': 'Full-Service Catering'
  };
  
  return typeMap[serviceType] || serviceType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Build common template variables from quote and invoice data
 */
export function buildTemplateVariables(
  quote: any,
  invoice?: any,
  portalUrl?: string
): Record<string, string> {
  const variables: Record<string, string> = {
    customer_name: quote?.contact_name || 'Valued Customer',
    event_name: quote?.event_name || 'Your Event',
    event_date: quote?.event_date ? formatDate(quote.event_date) : '',
    event_time: quote?.start_time || '',
    guest_count: String(quote?.guest_count || ''),
    location: quote?.location || '',
    service_type: formatServiceType(quote?.service_type),
    reference_id: quote?.id?.slice(0, 8).toUpperCase() || '',
  };
  
  if (invoice) {
    variables.invoice_number = invoice.invoice_number || '';
    variables.total_amount = formatCurrency(invoice.total_amount || 0);
    variables.deposit_amount = formatCurrency((invoice.total_amount || 0) / 2);
    variables.balance_due = formatCurrency(invoice.total_amount || 0);
  }
  
  if (portalUrl) {
    variables.portal_link = portalUrl;
  }
  
  return variables;
}
