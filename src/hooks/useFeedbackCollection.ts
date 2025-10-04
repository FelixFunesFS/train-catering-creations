import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  food_quality: z.number().min(1).max(5),
  service_quality: z.number().min(1).max(5),
  presentation: z.number().min(1).max(5),
  would_recommend: z.boolean(),
  comments: z.string().max(1000).optional(),
  testimonial: z.string().max(500).optional(),
  improvements: z.string().max(1000).optional()
});

export type FeedbackData = z.infer<typeof feedbackSchema>;

export function useFeedbackCollection(invoiceId: string, customerEmail: string) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const submitFeedback = async (feedbackData: FeedbackData) => {
    try {
      setSubmitting(true);

      // Validate input
      const validated = feedbackSchema.parse(feedbackData);

      // Store in customer_feedback JSONB field
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          customer_feedback: {
            ...validated,
            submitted_at: new Date().toISOString(),
            customer_email: customerEmail
          }
        })
        .eq('id', invoiceId);

      if (invoiceError) throw invoiceError;

      // Track analytics
      await supabase.from('analytics_events').insert({
        event_type: 'feedback_submitted',
        entity_type: 'invoice',
        entity_id: invoiceId,
        metadata: {
          rating: validated.rating,
          would_recommend: validated.would_recommend
        }
      });

      // Update quote status to completed
      const { data: invoice } = await supabase
        .from('invoices')
        .select('quote_request_id')
        .eq('id', invoiceId)
        .single();

      if (invoice?.quote_request_id) {
        await supabase
          .from('quote_requests')
          .update({ status: 'completed' })
          .eq('id', invoice.quote_request_id);
      }

      toast({
        title: 'Thank You!',
        description: 'Your feedback has been submitted successfully.'
      });

      return true;
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      
      if (err instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: 'Please check all required fields',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Submission Failed',
          description: err.message,
          variant: 'destructive'
        });
      }
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const requestReview = async (platform: 'google' | 'facebook' | 'yelp') => {
    try {
      const reviewLinks = {
        google: 'https://g.page/r/YOUR_GOOGLE_PLACE_ID/review',
        facebook: 'https://www.facebook.com/YOUR_FB_PAGE/reviews',
        yelp: 'https://www.yelp.com/writeareview/biz/YOUR_YELP_ID'
      };

      // Track the review request
      await supabase.from('analytics_events').insert({
        event_type: 'review_requested',
        entity_type: 'invoice',
        entity_id: invoiceId,
        metadata: { platform }
      });

      window.open(reviewLinks[platform], '_blank');
    } catch (err: any) {
      console.error('Error tracking review request:', err);
    }
  };

  return { submitFeedback, requestReview, submitting };
}
