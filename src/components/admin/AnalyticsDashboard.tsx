import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalyticsOverview } from '@/components/admin/AnalyticsOverview';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { MenuPerformanceChart } from '@/components/admin/MenuPerformanceChart';
import { ReportExporter } from '@/components/admin/ReportExporter';
import { BarChart3, Calendar } from 'lucide-react';

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year' | 'all'>('month');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Track performance, revenue, and customer insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="menu">Menu Performance</TabsTrigger>
          <TabsTrigger value="export">Export Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsOverview dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <RevenueChart dateRange={dateRange} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MenuPerformanceChart />
            <ReportExporter />
          </div>
        </TabsContent>

        <TabsContent value="menu" className="space-y-6">
          <MenuPerformanceChart />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReportExporter />
            <div className="space-y-4">
              <RevenueChart dateRange={dateRange} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
