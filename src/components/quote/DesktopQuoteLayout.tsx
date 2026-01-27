/**
 * Desktop split-view layout wrapper for quote forms.
 * Left panel: Live preview sidebar (sticky)
 * Right panel: Form content
 * 
 * This component only renders on desktop (1024px+).
 * Mobile continues to use the standard fullscreen layout.
 */

import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { QuotePreviewSidebar } from "./QuotePreviewSidebar";
import { cn } from "@/lib/utils";

interface DesktopQuoteLayoutProps {
  form: UseFormReturn<any>;
  variant?: 'regular' | 'wedding';
  header: ReactNode;
  content: ReactNode;
  footer: ReactNode;
}

export function DesktopQuoteLayout({
  form,
  variant,
  header,
  content,
  footer,
}: DesktopQuoteLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky Header - full width */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b">
        {header}
      </div>

      {/* Split Panel Content */}
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 h-[calc(100vh-8rem)]"
      >
        {/* Left Panel - Preview Sidebar */}
        <ResizablePanel 
          defaultSize={32} 
          minSize={25} 
          maxSize={40}
          className="bg-muted/30"
        >
          <QuotePreviewSidebar form={form} variant={variant} />
        </ResizablePanel>

        <ResizableHandle withHandle className="hidden lg:flex" />

        {/* Right Panel - Form Content */}
        <ResizablePanel defaultSize={68} minSize={60}>
          <div className="h-full overflow-y-auto">
            <div className="py-8 px-6 lg:px-8">
              <div className="max-w-2xl mx-auto">
                {content}
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Sticky Footer - full width */}
      <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t">
        {footer}
      </div>
    </div>
  );
}
