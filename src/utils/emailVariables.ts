/**
 * Email Template Variables System
 * Defines all available variables for email templates and provides parsing utilities
 */

export interface EmailVariableCategory {
  label: string;
  variables: EmailVariable[];
}

export interface EmailVariable {
  key: string;
  label: string;
  description: string;
  example: string;
}

export const EMAIL_VARIABLE_CATEGORIES: EmailVariableCategory[] = [
  {
    label: "Customer Information",
    variables: [
      { key: "customer_name", label: "Customer Name", description: "Full name of the customer", example: "John Smith" },
      { key: "customer_email", label: "Customer Email", description: "Customer's email address", example: "john@example.com" },
      { key: "customer_phone", label: "Customer Phone", description: "Customer's phone number", example: "(843) 555-1234" },
    ]
  },
  {
    label: "Event Details",
    variables: [
      { key: "event_name", label: "Event Name", description: "Name of the event", example: "Smith Wedding Reception" },
      { key: "event_type", label: "Event Type", description: "Type of event", example: "Wedding" },
      { key: "event_date", label: "Event Date", description: "Date of the event", example: "December 25, 2025" },
      { key: "event_time", label: "Event Time", description: "Start time of the event", example: "6:00 PM" },
      { key: "guest_count", label: "Guest Count", description: "Number of guests", example: "150" },
      { key: "event_location", label: "Event Location", description: "Venue location", example: "Charleston Country Club" },
    ]
  },
  {
    label: "Invoice Information",
    variables: [
      { key: "invoice_number", label: "Invoice Number", description: "Invoice reference number", example: "INV-2025-0123" },
      { key: "invoice_total", label: "Invoice Total", description: "Total amount with tax", example: "$3,240.00" },
      { key: "invoice_subtotal", label: "Subtotal", description: "Amount before tax", example: "$3,000.00" },
      { key: "invoice_tax", label: "Tax Amount", description: "Sales tax amount", example: "$240.00" },
      { key: "due_date", label: "Due Date", description: "Payment due date", example: "December 18, 2025" },
    ]
  },
  {
    label: "Business Information",
    variables: [
      { key: "business_name", label: "Business Name", description: "Soul Train's Eatery", example: "Soul Train's Eatery" },
      { key: "business_phone", label: "Business Phone", description: "Contact phone", example: "(843) 970-0265" },
      { key: "business_email", label: "Business Email", description: "Contact email", example: "soultrainseatery@gmail.com" },
    ]
  }
];

export interface VariableData {
  quote?: any;
  invoice?: any;
  customer?: any;
}

/**
 * Extract variable values from quote/invoice/customer data
 */
export function extractVariables(data: VariableData): Record<string, string> {
  const { quote, invoice, customer } = data;
  
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatEventType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return {
    // Customer Information
    customer_name: quote?.contact_name || customer?.name || '',
    customer_email: quote?.email || customer?.email || '',
    customer_phone: quote?.phone || customer?.phone || '',
    
    // Event Details
    event_name: quote?.event_name || '',
    event_type: quote?.event_type ? formatEventType(quote.event_type) : '',
    event_date: quote?.event_date ? formatDate(quote.event_date) : '',
    event_time: quote?.start_time || '',
    guest_count: quote?.guest_count?.toString() || '',
    event_location: quote?.location || '',
    
    // Invoice Information
    invoice_number: invoice?.invoice_number || '',
    invoice_total: invoice?.total_amount ? formatCurrency(invoice.total_amount) : '',
    invoice_subtotal: invoice?.subtotal ? formatCurrency(invoice.subtotal) : '',
    invoice_tax: invoice?.tax_amount ? formatCurrency(invoice.tax_amount) : '',
    due_date: invoice?.due_date ? formatDate(invoice.due_date) : '',
    
    // Business Information
    business_name: "Soul Train's Eatery",
    business_phone: "(843) 970-0265",
    business_email: "soultrainseatery@gmail.com",
  };
}

/**
 * Parse template string and replace variables with actual values
 */
export function parseTemplate(
  template: string, 
  variables: Record<string, string>
): string {
  let parsed = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    parsed = parsed.replace(regex, value || `{${key}}`);
  });
  
  return parsed;
}

/**
 * Find all variables used in a template string
 */
export function findVariablesInTemplate(template: string): string[] {
  const matches = template.match(/{([^}]+)}/g);
  if (!matches) return [];
  
  return matches.map(match => match.slice(1, -1));
}

/**
 * Validate that all variables in template have values
 */
export function validateTemplate(
  template: string, 
  variables: Record<string, string>
): { valid: boolean; missing: string[] } {
  const usedVariables = findVariablesInTemplate(template);
  const missing = usedVariables.filter(varKey => !variables[varKey]);
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Get all available variable keys
 */
export function getAllVariableKeys(): string[] {
  return EMAIL_VARIABLE_CATEGORIES.flatMap(cat => 
    cat.variables.map(v => v.key)
  );
}

/**
 * Get variable info by key
 */
export function getVariableInfo(key: string): EmailVariable | undefined {
  for (const category of EMAIL_VARIABLE_CATEGORIES) {
    const variable = category.variables.find(v => v.key === key);
    if (variable) return variable;
  }
  return undefined;
}
