import React from 'react';
import { useLocation } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export function AdminLayoutWrapper({ 
  children, 
  title = "Estimate Management",
  showBackButton = true,
  backUrl = "/admin"
}: AdminLayoutWrapperProps) {
  const location = useLocation();
  
  // Auto-detect context from URL for appropriate back navigation
  const getContextualBackUrl = () => {
    if (location.pathname.includes('/estimate/quote/')) {
      return "/admin?tab=new-requests";
    }
    if (location.pathname.includes('/estimate-preview/')) {
      return "/admin?tab=estimates-progress";
    }
    return backUrl;
  };

  return (
    <AdminLayout 
      title={title}
      showBackButton={showBackButton}
      backUrl={getContextualBackUrl()}
    >
      {children}
    </AdminLayout>
  );
}