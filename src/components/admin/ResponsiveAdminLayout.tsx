import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';

interface ResponsiveAdminLayoutProps {
  children: React.ReactNode;
  data?: any;
}

export function ResponsiveAdminLayout({ children, data }: ResponsiveAdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar data={data} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}