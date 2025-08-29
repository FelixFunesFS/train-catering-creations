# Stripe Invoice Integration Plan for Soul Train's Eatery

## Overview
This document outlines the comprehensive plan for integrating Stripe invoicing with the quote management system to track customers and handle payments seamlessly.

## Phase 1: Database Schema Enhancement

### New Tables to Create:

1. **customers** - Links quote requests to Stripe customers
   ```sql
   CREATE TABLE public.customers (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
     stripe_customer_id TEXT UNIQUE NOT NULL,
     email TEXT NOT NULL,
     name TEXT NOT NULL,
     phone TEXT,
     address JSONB, -- {street, city, state, zip}
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   ```

2. **invoices** - Track invoices generated from quotes
   ```sql
   CREATE TABLE public.invoices (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     quote_request_id UUID REFERENCES quote_requests(id) NOT NULL,
     customer_id UUID REFERENCES customers(id) NOT NULL,
     stripe_invoice_id TEXT UNIQUE NOT NULL,
     stripe_payment_intent_id TEXT,
     invoice_number TEXT NOT NULL,
     amount_total INTEGER NOT NULL, -- in cents
     amount_due INTEGER NOT NULL,
     currency TEXT DEFAULT 'usd',
     status TEXT NOT NULL, -- draft, open, paid, void, uncollectible
     due_date DATE,
     invoice_url TEXT,
     hosted_invoice_url TEXT,
     pdf_url TEXT,
     payment_url TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   ```

3. **invoice_line_items** - Detailed breakdown of invoice items
   ```sql
   CREATE TABLE public.invoice_line_items (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
     stripe_line_item_id TEXT,
     description TEXT NOT NULL,
     quantity INTEGER DEFAULT 1,
     unit_amount INTEGER NOT NULL, -- in cents
     total_amount INTEGER NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   ```

4. **payment_history** - Track all payment events
   ```sql
   CREATE TABLE public.payment_history (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     invoice_id UUID REFERENCES invoices(id) NOT NULL,
     stripe_payment_id TEXT,
     amount INTEGER NOT NULL,
     currency TEXT DEFAULT 'usd',
     status TEXT NOT NULL, -- succeeded, pending, failed, cancelled
     payment_method TEXT, -- card, bank_transfer, etc.
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   ```

## Phase 2: Edge Functions for Stripe Integration

### 1. Customer Management Functions

#### `create-stripe-customer`
- Creates Stripe customer from quote request data
- Links to existing customer if found by email
- Updates local customers table

#### `sync-customer-data`
- Syncs customer data between Stripe and local database
- Handles customer updates and deletions

### 2. Invoice Management Functions

#### `generate-invoice-from-quote`
- Converts quote request to Stripe invoice
- Calculates pricing based on menu items and services
- Creates line items for each service component
- Supports custom pricing rules

#### `send-invoice`
- Sends invoice to customer via Stripe
- Optionally adds custom message
- Tracks sending status

#### `update-invoice-status`
- Webhook handler for invoice status updates
- Updates local database when payments succeed/fail
- Triggers follow-up actions (confirmation emails, etc.)

### 3. Payment Tracking Functions

#### `handle-payment-webhooks`
- Processes Stripe webhooks for payments
- Updates payment history
- Triggers business logic (mark quote as paid, send confirmation)

#### `get-payment-status`
- Real-time payment status checking
- Customer payment portal access

## Phase 3: UI Components Enhancement

### 1. Enhanced Quote Detail Modal

#### New "Billing" Tab
- Customer billing information display/edit
- Invoice generation controls
- Payment status tracking
- Invoice preview and download

#### Customer Information Section
- Stripe customer ID linking
- Billing address management
- Payment method on file display

### 2. Invoice Management Interface

#### Invoice Generation Form
```typescript
interface InvoiceGenerationForm {
  customPricing: boolean;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitAmount: number;
  }>;
  dueDate: Date;
  customMessage: string;
  taxRate?: number;
  discountPercent?: number;
}
```

#### Invoice Status Dashboard
- All invoices for a quote
- Payment status tracking
- Customer payment history
- Resend invoice capabilities

### 3. Customer Portal Integration

#### Customer Self-Service
- View all invoices
- Make payments
- Download receipts
- Update payment methods

## Phase 4: Business Logic Integration

### 1. Pricing Rules Engine

#### Service Type Pricing
```typescript
const PRICING_RULES = {
  'full-service': {
    baseRate: 25.00, // per person
    setupFee: 150.00,
    serviceCharge: 0.18 // 18%
  },
  'delivery-setup': {
    baseRate: 18.00,
    deliveryFee: 75.00,
    serviceCharge: 0.15
  },
  'delivery-only': {
    baseRate: 15.00,
    deliveryFee: 50.00,
    serviceCharge: 0.10
  }
};
```

#### Menu Item Pricing
- Dynamic pricing based on guest count
- Premium protein upcharges
- Dietary restriction accommodations

### 2. Automated Workflows

#### Quote to Invoice Pipeline
1. Quote confirmed → Generate draft invoice
2. Customer approval → Finalize and send invoice
3. Payment received → Mark quote as paid
4. Event completion → Send thank you + review request

#### Payment Reminders
- Automated reminder emails
- Escalation for overdue payments
- Custom messaging based on event proximity

## Phase 5: Reporting and Analytics

### 1. Financial Dashboard

#### Revenue Tracking
- Monthly/quarterly revenue reports
- Payment method preferences
- Average order values
- Outstanding invoice tracking

#### Customer Analytics
- Repeat customer identification
- Customer lifetime value
- Payment behavior patterns

### 2. Quote to Cash Metrics

#### Conversion Tracking
- Quote response rates
- Quote to payment conversion
- Average time to payment
- Payment failure rates

## Phase 6: Implementation Timeline

### Week 1-2: Database Setup
- Create database tables and relationships
- Set up RLS policies
- Create database functions and triggers

### Week 3-4: Core Edge Functions
- Customer management functions
- Basic invoice generation
- Payment webhook handling

### Week 5-6: UI Integration
- Add Billing tab to Quote Detail Modal
- Invoice generation interface
- Payment status displays

### Week 7-8: Advanced Features
- Customer portal integration
- Automated workflows
- Pricing rules engine

### Week 9-10: Testing and Refinement
- End-to-end testing
- Stripe webhook testing
- Performance optimization

## Security Considerations

### 1. Data Protection
- PCI compliance for payment data
- Secure webhook endpoints
- Customer data encryption

### 2. Access Control
- Admin-only invoice generation
- Customer-specific portal access
- Audit trails for financial operations

### 3. Error Handling
- Payment failure recovery
- Webhook retry mechanisms
- Graceful degradation

## Integration Benefits

### For Soul Train's Eatery
- Streamlined payment collection
- Professional invoice presentation
- Automated follow-up workflows
- Detailed financial reporting

### For Customers
- Professional payment experience
- Multiple payment options
- Self-service portal access
- Automatic receipt generation

## Next Steps

1. **Gather Requirements**: Confirm pricing structure and business rules
2. **Set Up Stripe Account**: Configure products, tax rates, and webhook endpoints  
3. **Implement Database Changes**: Create tables and relationships
4. **Develop Core Functions**: Start with customer and invoice management
5. **Integrate UI Components**: Add billing functionality to existing interfaces

This comprehensive integration will transform the quote management system into a full-featured billing and payment platform while maintaining the family-run, personal touch that Soul Train's Eatery is known for.