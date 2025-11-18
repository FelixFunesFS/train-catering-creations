/**
 * Client-Side Email Template Renderer
 * Renders email HTML templates with dynamic variables
 */

import { extractVariables, parseTemplate, VariableData } from '@/utils/emailVariables';

export type EmailType = 'estimate' | 'contract' | 'payment_request' | 'event_confirmation' | 'thank_you_feedback';

interface RenderOptions {
  emailType: EmailType;
  data: VariableData;
  customMessage?: string;
  customSubject?: string;
}

/**
 * Main function to render email HTML
 */
export function renderEmailHTML(options: RenderOptions): string {
  const { emailType, data, customMessage } = options;
  const variables = extractVariables(data);
  
  const baseStyles = getBaseStyles();
  const header = renderHeader();
  const footer = renderFooter();
  
  let bodyContent = '';
  
  switch (emailType) {
    case 'estimate':
      bodyContent = renderEstimateBody(variables, data.invoice, customMessage);
      break;
    case 'contract':
      bodyContent = renderContractBody(variables, customMessage);
      break;
    case 'payment_request':
      bodyContent = renderPaymentRequestBody(variables, data.invoice, customMessage);
      break;
    case 'event_confirmation':
      bodyContent = renderEventConfirmationBody(variables, customMessage);
      break;
    case 'thank_you_feedback':
      bodyContent = renderThankYouBody(variables, customMessage);
      break;
  }
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soul Train's Eatery</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="email-container">
          ${header}
          ${bodyContent}
          ${footer}
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate email subject line
 */
export function generateSubject(emailType: EmailType, data: VariableData, customSubject?: string): string {
  if (customSubject) return customSubject;
  
  const variables = extractVariables(data);
  
  const subjects: Record<EmailType, string> = {
    estimate: `Your Estimate - Soul Train's Eatery`,
    contract: `Your Contract is Ready for Signature - ${variables.event_name}`,
    payment_request: `Payment Request - ${variables.event_name}`,
    event_confirmation: `Event Confirmed: ${variables.event_name}`,
    thank_you_feedback: `Thank You for Choosing Soul Train's Eatery!`
  };
  
  return subjects[emailType];
}

// ============= TEMPLATE SECTIONS =============

function getBaseStyles(): string {
  return `
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333333;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #D97706 0%, #EA580C 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 5px 0 0 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #1a1a1a;
    }
    .custom-message {
      background-color: #FFF7ED;
      border-left: 4px solid #D97706;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .details-box {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-label {
      font-weight: 600;
      color: #6b7280;
    }
    .details-value {
      color: #1f2937;
      text-align: right;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #D97706 0%, #EA580C 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      margin: 25px 0;
      text-align: center;
    }
    .footer {
      background-color: #1f2937;
      color: #d1d5db;
      padding: 30px 20px;
      text-align: center;
      font-size: 14px;
    }
    .footer-links {
      margin: 15px 0;
    }
    .footer-links a {
      color: #D97706;
      text-decoration: none;
      margin: 0 10px;
    }
    .total-highlight {
      background-color: #FFF7ED;
      padding: 15px;
      border-radius: 8px;
      font-size: 20px;
      font-weight: 700;
      color: #D97706;
      text-align: center;
      margin: 25px 0;
    }
  `;
}

function renderHeader(): string {
  return `
    <div class="header">
      <h1>🚂 Soul Train's Eatery</h1>
      <p>Charleston's Trusted Catering Partner</p>
    </div>
  `;
}

function renderFooter(): string {
  return `
    <div class="footer">
      <p><strong>Soul Train's Eatery</strong></p>
      <p>Charleston's Lowcountry | Authentic Southern Cooking</p>
      <div class="footer-links">
        <a href="tel:+18439700265">(843) 970-0265</a>
        <span>|</span>
        <a href="mailto:soultrainseatery@gmail.com">soultrainseatery@gmail.com</a>
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
        Family-run business bringing people together around exceptional food since [year]
      </p>
    </div>
  `;
}

// ============= EMAIL BODY TEMPLATES =============

function renderEstimateBody(variables: Record<string, string>, invoice: any, customMessage?: string): string {
  return `
    <div class="content">
      <p class="greeting">Dear ${variables.customer_name},</p>
      
      ${customMessage ? `<div class="custom-message">${parseTemplate(customMessage, variables)}</div>` : ''}
      
      <p>Thank you for considering Soul Train's Eatery for your upcoming <strong>${variables.event_name}</strong>. We're excited about the opportunity to cater your special event!</p>
      
      <p>Our family-run business takes pride in bringing people together around exceptional Southern food. Below is your detailed estimate.</p>
      
      <div class="details-box">
        <h3 style="margin-top: 0; color: #D97706;">Event Details</h3>
        <div class="details-row">
          <span class="details-label">Event:</span>
          <span class="details-value">${variables.event_name}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Date:</span>
          <span class="details-value">${variables.event_date} at ${variables.event_time}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Location:</span>
          <span class="details-value">${variables.event_location}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Guests:</span>
          <span class="details-value">${variables.guest_count}</span>
        </div>
      </div>
      
      <div class="total-highlight">
        Estimated Total: ${variables.invoice_total}
      </div>
      
      <p style="text-align: center;">
        <a href="#" class="cta-button">View Full Estimate</a>
      </p>
      
      <p>If you have any questions or would like to make adjustments, please don't hesitate to reach out. We're here to make your event memorable and delicious.</p>
      
      <p style="margin-top: 30px;">
        <strong>Best regards,</strong><br>
        Soul Train's Eatery Team<br>
        (843) 970-0265
      </p>
    </div>
  `;
}

function renderContractBody(variables: Record<string, string>, customMessage?: string): string {
  return `
    <div class="content">
      <p class="greeting">Dear ${variables.customer_name},</p>
      
      ${customMessage ? `<div class="custom-message">${parseTemplate(customMessage, variables)}</div>` : ''}
      
      <p>Your catering contract for <strong>${variables.event_name}</strong> is ready for your review and signature.</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="#" class="cta-button">Review & Sign Contract</a>
      </p>
      
      <p>Please review the contract carefully. Once signed, we'll proceed with finalizing all the details for your special event.</p>
    </div>
  `;
}

function renderPaymentRequestBody(variables: Record<string, string>, invoice: any, customMessage?: string): string {
  return `
    <div class="content">
      <p class="greeting">Dear ${variables.customer_name},</p>
      
      ${customMessage ? `<div class="custom-message">${parseTemplate(customMessage, variables)}</div>` : ''}
      
      <p>This is a friendly reminder that payment is now due for your upcoming event: <strong>${variables.event_name}</strong>.</p>
      
      <div class="details-box">
        <div class="details-row">
          <span class="details-label">Amount Due:</span>
          <span class="details-value" style="font-size: 18px; font-weight: 700; color: #D97706;">${variables.invoice_total}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Due Date:</span>
          <span class="details-value">${variables.due_date}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Invoice Number:</span>
          <span class="details-value">${variables.invoice_number}</span>
        </div>
      </div>
      
      <p style="text-align: center;">
        <a href="#" class="cta-button">Make Payment</a>
      </p>
      
      <p>Thank you for your business. We look forward to serving you!</p>
    </div>
  `;
}

function renderEventConfirmationBody(variables: Record<string, string>, customMessage?: string): string {
  return `
    <div class="content">
      <p class="greeting">Dear ${variables.customer_name},</p>
      
      ${customMessage ? `<div class="custom-message">${parseTemplate(customMessage, variables)}</div>` : ''}
      
      <p>We're thrilled to confirm that everything is set for your event: <strong>${variables.event_name}</strong>!</p>
      
      <div class="details-box">
        <h3 style="margin-top: 0; color: #D97706;">Confirmed Event Details</h3>
        <div class="details-row">
          <span class="details-label">Date & Time:</span>
          <span class="details-value">${variables.event_date} at ${variables.event_time}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Location:</span>
          <span class="details-value">${variables.event_location}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Guest Count:</span>
          <span class="details-value">${variables.guest_count}</span>
        </div>
      </div>
      
      <p>Our team will arrive on time to ensure everything is perfect for your special day. If you have any last-minute questions or changes, please contact us immediately.</p>
      
      <p style="margin-top: 30px;">
        <strong>See you soon!</strong><br>
        Soul Train's Eatery Team
      </p>
    </div>
  `;
}

function renderThankYouBody(variables: Record<string, string>, customMessage?: string): string {
  return `
    <div class="content">
      <p class="greeting">Dear ${variables.customer_name},</p>
      
      ${customMessage ? `<div class="custom-message">${parseTemplate(customMessage, variables)}</div>` : ''}
      
      <p>Thank you for choosing Soul Train's Eatery for <strong>${variables.event_name}</strong>. It was our pleasure to serve you and your guests!</p>
      
      <p>We hope the food exceeded your expectations and contributed to making your event truly memorable.</p>
      
      <p>We'd love to hear about your experience! Your feedback helps us continue to provide exceptional service to the Charleston community.</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="#" class="cta-button">Share Your Feedback</a>
      </p>
      
      <p>We look forward to serving you again in the future!</p>
      
      <p style="margin-top: 30px;">
        <strong>With gratitude,</strong><br>
        Soul Train's Eatery Team
      </p>
    </div>
  `;
}
