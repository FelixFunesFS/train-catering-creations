
# Revised Plan: Desktop Layout Restructure + PDF Download

## Overview

Restructure the desktop 3-column layout to move Terms & Conditions and Help section from the left sidebar to the center panel, and add a PDF download button between them.

## Current Desktop Layout

```text
+---------------------------+---------------------------+---------------------------+
|     LEFT (25%)            |     CENTER (35%)          |     RIGHT (40%)           |
+---------------------------+---------------------------+---------------------------+
| CustomerActions (CTAs)    | PaymentCard               | MenuActionsPanel          |
| Your Details Card         |                           | - Line Items              |
| Event Details Card        |                           | - Caterer Notes           |
| Terms & Conditions        |                           | - CustomerActions         |
| Need Help? Card           |                           |                           |
+---------------------------+---------------------------+---------------------------+
```

## New Desktop Layout

```text
+---------------------------+---------------------------+---------------------------+
|     LEFT (25%)            |     CENTER (35%)          |     RIGHT (40%)           |
+---------------------------+---------------------------+---------------------------+
| CustomerActions (CTAs)    | PaymentCard               | MenuActionsPanel          |
| Your Details Card         | Terms & Conditions        | - Line Items              |
| Event Details Card        | Download PDF Button       | - Caterer Notes           |
|                           | Need Help? Card           | - CustomerActions         |
+---------------------------+---------------------------+---------------------------+
```

## Files to Modify

| File | Changes |
|------|---------|
| `CustomerDetailsSidebar.tsx` | Remove Terms & Conditions and Help Section (desktop only via prop) |
| `CustomerEstimateView.tsx` | Add Terms, Download PDF, Help to center panel after PaymentCard |
| `CustomerActions.tsx` | Add PDF download functionality with invoiceNumber prop |
| `MenuActionsPanel.tsx` | Add invoiceNumber prop to pass to CustomerActions |

---

## Implementation Details

### 1. CustomerActions.tsx - Add PDF Download

Add a new "Download Estimate PDF" button:

**New imports:**
```typescript
import { Download } from 'lucide-react';
```

**New props:**
```typescript
interface CustomerActionsProps {
  // ... existing props
  invoiceNumber?: string;
}
```

**New state and handler:**
```typescript
const [isDownloading, setIsDownloading] = useState(false);

const handleDownloadPdf = async () => {
  if (!accessToken) {
    toast({ title: 'Download Error', description: 'Missing access credentials.', variant: 'destructive' });
    return;
  }
  setIsDownloading(true);
  try {
    const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
      body: { invoice_id: invoiceId, token: accessToken }
    });
    if (error) throw error;
    if (!data?.pdf_base64) throw new Error('No PDF generated');

    // Convert base64 to blob and download
    const binaryString = atob(data.pdf_base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estimate-${invoiceNumber || 'document'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'PDF Downloaded', description: 'Your estimate has been saved.' });
  } catch (err) {
    toast({ title: 'Download Failed', description: 'Unable to download PDF.', variant: 'destructive' });
  } finally {
    setIsDownloading(false);
  }
};
```

**Standalone download button export** (new component in same file for center panel use):
```typescript
export function DownloadPdfButton({ invoiceId, invoiceNumber, accessToken }: {
  invoiceId: string;
  invoiceNumber?: string;
  accessToken?: string;
}) {
  // Same download logic as above
  return (
    <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading} className="w-full">
      {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      {isDownloading ? 'Generating...' : 'Download Estimate PDF'}
    </Button>
  );
}
```

### 2. CustomerDetailsSidebar.tsx - Remove Terms & Help for Desktop

Add a prop to conditionally hide Terms & Help:

**Add to interface:**
```typescript
interface CustomerDetailsSidebarProps {
  // ... existing props
  hideTermsAndHelp?: boolean;  // Used for desktop layout
}
```

**Wrap Terms & Help in conditional:**
```typescript
{!hideTermsAndHelp && (
  <>
    {/* Terms & Conditions Collapsible */}
    <Collapsible defaultOpen={false}>
      ...
    </Collapsible>

    {/* Help Section */}
    <Card className="bg-muted/30">
      ...
    </Card>
  </>
)}
```

### 3. CustomerEstimateView.tsx - Desktop Center Panel Updates

**Add to center panel (after PaymentCard):**
```tsx
{/* Center Panel - Payment + Terms + Download + Help (35%) */}
<ResizablePanel defaultSize={35} minSize={30} maxSize={40}>
  <ScrollArea className="h-full">
    <div className="p-6 space-y-6">
      {/* PaymentCard */}
      <div id="payment">
        <PaymentCard ... />
      </div>

      {/* Terms & Conditions */}
      <Collapsible defaultOpen={false}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PenLine className="h-4 w-4 text-primary" />
                Terms & Conditions
              </CardTitle>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <StandardTermsAndConditions 
                eventType={quote.compliance_level === 'government' ? 'government' : 'standard'} 
                variant="compact" 
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Download PDF Button */}
      <DownloadPdfButton 
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoice_number}
        accessToken={token}
      />

      {/* Help Section */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Need Help?</span>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Call: <a href="tel:+18439700265" className="text-primary hover:underline">(843) 970-0265</a></p>
            <p>Email: <a href="mailto:soultrainseatery@gmail.com" className="text-primary hover:underline">soultrainseatery@gmail.com</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  </ScrollArea>
</ResizablePanel>
```

**Update CustomerDetailsSidebar call:**
```tsx
<CustomerDetailsSidebar 
  quote={quote}
  // ... existing props
  hideTermsAndHelp={true}  // Desktop hides these from left sidebar
/>
```

### 4. MenuActionsPanel.tsx - Add invoiceNumber

**Add to interface and pass to CustomerActions:**
```typescript
interface MenuActionsPanelProps {
  // ... existing props
  invoiceNumber?: string;
}

// In component:
<CustomerActions
  // ... existing props
  invoiceNumber={invoiceNumber}
/>
```

**Update in CustomerEstimateView.tsx:**
```tsx
<MenuActionsPanel
  // ... existing props
  invoiceNumber={invoice.invoice_number}
/>
```

---

## Mobile Layout (Unchanged)

Mobile layout already has Terms & Conditions after MainContent and FooterSection has help info. The PDF download button will be added inline with CustomerActions on mobile as well.

---

## Summary of Changes

| Component | Change |
|-----------|--------|
| `CustomerActions.tsx` | Add `invoiceNumber` prop, add PDF download button |
| `CustomerDetailsSidebar.tsx` | Add `hideTermsAndHelp` prop, conditionally render Terms & Help |
| `CustomerEstimateView.tsx` | Pass `hideTermsAndHelp=true` to sidebar, add Terms/Download/Help to center panel, pass `invoiceNumber` to components |
| `MenuActionsPanel.tsx` | Add `invoiceNumber` prop, pass to `CustomerActions` |

---

## Testing Checklist

1. Desktop: Terms & Conditions visible in center panel (not left sidebar)
2. Desktop: Download PDF button works in center panel
3. Desktop: Help section visible in center panel (not left sidebar)
4. Mobile: Layout unchanged, Terms still after main content
5. PDF download generates correct file with invoice number in filename
