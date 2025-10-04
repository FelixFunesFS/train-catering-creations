import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MenuItemAnalytics {
  item_name: string;
  category: string;
  order_count: number;
  total_revenue: number;
  avg_price: number;
}

export function useMenuAnalytics() {
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItemAnalytics[]>([]);

  useEffect(() => {
    fetchMenuAnalytics();
  }, []);

  const fetchMenuAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all line items from invoices
      const { data: lineItems } = await supabase
        .from('invoice_line_items')
        .select(`
          title,
          description,
          category,
          quantity,
          total_price,
          invoice_id
        `);

      if (!lineItems) return;

      // Group by item
      const grouped: Record<string, MenuItemAnalytics> = {};

      lineItems.forEach(item => {
        const key = item.title || item.description;
        if (!grouped[key]) {
          grouped[key] = {
            item_name: key,
            category: item.category || 'Other',
            order_count: 0,
            total_revenue: 0,
            avg_price: 0
          };
        }

        grouped[key].order_count += item.quantity;
        grouped[key].total_revenue += item.total_price;
      });

      // Calculate averages
      Object.values(grouped).forEach(item => {
        item.avg_price = item.total_revenue / item.order_count;
      });

      // Sort by revenue
      const sorted = Object.values(grouped).sort((a, b) => b.total_revenue - a.total_revenue);

      setMenuItems(sorted);
    } catch (err) {
      console.error('Error fetching menu analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return { menuItems, loading, refetch: fetchMenuAnalytics };
}
