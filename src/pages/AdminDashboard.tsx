import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StreamlinedQuoteManager } from "@/components/admin/StreamlinedQuoteManager";

export default function AdminDashboard() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          *,
          invoices (
            id,
            is_draft,
            status,
            document_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Streamlined workflow for catering requests</p>
      </div>
      
      <StreamlinedQuoteManager 
        quotes={quotes}
        loading={loading}
        onRefresh={fetchQuotes}
      />
    </div>
  );
}