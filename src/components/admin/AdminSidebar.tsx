import React, { useState } from 'react';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Users,
  Calendar,
  Settings,
  BarChart3,
  Zap,
  Bell,
  MessageSquare,
  DollarSign,
  CheckCircle
} from 'lucide-react';

interface AdminSidebarProps {
  data?: {
    quotes: any[];
    invoices: any[];
    notifications: any[];
  };
}

export function AdminSidebar({ data }: AdminSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/admin') {
      return currentPath === '/admin' && !location.search.includes('tab=');
    }
    if (path.includes('?tab=')) {
      const [basePath, tabParam] = path.split('?tab=');
      return currentPath.startsWith('/admin') && location.search.includes(`tab=${tabParam}`);
    }
    return currentPath === path || currentPath.startsWith(path);
  };
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50";

  // Calculate counts for badges
  const pendingQuotes = data?.quotes?.filter(q => q.status === 'pending').length || 0;
  const draftInvoices = data?.invoices?.filter(i => i.is_draft).length || 0;
  const unreadNotifications = data?.notifications?.filter(n => !n.read).length || 0;

  const mainItems = [
    { 
      title: "Overview", 
      url: "/admin", 
      icon: LayoutDashboard 
    },
    { 
      title: "Quotes", 
      url: "/admin?tab=quotes", 
      icon: FileText,
      badge: pendingQuotes > 0 ? pendingQuotes : undefined
    },
    { 
      title: "Invoices", 
      url: "/admin?tab=invoices", 
      icon: CreditCard,
      badge: draftInvoices > 0 ? draftInvoices : undefined
    },
    { 
      title: "Events", 
      url: "/admin?tab=events", 
      icon: Calendar 
    },
    { 
      title: "Customers", 
      url: "/admin?tab=customers", 
      icon: Users 
    },
  ];

  const automationItems = [
    { 
      title: "Workflow Automation", 
      url: "/admin?tab=automation", 
      icon: Zap 
    },
    { 
      title: "Business Intelligence", 
      url: "/admin?tab=analytics", 
      icon: BarChart3 
    },
    { 
      title: "Notifications", 
      url: "/admin?tab=notifications", 
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined
    },
  ];

  const managementItems = [
    { 
      title: "Reports", 
      url: "/admin/reports", 
      icon: DollarSign 
    },
    { 
      title: "Messages", 
      url: "/admin/messages", 
      icon: MessageSquare 
    },
    { 
      title: "Settings", 
      url: "/admin/settings", 
      icon: Settings 
    },
  ];

  const renderMenuItem = (item: any) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <NavLink 
          to={item.url} 
          className={() => getNavCls({ isActive: isActive(item.url) })}
        >
          <item.icon className="h-4 w-4" />
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar className="border-r border-border">
      {/* Header */}
      <div className="p-3 lg:p-4 border-b border-border">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="p-1.5 lg:p-2 bg-primary rounded-lg">
            <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-xs lg:text-sm truncate">Soul Train's Eatery</h2>
            <p className="text-xs text-muted-foreground hidden lg:block">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Automation & Analytics */}
        <SidebarGroup>
          <SidebarGroupLabel>Automation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {automationItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}