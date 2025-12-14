import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

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

    logStep("Data fetched successfully", { 
      lineItemsCount: lineItems?.length || 0,
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
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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
        'full-service': 'Full Service Catering',
        'delivery-only': 'Delivery Only',
        'delivery-setup': 'Delivery with Setup',
        'drop-off': 'Drop-Off'
      };
      return types[type] || type;
    };

    // Format menu items
    const formatMenuItems = (items: any) => {
      if (!items || !Array.isArray(items) || items.length === 0) return '';
      return items.map((item: string) => 
        item.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      ).join(', ');
    };

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Page settings
    const pageWidth = 612; // 8.5 inches
    const pageHeight = 792; // 11 inches
    const margin = 50;
    const contentWidth = pageWidth - (margin * 2);
    
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    // Helper functions for drawing
    const drawText = (text: string, x: number, yPos: number, options: { 
      font?: any, size?: number, color?: any, maxWidth?: number 
    } = {}) => {
      const font = options.font || helvetica;
      const size = options.size || 10;
      const color = options.color || DARK_GRAY;
      
      // Word wrap if maxWidth specified
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
            currentY -= size + 2;
          } else {
            line = testLine;
          }
        }
        if (line) {
          page.drawText(line, { x, y: currentY, size, font, color });
          currentY -= size + 2;
        }
        return yPos - currentY;
      } else {
        page.drawText(text, { x, y: yPos, size, font, color });
        return size + 2;
      }
    };

    const drawLine = (x1: number, yPos: number, x2: number, color = LIGHT_GRAY, thickness = 1) => {
      page.drawLine({ start: { x: x1, y: yPos }, end: { x: x2, y: yPos }, thickness, color });
    };

    const checkNewPage = (neededHeight: number) => {
      if (y - neededHeight < margin + 50) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
        return true;
      }
      return false;
    };

    // === HEADER ===
    drawText("Soul Train's Eatery", margin, y, { font: helveticaBold, size: 24, color: CRIMSON });
    y -= 28;
    drawText("Charleston's Premier Catering Service", margin, y, { size: 11, color: MEDIUM_GRAY });
    y -= 14;
    drawText("(843) 970-0265 | soultrainseatery@gmail.com", margin, y, { size: 9, color: MEDIUM_GRAY });
    y -= 25;
    
    // Estimate badge
    page.drawRectangle({ x: margin, y: y - 20, width: 120, height: 24, color: CRIMSON });
    drawText("CATERING ESTIMATE", margin + 8, y - 14, { font: helveticaBold, size: 10, color: rgb(1, 1, 1) });
    
    // Estimate number on right
    const estNumText = `#${invoiceData.invoice_number || 'DRAFT'}`;
    const estNumWidth = helveticaBold.widthOfTextAtSize(estNumText, 14);
    drawText(estNumText, pageWidth - margin - estNumWidth, y - 10, { font: helveticaBold, size: 14, color: CRIMSON });
    y -= 40;

    drawLine(margin, y, pageWidth - margin, CRIMSON, 2);
    y -= 25;

    // === CUSTOMER & EVENT INFO (2 columns) ===
    const col1X = margin;
    const col2X = margin + contentWidth / 2 + 10;
    const colWidth = contentWidth / 2 - 10;

    // Customer column
    drawText("BILL TO", col1X, y, { font: helveticaBold, size: 9, color: MEDIUM_GRAY });
    y -= 14;
    drawText(customer?.name || quote?.contact_name || '', col1X, y, { font: helveticaBold, size: 11 });
    y -= 14;
    if (customer?.email || quote?.email) {
      drawText(customer?.email || quote?.email, col1X, y, { size: 10 });
      y -= 12;
    }
    if (customer?.phone) {
      drawText(customer?.phone, col1X, y, { size: 10 });
      y -= 12;
    }

    // Event column (reset y for parallel column)
    let eventY = y + 40;
    drawText("EVENT DETAILS", col2X, eventY, { font: helveticaBold, size: 9, color: MEDIUM_GRAY });
    eventY -= 14;
    drawText(quote?.event_name || 'Event', col2X, eventY, { font: helveticaBold, size: 11 });
    eventY -= 14;
    if (quote?.event_date) {
      drawText(formatDate(quote.event_date), col2X, eventY, { size: 10 });
      eventY -= 12;
    }
    if (quote?.start_time) {
      drawText(`Start Time: ${formatTime(quote.start_time)}`, col2X, eventY, { size: 10 });
      eventY -= 12;
    }
    if (quote?.location) {
      drawText(quote.location, col2X, eventY, { size: 10, maxWidth: colWidth });
      eventY -= 12;
    }
    if (quote?.guest_count) {
      drawText(`${quote.guest_count} Guests • ${formatServiceType(quote.service_type)}`, col2X, eventY, { size: 10 });
      eventY -= 12;
    }

    y = Math.min(y, eventY) - 20;

    // Government badge if applicable
    if (isGovernment) {
      page.drawRectangle({ x: margin, y: y - 18, width: contentWidth, height: 22, color: rgb(0.93, 0.95, 1) });
      drawText("🏛️ Government Contract — Tax Exempt • Net 30 Payment Terms", margin + 10, y - 12, { 
        font: helveticaBold, size: 10, color: rgb(0.1, 0.3, 0.6) 
      });
      y -= 35;
    }

    drawLine(margin, y, pageWidth - margin);
    y -= 20;

    // === LINE ITEMS TABLE ===
    drawText("SERVICES & ITEMS", margin, y, { font: helveticaBold, size: 11, color: CRIMSON });
    y -= 20;

    // Table header
    const descCol = margin;
    const qtyCol = margin + contentWidth - 180;
    const priceCol = margin + contentWidth - 120;
    const totalCol = margin + contentWidth - 60;

    page.drawRectangle({ x: margin, y: y - 14, width: contentWidth, height: 18, color: LIGHT_GRAY });
    drawText("Description", descCol + 5, y - 10, { font: helveticaBold, size: 9 });
    drawText("Qty", qtyCol, y - 10, { font: helveticaBold, size: 9 });
    drawText("Unit", priceCol, y - 10, { font: helveticaBold, size: 9 });
    drawText("Total", totalCol, y - 10, { font: helveticaBold, size: 9 });
    y -= 22;

    // Line items
    for (const item of (lineItems || [])) {
      checkNewPage(50);
      
      // Title
      const title = item.title || 'Item';
      drawText(title, descCol + 5, y, { font: helveticaBold, size: 10 });
      
      // Qty, Unit, Total on same row
      drawText(item.quantity.toString(), qtyCol, y, { size: 10 });
      drawText(formatCurrency(item.unit_price), priceCol, y, { size: 10 });
      drawText(formatCurrency(item.total_price), totalCol, y, { font: helveticaBold, size: 10 });
      y -= 14;
      
      // Description (wrapped)
      if (item.description) {
        const descHeight = drawText(item.description, descCol + 10, y, { 
          size: 9, color: MEDIUM_GRAY, maxWidth: qtyCol - descCol - 20 
        });
        y -= descHeight + 4;
      }
      
      y -= 8;
      drawLine(margin, y, pageWidth - margin);
      y -= 10;
    }

    // === TOTALS ===
    y -= 10;
    const totalsX = margin + contentWidth - 160;
    const totalsValueX = margin + contentWidth - 60;

    // Subtotal
    drawText("Subtotal:", totalsX, y, { size: 10 });
    drawText(formatCurrency(invoiceData.subtotal), totalsValueX, y, { size: 10 });
    y -= 16;

    // Discount if any
    if (invoiceData.discount_amount && invoiceData.discount_amount > 0) {
      const discountText = invoiceData.discount_description || 'Discount';
      drawText(`${discountText}:`, totalsX, y, { size: 10, color: rgb(0, 0.5, 0) });
      drawText(`-${formatCurrency(invoiceData.discount_amount)}`, totalsValueX, y, { size: 10, color: rgb(0, 0.5, 0) });
      y -= 16;
    }

    // Tax
    if (invoiceData.tax_amount && invoiceData.tax_amount > 0) {
      drawText("Tax (9%):", totalsX, y, { size: 10 });
      drawText(formatCurrency(invoiceData.tax_amount), totalsValueX, y, { size: 10 });
      y -= 16;
    } else if (isGovernment) {
      drawText("Tax:", totalsX, y, { size: 10 });
      drawText("Exempt", totalsValueX, y, { size: 10, color: rgb(0.1, 0.3, 0.6) });
      y -= 16;
    }

    // Total
    drawLine(totalsX - 10, y + 4, pageWidth - margin, CRIMSON, 2);
    y -= 8;
    drawText("TOTAL:", totalsX, y, { font: helveticaBold, size: 12 });
    drawText(formatCurrency(invoiceData.total_amount), totalsValueX - 10, y, { font: helveticaBold, size: 14, color: CRIMSON });
    y -= 30;

    // === NOTES ===
    if (invoiceData.notes) {
      checkNewPage(60);
      drawText("NOTES", margin, y, { font: helveticaBold, size: 10, color: CRIMSON });
      y -= 14;
      drawText(invoiceData.notes, margin, y, { size: 10, maxWidth: contentWidth, color: MEDIUM_GRAY });
      y -= 40;
    }

    // === FOOTER ===
    checkNewPage(80);
    drawLine(margin, y, pageWidth - margin);
    y -= 20;
    drawText("Thank you for choosing Soul Train's Eatery!", margin, y, { font: helveticaBold, size: 11, color: CRIMSON });
    y -= 16;
    drawText("This estimate is valid for 30 days. Please contact us with any questions.", margin, y, { size: 9, color: MEDIUM_GRAY });
    y -= 12;
    drawText("Proudly serving Charleston's Lowcountry and surrounding areas.", margin, y, { size: 9, color: MEDIUM_GRAY });

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    const base64Pdf = btoa(String.fromCharCode(...pdfBytes));

    logStep("PDF generation completed", { size: pdfBytes.length });

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
