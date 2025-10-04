import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChangeRequestConfirmationProps {
  customerEmail: string;
  submittedAt?: string;
}

export function ChangeRequestConfirmation({ customerEmail, submittedAt }: ChangeRequestConfirmationProps) {
  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <div className="flex items-center gap-2 text-orange-600">
          <Clock className="h-6 w-6" />
          <CardTitle>Change Request Submitted</CardTitle>
        </div>
        <CardDescription>
          We're reviewing your requested changes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-background border-orange-200">
          <CheckCircle2 className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            Your change request has been successfully submitted and is currently under review by our team.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">What Happens Next?</p>
              <p className="text-muted-foreground mt-1">
                Our team will review your requested changes and send you an updated estimate with final pricing to <strong>{customerEmail}</strong> within 24 hours.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Timeline</p>
              <p className="text-muted-foreground mt-1">
                Most change requests are processed within 24 hours. Urgent requests (events within 7 days) are prioritized and typically reviewed within 4-6 hours.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-muted-foreground text-center">
            Questions about your change request? Contact us at{' '}
            <a href="mailto:soultrainseatery@gmail.com" className="text-primary hover:underline font-medium">
              soultrainseatery@gmail.com
            </a>
            {' '}or{' '}
            <a href="tel:+18439700265" className="text-primary hover:underline font-medium">
              (843) 970-0265
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
