import { useState, useEffect } from 'react';

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
      // Mock Facebook reviews for now - in production, this would call the Facebook Graph API
      // To implement real API: https://developers.facebook.com/docs/graph-api/reference/page/ratings
      
      const mockFacebookReviews: FacebookReview[] = [
        {
          id: 'fb_1',
          name: 'Patricia Thompson',
          rating: 5,
          quote: 'Chef Train catered our company event and the food was absolutely amazing! The mac and cheese was the best I\'ve ever had. Highly recommend Soul Train\'s Eatery!',
          createdTime: '2024-09-15T14:30:00Z',
          source: 'facebook'
        },
        {
          id: 'fb_2',
          name: 'Marcus Davis',
          rating: 5,
          quote: 'We hired Soul Train\'s for our family reunion and it was perfect! The soul food brought everyone together. Tanya and Chef Train are the real deal - authentic Southern cooking at its finest.',
          createdTime: '2024-08-22T10:15:00Z',
          source: 'facebook'
        },
        {
          id: 'fb_3',
          name: 'Lisa Anderson',
          rating: 5,
          quote: 'Outstanding service and incredible food! They catered our daughter\'s graduation party and everyone raved about the fried chicken and collard greens. Will definitely hire them again!',
          createdTime: '2024-07-10T16:45:00Z',
          source: 'facebook'
        }
      ];

      setIsLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        setReviews(mockFacebookReviews);
        setIsLoading(false);
      }, 500);
    };

    fetchReviews();
  }, [options.pageId, options.accessToken, options.limit]);

  return { reviews, isLoading, error };
};
