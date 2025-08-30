import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export function AdminLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = true, 
  backUrl = '/admin' 
}: AdminLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Admin Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  // If on an estimate preview and there's an invoiceId, go to workflow
                  const currentPath = window.location.pathname;
                  const invoiceMatch = currentPath.match(/\/estimate-preview\/([^\/]+)/);
                  if (invoiceMatch && invoiceMatch[1] && invoiceMatch[1] !== 'preview') {
                    navigate(`/admin/estimate-workflow/${invoiceMatch[1]}`);
                  } else {
                    navigate(backUrl);
                  }
                }}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {window.location.pathname.includes('/estimate-preview/') ? 'Back to Workflow' : 'Back to Dashboard'}
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}