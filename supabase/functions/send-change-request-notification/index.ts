import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { BRAND_COLORS, EMAIL_STYLES, generateEmailHeader, generateFooter } from "../_shared/emailTemplates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Preheader helper
function generatePreheader(text: string): string {
  return `
    <div style="display:none;font-size:1px;color:#fefefe;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
      ${text}
    </div>
  `;
}

interface EmailNotificationRequest {
  to: string;
  customerName: string;
  eventName: string;
  action: 'approved' | 'rejected' | 'request_more_info';
  adminResponse?: string;
  costChange?: number;
  estimateLink?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, customerName, eventName, action, adminResponse, costChange, estimateLink }: EmailNotificationRequest = await req.json();

    console.log('Sending change request notification:', { to, customerName, eventName, action });

    const subject = generateSubject(action, eventName);
    const preheaderText = generatePreheaderText(action);
    const emailHtml = generateResponseEmail({ 
      customerName, 
      eventName, 
      action, 
      adminResponse, 
      costChange, 
      estimateLink,
      preheaderText 
    });

    const { error } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to,
        subject,
        html: emailHtml
      }
    });

    if (error) {
      console.error('Failed to send email notification:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('Email notification sent successfully to:', to);
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error in send-change-request-notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

function generateSubject(action: string, eventName: string): string {
  const actionMap = {
    approved: 'Approved - Review Updated Estimate',
    rejected: 'Update on Your Request',
    request_more_info: 'More Information Needed'
  };

  return `Change Request ${actionMap[action as keyof typeof actionMap]} - ${eventName}`;
}

function generatePreheaderText(action: string): string {
  const preheaderMap = {
    approved: "Your menu change request has been approved! View your updated estimate.",
    rejected: "Update on your menu change request - Let's discuss alternative options",
    request_more_info: "We need a bit more information to process your menu change request"
  };

  return preheaderMap[action as keyof typeof preheaderMap] + " - Soul Train's Eatery";
}

interface EmailOptions {
  customerName: string;
  eventName: string;
  action: 'approved' | 'rejected' | 'request_more_info';
  adminResponse?: string;
  costChange?: number;
  estimateLink?: string;
  preheaderText: string;
}

function generateResponseEmail(options: EmailOptions): string {
  const { customerName, eventName, action, adminResponse, costChange, estimateLink, preheaderText } = options;

  let statusMessage = '';
  let statusIcon = '';
  let statusBgColor = '';
  let nextSteps = '';
  let ctaButton = '';

  switch (action) {
    case 'approved':
      statusMessage = 'APPROVED';
      statusIcon = '✅';
      statusBgColor = '#d1fae5';
      nextSteps = `
        <p style="margin: 12px 0; line-height: 1.6; font-size: 16px;">Great news! We've approved your change request and updated your estimate.</p>
        ${costChange ? `
          <div style="background: #FFF5E6; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid ${BRAND_COLORS.gold};">
            <p style="margin: 0; font-size: 16px;"><strong>Price adjustment:</strong> ${costChange > 0 ? '+' : ''}$${(Math.abs(costChange) / 100).toFixed(2)}</p>
          </div>
        ` : ''}
        <p style="margin: 12px 0; line-height: 1.6; font-size: 16px;"><strong>View your updated estimate using your permanent portal link.</strong></p>
        <p style="color: #6b7280; font-size: 14px; margin: 15px 0;">
          💡 <em>Your estimate link remains the same - no new link needed!</em>
        </p>
      `;
        if (estimateLink) {
        ctaButton = `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${estimateLink}" class="btn btn-primary" role="button" aria-label="View your updated estimate" style="background: linear-gradient(135deg, ${BRAND_COLORS.crimson}, ${BRAND_COLORS.crimsonDark}); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; min-height: 48px; line-height: 1.4; font-size: 16px; box-shadow: 0 4px 12px rgba(220, 20, 60, 0.3); mso-padding-alt: 18px 40px;">
              View Updated Estimate
            </a>
            <p style="margin-top: 15px; color: #6b7280; font-size: 13px;">
              <span aria-hidden="true">🔗</span> Bookmark this link - it's your permanent estimate portal
            </p>
          </div>
        `;
      }
      break;
    case 'rejected':
      statusMessage = 'UNABLE TO ACCOMMODATE';
      statusIcon = '❌';
      statusBgColor = '#fee2e2';
      nextSteps = `
        <p style="margin: 12px 0; line-height: 1.6; font-size: 16px;">Unfortunately, we're unable to accommodate this specific change request at this time.</p>
        ${adminResponse ? `
          <div style="background: #FFF5E6; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid ${BRAND_COLORS.gold};">
            <p style="margin: 0 0 8px 0; font-weight: 600; font-size: 15px;">Reason:</p>
            <p style="margin: 0; font-size: 15px; color: #4b5563;">${adminResponse}</p>
          </div>
        ` : ''}
        <p style="margin: 12px 0; line-height: 1.6; font-size: 16px;">However, we'd love to discuss alternative options! Please call or email us to explore other possibilities.</p>
      `;
      break;
    case 'request_more_info':
      statusMessage = 'MORE INFORMATION NEEDED';
      statusIcon = '⚠️';
      statusBgColor = '#fed7aa';
      nextSteps = `
        <p style="margin: 12px 0; line-height: 1.6; font-size: 16px;">We need additional details to process your request. Please review our questions below and get back to us.</p>
        ${adminResponse ? `
          <div style="background: #FFF5E6; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid ${BRAND_COLORS.gold};">
            <p style="margin: 0 0 8px 0; font-weight: 600; font-size: 15px;">We need to know:</p>
            <p style="margin: 0; font-size: 15px; color: #4b5563;">${adminResponse}</p>
          </div>
        ` : ''}
      `;
      break;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Change Request ${action === 'approved' ? 'Approved' : action === 'rejected' ? 'Update' : 'Information Needed'} - ${eventName}</title>
      <style>${EMAIL_STYLES}</style>
      <style>
        /* Enhanced mobile responsiveness for change request emails */
        .status-card {
          background: ${statusBgColor};
          padding: 20px 16px;
          border-radius: 12px;
          margin: 25px 0;
          border-left: 4px solid ${BRAND_COLORS.gold};
        }
        
        .status-content {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .status-icon {
          font-size: 36px;
          min-width: 48px;
          text-align: center;
          line-height: 1;
        }
        
        .status-text {
          flex: 1;
          min-width: 200px;
        }
        
        /* Ultra-small devices (<360px) */
        @media only screen and (max-width: 360px) {
          .status-card {
            padding: 16px 12px;
          }
          
          .status-icon {
            font-size: 32px !important;
          }
          
          .status-content {
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }
          
          .btn {
            padding: 20px 16px !important;
            min-height: 52px !important;
            font-size: 16px !important;
          }
        }
        
        /* Mobile full-width buttons */
        @media only screen and (max-width: 480px) {
          .btn {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 18px 20px !important;
            font-size: 17px !important;
            margin: 10px 0 !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
      ${generatePreheader(preheaderText)}
      
      <div class="email-container" role="main" style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        ${generateEmailHeader("Soul Train's Eatery")}
        
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hello <span>${customerName}</span>,</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 12px 0;">
            We've reviewed your change request for <strong>${eventName}</strong>.
          </p>
          
          <!-- Status Card -->
          <section class="status-card" aria-labelledby="status-heading">
            <div class="status-content">
              <div class="status-icon" aria-hidden="true">${statusIcon}</div>
              <div class="status-text">
                <h3 id="status-heading" style="margin: 0 0 8px 0; color: #374151; font-size: 18px; line-height: 1.3;">
                  Request Status: <span style="color: ${BRAND_COLORS.crimson}; font-weight: bold;">${statusMessage}</span>
                </h3>
              </div>
            </div>
          </section>
          
          <!-- Next Steps -->
          <div style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 24px;">
            ${nextSteps}
          </div>
          
          <!-- CTA Button -->
          ${ctaButton}
          
          <!-- Contact Info -->
          <aside style="margin-top: 40px; padding-top: 25px; border-top: 2px solid #e5e7eb;">
            <p style="margin: 0 0 15px 0; color: #1f2937; font-weight: bold; font-size: 16px;">Need to discuss this?</p>
            <address style="font-style: normal;">
              <p style="margin: 5px 0; color: #4b5563; font-size: 15px;">
                <span aria-hidden="true">📞</span> Call us at <a href="tel:+18439700265" style="color: ${BRAND_COLORS.crimson}; text-decoration: none; font-weight: bold;" aria-label="Call us at (843) 970-0265">(843) 970-0265</a>
              </p>
              <p style="margin: 5px 0; color: #4b5563; font-size: 15px;">
                <span aria-hidden="true">✉️</span> Email us at <a href="mailto:soultrainseatery@gmail.com" style="color: ${BRAND_COLORS.crimson}; text-decoration: none; font-weight: bold;" aria-label="Email us at soultrainseatery@gmail.com">soultrainseatery@gmail.com</a>
              </p>
            </address>
          </aside>
        </div>
        
        ${generateFooter()}
        
      </div>
    </body>
    </html>
  `;
}

serve(handler);
