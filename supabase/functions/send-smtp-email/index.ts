import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isInternalRequest } from '../_shared/security.ts';

// Minify HTML to prevent Quoted-Printable encoding issues (=20 artifacts)
function minifyEmailHTML(html: string): string {
  return html
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  /** Optional plain-text alternative (recommended for Exchange deliverability). */
  text?: string;
  from?: string;
  replyTo?: string;

  /** Optional diagnostic metadata (safe + non-breaking). */
  emailType?: string;
  quoteId?: string;
  invoiceId?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

const DEFAULT_FROM_EMAIL = 'soultrainseatery@gmail.com';
const DEFAULT_FROM_DISPLAY = "Soul Train’s Eatery";
const DEFAULT_FROM = `${DEFAULT_FROM_DISPLAY} <${DEFAULT_FROM_EMAIL}>`;

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function logEmailEvent(params: {
  event_type: 'email_send_attempt' | 'email_send_success' | 'email_send_failure';
  to?: string;
  subject?: string;
  from?: string;
  replyTo?: string;
  emailType?: string;
  quoteId?: string;
  invoiceId?: string;
  correlationId?: string;
  resolvedFrom?: string;
  messageId?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const { event_type, ...rest } = params;
    await supabase.from('analytics_events').insert({
      event_type,
      entity_type: 'email',
      metadata: {
        ...rest,
        ts: new Date().toISOString(),
      },
    });
  } catch (e) {
    // Never block email sending if analytics logging fails
    console.warn('[send-smtp-email] Failed to write analytics_events', e);
  }
}

function stripHtmlToText(html: string): string {
  // Very small, dependency-free text fallback.
  // Goal: "real" readable text for Exchange, not perfect formatting.
  return html
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/?p\s*>/gi, '\n')
    .replace(/<\s*\/?div\s*>/gi, '\n')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Subject passed through as-is - library handles encoding for ASCII subjects
// Emojis removed from all subjects to prevent double-encoding issues

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let auditTo: string | undefined;
  let auditSubject: string | undefined;
  let auditFrom: string | undefined;
  let auditReplyTo: string | undefined;

  try {
    // SECURITY: Only allow internal edge function calls (server-to-server)
    // This prevents abuse of the email sending endpoint from external sources
    if (!isInternalRequest(req)) {
      console.warn('[send-smtp-email] Rejected external request - internal only');
      return new Response(
        JSON.stringify({ error: 'This endpoint is for internal use only', code: 'UNAUTHORIZED' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const {
      to,
      subject,
      html,
      text,
      from = DEFAULT_FROM,
      replyTo,
      emailType,
      quoteId,
      invoiceId,
      correlationId,
      metadata,
    }: EmailRequest = await req.json();
    auditTo = to;
    auditSubject = subject;
    auditFrom = from;
    auditReplyTo = replyTo;

    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, html');
    }

    // Normalize From header to ensure consistent branded display name.
    // If caller passes a bare email, upgrade it to "Soul Train’s Eatery <email>".
    const normalizedFrom = (() => {
      const trimmed = String(from || '').trim();
      if (!trimmed) return DEFAULT_FROM;
      const hasDisplayName = /<.+?>/.test(trimmed) && !/^<.+?>$/.test(trimmed);
      if (hasDisplayName) return trimmed;
      // Bare address or malformed display-name: enforce our standard.
      return `${DEFAULT_FROM_DISPLAY} <${trimmed.replace(/[<>]/g, '')}>`;
    })();

    await logEmailEvent({
      event_type: 'email_send_attempt',
      to,
      subject,
      from,
      replyTo,
      emailType,
      quoteId,
      invoiceId,
      correlationId,
      resolvedFrom: normalizedFrom,
      metadata,
    });

    // Get SMTP configuration from environment
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = Deno.env.get('SMTP_PORT');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      console.error('SMTP configuration missing:', { 
        hasHost: !!smtpHost, 
        hasPort: !!smtpPort, 
        hasUser: !!smtpUser, 
        hasPass: !!smtpPass 
      });
      throw new Error('SMTP not configured. Missing required environment variables.');
    }

    console.log(`Sending email via SMTP to: ${to}, subject: ${subject.substring(0, 50)}...`);

    // Extract display name and email from "Name <email>" format
    const extractEmailParts = (emailString: string): { name?: string; email: string } => {
      const match = emailString.match(/^(.+?)\s*<(.+?)>$/);
      if (match) {
        return { name: match[1].trim(), email: match[2].trim() };
      }
      return { email: emailString.trim() };
    };

    const fromParts = extractEmailParts(normalizedFrom);

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: parseInt(smtpPort, 10),
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPass,
        },
      },
    });

    // Minify HTML to prevent line-length issues causing =20 encoding
    const minifiedHtml = minifyEmailHTML(html);
    console.log(`HTML minified: ${html.length} -> ${minifiedHtml.length} chars`);

    // Build email message
    const emailMessage: any = {
      from: fromParts.name ? `${fromParts.name} <${fromParts.email}>` : fromParts.email,
      to: to,
      subject: subject,
      content: (text && String(text).trim().length > 0)
        ? String(text).trim()
        : stripHtmlToText(minifiedHtml) || "Please view this email in an HTML-capable email client.",
      html: minifiedHtml,
    };

    // Add reply-to if specified
    if (replyTo) {
      emailMessage.replyTo = replyTo;
    }

    // Send email
    await client.send(emailMessage);
    
    // Close connection
    await client.close();

    console.log(`Email sent successfully via SMTP to: ${to}`);

    const messageId = `smtp-${Date.now()}`;
    await logEmailEvent({
      event_type: 'email_send_success',
      to,
      subject,
      from,
      replyTo,
      emailType,
      quoteId,
      invoiceId,
      correlationId,
      resolvedFrom: normalizedFrom,
      messageId,
      metadata,
    });

    return new Response(JSON.stringify({ 
      success: true, 
      messageId,
      to,
      subject 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-smtp-email:', error);
    
    // Return sanitized error for security
    const safeMessage = error.message?.includes('SMTP') || error.message?.includes('Missing') 
      ? error.message 
      : 'Failed to send email via SMTP';

    // Best-effort audit log
    await logEmailEvent({
      event_type: 'email_send_failure',
      to: auditTo,
      subject: auditSubject,
      from: auditFrom,
      replyTo: auditReplyTo,
      errorMessage: safeMessage,
    });
    
    return new Response(
      JSON.stringify({ 
        error: safeMessage,
        code: 'SMTP_ERROR'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);