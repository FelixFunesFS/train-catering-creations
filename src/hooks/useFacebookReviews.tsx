import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FacebookReview {
  id: string;
  name: string;
  rating: number;
  quote: string;
  createdTime: string;
  source: 'facebook';
}

interface UseFacebookReviewsOptions {
  pageId?: string;
  accessToken?: string;
  limit?: number;
}

export const useFacebookReviews = (options: UseFacebookReviewsOptions = {}) => {
  const [reviews, setReviews] = useState<FacebookReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching Facebook reviews from edge function...');
        
        const { data, error: functionError } = await supabase.functions.invoke('facebook-reviews');

        if (functionError) {
          console.error('Error calling facebook-reviews function:', functionError);
          throw functionError;
        }

        console.log('Facebook reviews response:', data);

        if (data?.reviews) {
          setReviews(data.reviews);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error('Failed to fetch Facebook reviews:', err);
        setError('Failed to load Facebook reviews');
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [options.pageId, options.accessToken, options.limit]);

  return { reviews, isLoading, error };
};
