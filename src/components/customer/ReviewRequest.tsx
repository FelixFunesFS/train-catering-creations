import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFeedbackCollection } from '@/hooks/useFeedbackCollection';
import { Star, ExternalLink, Heart } from 'lucide-react';

interface ReviewRequestProps {
  invoiceId: string;
  customerEmail: string;
}

export function ReviewRequest({ invoiceId, customerEmail }: ReviewRequestProps) {
  const { requestReview } = useFeedbackCollection(invoiceId, customerEmail);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Love Our Service?
        </CardTitle>
        <CardDescription>
          Your review helps other families discover our authentic Southern catering
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          We'd be honored if you could share your experience on one of these platforms:
        </p>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => requestReview('google')}
          >
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Review us on Google</span>
            </div>
            <ExternalLink className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => requestReview('facebook')}
          >
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-500" />
              <span>Review us on Facebook</span>
            </div>
            <ExternalLink className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => requestReview('yelp')}
          >
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-red-500" />
              <span>Review us on Yelp</span>
            </div>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-muted rounded-lg p-4 mt-4">
          <p className="text-xs text-muted-foreground text-center">
            Your reviews help us serve more families with authentic Southern hospitality and home-cooked meals
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
