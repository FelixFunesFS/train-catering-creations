import { useState } from 'react';
import { Database } from '@/integrations/supabase/types';
import { useUpdateQuote } from '@/hooks/useQuotes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

interface CustomerEditorProps {
  quote: QuoteRequest;
  onSave: () => void;
}

export function CustomerEditor({ quote, onSave }: CustomerEditorProps) {
  const [formData, setFormData] = useState({
    contact_name: quote.contact_name,
    email: quote.email,
    phone: quote.phone,
  });

  const updateQuote = useUpdateQuote();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateQuote.mutateAsync({
      quoteId: quote.id,
      updates: formData,
    });
    
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_name">Name</Label>
          <Input
            id="contact_name"
            value={formData.contact_name}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={updateQuote.isPending}>
          {updateQuote.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
