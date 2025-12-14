/**
 * SYNC: PDF Estimate/Invoice Generation
 * 
 * This edge function generates PDF documents for estimates and invoices.
 * Keep in sync with:
 * - src/components/customer/CustomerEstimateView.tsx (portal display)
 * - supabase/functions/send-customer-portal-email/index.ts (email content)
 * 
 * See CUSTOMER_DISPLAY_CHECKLIST.md for full sync requirements.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import fontkit from "https://esm.sh/@pdf-lib/fontkit@1.1.1";
import { getTermsForPDF } from "../_shared/termsAndConditions.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-PDF] ${step}${detailsStr}`);
};

// Color constants (RGB 0-1 scale)
const CRIMSON = rgb(0.863, 0.078, 0.235); // #DC143C
const GOLD = rgb(1, 0.843, 0); // #FFD700
const DARK_GRAY = rgb(0.2, 0.2, 0.2);
const MEDIUM_GRAY = rgb(0.4, 0.4, 0.4);
const LIGHT_GRAY = rgb(0.9, 0.9, 0.9);
const WHITE = rgb(1, 1, 1);
const BLUE = rgb(0.1, 0.3, 0.6);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("PDF generation started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { invoice_id } = await req.json();
    if (!invoice_id) throw new Error("invoice_id is required");

    logStep("Fetching invoice data", { invoice_id });

    // Fetch complete invoice data with relationships
    const { data: invoiceData, error: invoiceError } = await supabaseClient
      .from("invoices")
      .select(`
        *,
        customers (id, name, email, phone, address),
        quote_requests (
          id, event_name, event_date, location, service_type, guest_count, 
          special_requests, contact_name, email, start_time, proteins, sides,
          appetizers, desserts, drinks, vegetarian_entrees, guest_count_with_restrictions,
          compliance_level, requires_po_number
        )
      `)
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoiceData) {
      logStep("Invoice not found", { error: invoiceError });
      throw new Error("Invoice not found");
    }

    // Fetch line items
    const { data: lineItems, error: lineItemsError } = await supabaseClient
      .from("invoice_line_items")
      .select("*")
      .eq("invoice_id", invoice_id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (lineItemsError) {
      throw new Error("Failed to fetch line items");
    }

    // Fetch payment milestones
    const { data: milestones } = await supabaseClient
      .from("payment_milestones")
      .select("*")
      .eq("invoice_id", invoice_id)
      .order("due_date", { ascending: true });

    logStep("Data fetched successfully", { 
      lineItemsCount: lineItems?.length || 0,
      milestonesCount: milestones?.length || 0,
      invoiceNumber: invoiceData.invoice_number 
    });

    const quote = invoiceData.quote_requests;
    const customer = invoiceData.customers;
    const isGovernment = quote?.compliance_level === 'government' || quote?.requires_po_number;

    // Format currency function
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount / 100);
    };

    // Format date
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    // Format short date
    const formatShortDate = (dateStr: string) => {
      if (!dateStr) return 'TBD';
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    // Format time
    const formatTime = (timeStr: string) => {
      if (!timeStr) return '';
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    // Format service type
    const formatServiceType = (type: string) => {
      const types: Record<string, string> = {
        'full-service': 'Full Service',
        'delivery-only': 'Delivery Only',
        'delivery-setup': 'Delivery + Setup',
        'drop-off': 'Drop-Off'
      };
      return types[type] || type;
    };

    // Format milestone type
    const formatMilestoneType = (type: string) => {
      const types: Record<string, string> = {
        'booking_deposit': 'Booking Deposit',
        'midpoint': 'Midpoint Payment',
        'final': 'Final Payment',
        'full_payment': 'Full Payment',
        'deposit': 'Deposit',
        'balance': 'Balance Due'
      };
      return types[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    // Sanitize text for PDF (remove newlines, emojis, and control characters that WinAnsi can't encode)
    const sanitizeText = (text: string | null | undefined): string => {
      if (!text) return '';
      return text
        .replace(/[\n\r\t]/g, ' ')
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
        .replace(/[\u{2600}-\u{26FF}]/gu, '')
        .replace(/[\u{2700}-\u{27BF}]/gu, '')
        .replace(/[\u{2B50}]/gu, '*')
        .replace(/[^\x00-\x7F]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Register fontkit for custom fonts
    pdfDoc.registerFontkit(fontkit);
    
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Try to load Dancing Script font for brand name
    let dancingScript = helveticaBold; // Fallback to bold
    try {
      const fontUrl = 'https://fonts.gstatic.com/s/dancingscript/v25/If2RXTr6YS-zF4S-kcSWSVi_szLgiuE.ttf';
      const fontResponse = await fetch(fontUrl);
      if (fontResponse.ok) {
        const fontBytes = new Uint8Array(await fontResponse.arrayBuffer());
        dancingScript = await pdfDoc.embedFont(fontBytes);
        logStep("Dancing Script font loaded successfully");
      }
    } catch (fontError) {
      logStep("Dancing Script font failed to load, using fallback", { error: String(fontError) });
    }

    // Try to load logo
    let logoImage: any = null;
    let logoDims = { width: 0, height: 0 };
    try {
      const logoUrl = 'https://qptprrqjlcvfkhfdnnoa.lovableproject.com/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png';
      const logoResponse = await fetch(logoUrl);
      if (logoResponse.ok) {
        const logoBytes = new Uint8Array(await logoResponse.arrayBuffer());
        logoImage = await pdfDoc.embedPng(logoBytes);
        const targetHeight = 45;
        const scale = targetHeight / logoImage.height;
        logoDims = { width: logoImage.width * scale, height: targetHeight };
        logStep("Logo loaded successfully", logoDims);
      }
    } catch (logoError) {
      logStep("Logo failed to load", { error: String(logoError) });
    }

    // Page settings - optimized for compact layout
    const pageWidth = 612; // 8.5 inches
    const pageHeight = 792; // 11 inches
    const margin = 40; // Reduced margin
    const contentWidth = pageWidth - (margin * 2);
    
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    // Helper functions for drawing
    const drawText = (rawText: string, x: number, yPos: number, options: { 
      font?: any, size?: number, color?: any, maxWidth?: number 
    } = {}) => {
      const text = sanitizeText(rawText);
      if (!text) return 0;
      
      const font = options.font || helvetica;
      const size = options.size || 9;
      const color = options.color || DARK_GRAY;
      
      if (options.maxWidth) {
        const words = text.split(' ');
        let line = '';
        let currentY = yPos;
        
        for (const word of words) {
          const testLine = line + (line ? ' ' : '') + word;
          const testWidth = font.widthOfTextAtSize(testLine, size);
          
          if (testWidth > options.maxWidth && line) {
            page.drawText(line, { x, y: currentY, size, font, color });
            line = word;
            currentY -= size + 1;
          } else {
            line = testLine;
          }
        }
        if (line) {
          page.drawText(line, { x, y: currentY, size, font, color });
          currentY -= size + 1;
        }
        return yPos - currentY;
      } else {
        page.drawText(text, { x, y: yPos, size, font, color });
        return size + 1;
      }
    };

    const drawLine = (x1: number, yPos: number, x2: number, color = LIGHT_GRAY, thickness = 1) => {
      page.drawLine({ start: { x: x1, y: yPos }, end: { x: x2, y: yPos }, thickness, color });
    };

    // === PAGE 1 HEADER ===
    const headerHeight = 55;
    page.drawRectangle({ x: 0, y: pageHeight - headerHeight, width: pageWidth, height: headerHeight, color: CRIMSON });
    
    // Draw logo if available
    let textStartX = margin;
    if (logoImage) {
      page.drawImage(logoImage, { 
        x: margin, 
        y: pageHeight - headerHeight + 5, 
        width: logoDims.width, 
        height: logoDims.height 
      });
      textStartX = margin + logoDims.width + 10;
    }
    
    // Company name with Dancing Script
    drawText("Soul Train's Eatery", textStartX, pageHeight - 30, { font: dancingScript, size: 20, color: WHITE });
    drawText("Authentic Southern Catering", textStartX, pageHeight - 45, { size: 8, color: rgb(1, 0.9, 0.9) });
    
    // Contact info on right
    const contactX = pageWidth - margin - 130;
    drawText("(843) 970-0265", contactX, pageHeight - 28, { size: 8, color: WHITE });
    drawText("soultrainseatery@gmail.com", contactX, pageHeight - 40, { size: 8, color: WHITE });
    
    y = pageHeight - headerHeight - 10;
    
    // Title row
    page.drawRectangle({ x: margin, y: y - 16, width: 130, height: 20, color: rgb(0.95, 0.95, 0.95) });
    drawText("CATERING ESTIMATE", margin + 8, y - 11, { font: helveticaBold, size: 10, color: CRIMSON });
    
    const estNumText = `#${invoiceData.invoice_number || 'DRAFT'}`;
    const estNumWidth = helveticaBold.widthOfTextAtSize(estNumText, 12);
    drawText(estNumText, pageWidth - margin - estNumWidth, y - 10, { font: helveticaBold, size: 12, color: CRIMSON });
    
    y -= 28;
    drawLine(margin, y, pageWidth - margin, GOLD, 2);
    y -= 15;

    // === CUSTOMER & EVENT INFO (2 columns, compact) ===
    const col1X = margin;
    const col2X = margin + contentWidth / 2 + 10;
    const colWidth = contentWidth / 2 - 10;

    // Customer column
    drawText("BILL TO", col1X, y, { font: helveticaBold, size: 8, color: MEDIUM_GRAY });
    y -= 11;
    drawText(customer?.name || quote?.contact_name || '', col1X, y, { font: helveticaBold, size: 10 });
    y -= 11;
    if (customer?.email || quote?.email) {
      drawText(customer?.email || quote?.email, col1X, y, { size: 9 });
      y -= 10;
    }
    if (customer?.phone) {
      drawText(customer?.phone, col1X, y, { size: 9 });
      y -= 10;
    }

    // Event column
    let eventY = y + 32;
    drawText("EVENT DETAILS", col2X, eventY, { font: helveticaBold, size: 8, color: MEDIUM_GRAY });
    eventY -= 11;
    drawText(quote?.event_name || 'Event', col2X, eventY, { font: helveticaBold, size: 10 });
    eventY -= 11;
    if (quote?.event_date) {
      const dateTimeStr = quote?.start_time 
        ? `${formatDate(quote.event_date)} at ${formatTime(quote.start_time)}`
        : formatDate(quote.event_date);
      drawText(dateTimeStr, col2X, eventY, { size: 9 });
      eventY -= 10;
    }
    if (quote?.location) {
      const locHeight = drawText(quote.location, col2X, eventY, { size: 9, maxWidth: colWidth - 20 });
      eventY -= locHeight;
    }
    if (quote?.guest_count) {
      drawText(`${quote.guest_count} Guests | ${formatServiceType(quote.service_type)}`, col2X, eventY, { size: 9 });
      eventY -= 10;
    }

    y = Math.min(y, eventY) - 10;

    // Government badge if applicable
    if (isGovernment) {
      page.drawRectangle({ x: margin, y: y - 14, width: contentWidth, height: 18, color: rgb(0.93, 0.95, 1) });
      drawText("Government Contract - Tax Exempt | Net 30 Payment Terms", margin + 8, y - 9, { 
        font: helveticaBold, size: 9, color: BLUE 
      });
      y -= 22;
    }

    drawLine(margin, y, pageWidth - margin);
    y -= 12;

    // === LINE ITEMS TABLE ===
    drawText("SERVICES & ITEMS", margin, y, { font: helveticaBold, size: 10, color: CRIMSON });
    y -= 14;

    // Table header
    const descCol = margin;
    const qtyCol = margin + contentWidth - 150;
    const priceCol = margin + contentWidth - 100;
    const totalCol = margin + contentWidth - 50;

    page.drawRectangle({ x: margin, y: y - 14, width: contentWidth, height: 18, color: LIGHT_GRAY });
    drawText("Description", descCol + 4, y - 11, { font: helveticaBold, size: 8 });
    drawText("Qty", qtyCol, y - 11, { font: helveticaBold, size: 8 });
    drawText("Unit", priceCol, y - 11, { font: helveticaBold, size: 8 });
    drawText("Total", totalCol, y - 11, { font: helveticaBold, size: 8 });
    y -= 20;

    // Line items (compact) - vertically centered text
    const rowHeight = 14;
    const fontSize = 9;
    const textOffset = (rowHeight - fontSize) / 2 + fontSize - 2; // Center text vertically
    
    for (const item of (lineItems || [])) {
      const title = item.title || 'Item';
      const rowY = y - textOffset;
      drawText(title, descCol + 4, rowY, { font: helveticaBold, size: fontSize });
      drawText(item.quantity.toString(), qtyCol, rowY, { size: fontSize });
      drawText(formatCurrency(item.unit_price), priceCol, rowY, { size: fontSize });
      drawText(formatCurrency(item.total_price), totalCol, rowY, { font: helveticaBold, size: fontSize });
      y -= rowHeight;
      
      // Description (wrapped, smaller)
      if (item.description) {
        const descHeight = drawText(item.description, descCol + 8, y, { 
          size: 8, color: MEDIUM_GRAY, maxWidth: qtyCol - descCol - 20 
        });
        y -= descHeight + 2;
      }
      
      y -= 4;
      drawLine(margin, y, pageWidth - margin);
      y -= 6;
    }

    // === TOTALS (compact) ===
    y -= 6;
    const totalsX = margin + contentWidth - 140;
    const totalsValueX = margin + contentWidth - 50;

    drawText("Subtotal:", totalsX, y, { size: 9 });
    drawText(formatCurrency(invoiceData.subtotal), totalsValueX, y, { size: 9 });
    y -= 12;

    if (invoiceData.discount_amount && invoiceData.discount_amount > 0) {
      const discountText = invoiceData.discount_description || 'Discount';
      drawText(`${discountText}:`, totalsX, y, { size: 9, color: rgb(0, 0.5, 0) });
      drawText(`-${formatCurrency(invoiceData.discount_amount)}`, totalsValueX, y, { size: 9, color: rgb(0, 0.5, 0) });
      y -= 12;
    }

    if (invoiceData.tax_amount && invoiceData.tax_amount > 0) {
      drawText("Tax (9%):", totalsX, y, { size: 9 });
      drawText(formatCurrency(invoiceData.tax_amount), totalsValueX, y, { size: 9 });
      y -= 12;
    } else if (isGovernment) {
      drawText("Tax:", totalsX, y, { size: 9 });
      drawText("Exempt", totalsValueX, y, { size: 9, color: BLUE });
      y -= 12;
    }

    drawLine(totalsX - 10, y + 2, pageWidth - margin, CRIMSON, 1.5);
    y -= 6;
    drawText("TOTAL:", totalsX, y, { font: helveticaBold, size: 11 });
    drawText(formatCurrency(invoiceData.total_amount), totalsValueX - 10, y, { font: helveticaBold, size: 12, color: CRIMSON });
    y -= 18;

    // === NOTES (compact) ===
    if (invoiceData.notes) {
      drawText("NOTES", margin, y, { font: helveticaBold, size: 9, color: CRIMSON });
      y -= 10;
      const notesHeight = drawText(invoiceData.notes, margin, y, { size: 8, maxWidth: contentWidth, color: MEDIUM_GRAY });
      y -= notesHeight + 10;
    }

    // === PAYMENT SCHEDULE (compact, inline on page 1) ===
    if (milestones && milestones.length > 0) {
      drawLine(margin, y, pageWidth - margin, GOLD, 1);
      y -= 12;
      
      drawText("PAYMENT SCHEDULE", margin, y, { font: helveticaBold, size: 10, color: CRIMSON });
      y -= 14;

      // Compact payment table
      page.drawRectangle({ x: margin, y: y - 10, width: contentWidth, height: 12, color: CRIMSON });
      drawText("Payment", margin + 4, y - 7, { font: helveticaBold, size: 7, color: WHITE });
      drawText("%", margin + contentWidth - 180, y - 7, { font: helveticaBold, size: 7, color: WHITE });
      drawText("Amount", margin + contentWidth - 130, y - 7, { font: helveticaBold, size: 7, color: WHITE });
      drawText("Due Date", margin + contentWidth - 70, y - 7, { font: helveticaBold, size: 7, color: WHITE });
      y -= 14;

      for (const milestone of milestones) {
        const isPaid = milestone.status === 'paid';
        const rowColor = isPaid ? rgb(0.95, 1, 0.95) : WHITE;
        
        page.drawRectangle({ x: margin, y: y - 10, width: contentWidth, height: 14, color: rowColor });
        
        drawText(formatMilestoneType(milestone.milestone_type), margin + 4, y - 6, { 
          font: helveticaBold, size: 8, color: isPaid ? rgb(0, 0.5, 0) : DARK_GRAY 
        });
        drawText(`${milestone.percentage}%`, margin + contentWidth - 180, y - 6, { size: 8 });
        drawText(formatCurrency(milestone.amount_cents), margin + contentWidth - 130, y - 6, { font: helveticaBold, size: 8 });
        drawText(formatShortDate(milestone.due_date), margin + contentWidth - 70, y - 6, { size: 8 });
        
        if (isPaid) {
          const paidWidth = helveticaBold.widthOfTextAtSize("PAID", 6);
          page.drawRectangle({ x: pageWidth - margin - paidWidth - 6, y: y - 8, width: paidWidth + 4, height: 10, color: rgb(0, 0.6, 0) });
          drawText("PAID", pageWidth - margin - paidWidth - 4, y - 5, { font: helveticaBold, size: 6, color: WHITE });
        }
        
        y -= 16;
      }
      y -= 6;
    }

    // === PAGE 1 FOOTER ===
    drawLine(margin, y, pageWidth - margin);
    y -= 12;
    drawText("Thank you for choosing Soul Train's Eatery!", margin, y, { font: helveticaBold, size: 9, color: CRIMSON });
    y -= 10;
    drawText("This estimate is valid for 30 days. See page 2 for complete terms and conditions.", margin, y, { size: 8, color: MEDIUM_GRAY });

    // === PAGE 2: FULL TERMS & CONDITIONS ===
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;

    // Page 2 header
    page.drawRectangle({ x: 0, y: pageHeight - headerHeight, width: pageWidth, height: headerHeight, color: CRIMSON });
    
    if (logoImage) {
      page.drawImage(logoImage, { 
        x: margin, 
        y: pageHeight - headerHeight + 5, 
        width: logoDims.width, 
        height: logoDims.height 
      });
      textStartX = margin + logoDims.width + 10;
    } else {
      textStartX = margin;
    }
    
    drawText("Soul Train's Eatery", textStartX, pageHeight - 30, { font: dancingScript, size: 20, color: WHITE });
    drawText("Authentic Southern Catering", textStartX, pageHeight - 45, { size: 8, color: rgb(1, 0.9, 0.9) });
    
    drawText("(843) 970-0265", contactX, pageHeight - 28, { size: 8, color: WHITE });
    drawText("soultrainseatery@gmail.com", contactX, pageHeight - 40, { size: 8, color: WHITE });
    
    y = pageHeight - headerHeight - 10;
    
    page.drawRectangle({ x: margin, y: y - 16, width: 180, height: 20, color: rgb(0.95, 0.95, 0.95) });
    drawText("TERMS & CONDITIONS", margin + 8, y - 11, { font: helveticaBold, size: 10, color: CRIMSON });
    
    y -= 35;
    drawLine(margin, y, pageWidth - margin, GOLD, 2);
    y -= 20;

    // Get terms from shared source (government-specific if applicable)
    // Note: isGovernment is already defined at line 104
    const fullTerms = getTermsForPDF(isGovernment);

    for (const section of fullTerms) {
      // Section title
      page.drawRectangle({ x: margin, y: y - 12, width: contentWidth, height: 16, color: rgb(0.97, 0.97, 0.97) });
      drawText(section.title, margin + 6, y - 8, { font: helveticaBold, size: 9, color: CRIMSON });
      y -= 20;
      
      // Section items
      for (const item of section.items) {
        const itemHeight = drawText(`* ${item}`, margin + 10, y, { size: 8, maxWidth: contentWidth - 20, color: DARK_GRAY });
        y -= itemHeight + 4;
      }
      
      y -= 8;
      
      // Check if we need more space (shouldn't happen with current content)
      if (y < margin + 80) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin - 20;
      }
    }

    // Footer
    y -= 10;
    drawLine(margin, y, pageWidth - margin, GOLD, 2);
    y -= 15;
    drawText("Questions? Contact us at (843) 970-0265 or soultrainseatery@gmail.com", margin, y, { size: 8, color: MEDIUM_GRAY });
    y -= 10;
    drawText("Proudly serving Charleston's Lowcountry and surrounding areas.", margin, y, { size: 8, color: MEDIUM_GRAY });
    y -= 15;
    drawText(`Estimate #${invoiceData.invoice_number || 'DRAFT'} | Generated ${new Date().toLocaleDateString('en-US')}`, margin, y, { size: 7, color: MEDIUM_GRAY });

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    const base64Pdf = btoa(String.fromCharCode(...pdfBytes));

    logStep("PDF generation completed", { size: pdfBytes.length, pages: pdfDoc.getPageCount() });

    return new Response(JSON.stringify({
      success: true,
      pdf_base64: base64Pdf,
      invoice_number: invoiceData.invoice_number,
      filename: `Soul-Trains-Estimate-${invoiceData.invoice_number || 'draft'}.pdf`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
