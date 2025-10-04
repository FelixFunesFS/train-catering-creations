import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFeedbackCollection, type FeedbackData } from '@/hooks/useFeedbackCollection';
import { Star, ThumbsUp, MessageSquare, Send, Loader2 } from 'lucide-react';

interface FeedbackFormProps {
  invoiceId: string;
  customerEmail: string;
  eventName: string;
  onSuccess?: () => void;
}

export function FeedbackForm({ invoiceId, customerEmail, eventName, onSuccess }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    food_quality: 0,
    service_quality: 0,
    presentation: 0,
    would_recommend: false,
    comments: '',
    testimonial: '',
    improvements: ''
  });

  const { submitFeedback, submitting } = useFeedbackCollection(invoiceId, customerEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitFeedback(feedback);
    if (success && onSuccess) onSuccess();
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const isValid = feedback.rating > 0 && feedback.food_quality > 0 && feedback.service_quality > 0 && feedback.presentation > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Experience</CardTitle>
        <CardDescription>
          Thank you for choosing Soul Train's Eatery for {eventName}! We'd love to hear your feedback.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <StarRating
            label="Overall Experience"
            value={feedback.rating}
            onChange={(v) => setFeedback({ ...feedback, rating: v })}
          />

          {/* Specific Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StarRating
              label="Food Quality"
              value={feedback.food_quality}
              onChange={(v) => setFeedback({ ...feedback, food_quality: v })}
            />
            <StarRating
              label="Service Quality"
              value={feedback.service_quality}
              onChange={(v) => setFeedback({ ...feedback, service_quality: v })}
            />
            <StarRating
              label="Presentation"
              value={feedback.presentation}
              onChange={(v) => setFeedback({ ...feedback, presentation: v })}
            />
          </div>

          {/* Recommendation */}
          <div className="space-y-2">
            <Label>Would you recommend us to others?</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={feedback.would_recommend ? 'default' : 'outline'}
                onClick={() => setFeedback({ ...feedback, would_recommend: true })}
                className="flex-1"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Yes, definitely!
              </Button>
              <Button
                type="button"
                variant={!feedback.would_recommend ? 'default' : 'outline'}
                onClick={() => setFeedback({ ...feedback, would_recommend: false })}
                className="flex-1"
              >
                Not this time
              </Button>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Additional Comments</Label>
            <Textarea
              id="comments"
              placeholder="Tell us about your experience..."
              value={feedback.comments}
              onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {feedback.comments?.length || 0}/1000 characters
            </p>
          </div>

          {/* Testimonial */}
          {feedback.rating >= 4 && (
            <div className="space-y-2">
              <Label htmlFor="testimonial">Share a Testimonial (Optional)</Label>
              <Textarea
                id="testimonial"
                placeholder="May we feature your kind words on our website? (optional)"
                value={feedback.testimonial}
                onChange={(e) => setFeedback({ ...feedback, testimonial: e.target.value })}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {feedback.testimonial?.length || 0}/500 characters
              </p>
            </div>
          )}

          {/* Improvements */}
          <div className="space-y-2">
            <Label htmlFor="improvements">How can we improve? (Optional)</Label>
            <Textarea
              id="improvements"
              placeholder="Your suggestions help us get better..."
              value={feedback.improvements}
              onChange={(e) => setFeedback({ ...feedback, improvements: e.target.value })}
              rows={3}
              maxLength={1000}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
