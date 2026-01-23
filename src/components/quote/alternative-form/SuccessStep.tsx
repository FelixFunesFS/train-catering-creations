import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, Clock, Mail, Phone, ArrowLeft, Download, Share2, Home } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { Link } from "react-router-dom";
import { downloadICSFile, getGoogleCalendarUrl } from "@/utils/calendarExport";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";

interface SuccessStepProps {
  estimatedCost: number | null;
  quoteId?: string | null;
  eventData?: {
    eventName: string;
    eventDate: string;
    startTime?: string;
    location?: string;
    contactName?: string;
  };
}

export const SuccessStep = ({ estimatedCost, quoteId, eventData }: SuccessStepProps) => {
  const { toast } = useToast();
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
    delay: 100
  });

  const animationClass = useAnimationClass('scale-fade', isVisible);

  // Confetti celebration on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D97706', '#F59E0B', '#FBBF24']
      });
    }, 300);
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadCalendar = () => {
    if (eventData) {
      downloadICSFile(eventData);
      toast({
        title: "Calendar file downloaded",
        description: "Add this event to your calendar app"
      });
    }
  };

  const handleGoogleCalendar = () => {
    if (eventData) {
      window.open(getGoogleCalendarUrl(eventData), '_blank');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Soul Train\'s Eatery - Catering Quote',
      text: 'I just requested a catering quote from Soul Train\'s Eatery!',
      url: window.location.origin + '/request-quote'
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast({
        title: "Link copied!",
        description: "Share this link with friends planning events"
      });
    }
  };

  // Simple workflow progress inline component
  const WorkflowProgress = () => (
    <div className="flex items-center justify-between gap-2 text-sm">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <CheckCircle className="h-4 w-4" />
        </div>
        <span className="mt-1 text-xs">Submitted</span>
      </div>
      <div className="flex-1 h-1 bg-muted rounded" />
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">2</div>
        <span className="mt-1 text-xs text-muted-foreground">Review</span>
      </div>
      <div className="flex-1 h-1 bg-muted rounded" />
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">3</div>
        <span className="mt-1 text-xs text-muted-foreground">Quote</span>
      </div>
      <div className="flex-1 h-1 bg-muted rounded" />
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">4</div>
        <span className="mt-1 text-xs text-muted-foreground">Confirmed</span>
      </div>
    </div>
  );

  return (
    <div ref={ref} className={`max-w-2xl mx-auto ${animationClass}`}>
      <Card className="neumorphic-card-2 border-0 bg-gradient-to-br from-card via-card/95 to-primary/5 text-center">
        <CardHeader className="pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6 animate-bounce-in">
            <CheckCircle className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-elegant text-foreground mb-4">
            Quote Request Submitted!
          </CardTitle>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Thank you for choosing Soul Train Seatery. We've received your request and will respond within 48 hours.
          </p>
          {quoteId && (
            <div className="bg-muted/30 rounded-lg p-4 mt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Reference ID:</strong> <span className="font-mono text-primary">{quoteId}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Please save this reference ID for your records.
              </p>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Workflow Progress */}
          <div className="mb-8">
            <h3 className="font-elegant text-lg mb-4 text-center">Your Quote Journey</h3>
            <WorkflowProgress />
          </div>

          {/* Quick Actions */}
          {eventData && (
            <div className="grid sm:grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGoogleCalendar}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Google Calendar
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleDownloadCalendar}
              >
                <Download className="h-4 w-4 mr-2" />
                Download .ics
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          )}

          {/* Social Proof */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-6 text-center">
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-500 text-xl">★</span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Join <strong className="text-foreground">500+ satisfied customers</strong> who trusted Soul Train's Eatery with their special events
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="space-y-4">
              <h3 className="font-elegant text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                What Happens Next?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mt-0.5">
                    1
                  </Badge>
                  <div>
                    <p className="font-medium">Quote Review</p>
                    <p className="text-sm text-muted-foreground">Our team reviews your requirements and preferences</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mt-0.5">
                    2
                  </Badge>
                  <div>
                    <p className="font-medium">Detailed Quote</p>
                    <p className="text-sm text-muted-foreground">We'll send a comprehensive quote within 48 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mt-0.5">
                    3
                  </Badge>
                  <div>
                    <p className="font-medium">Consultation</p>
                    <p className="text-sm text-muted-foreground">Optional call to discuss details and finalize arrangements</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-elegant text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Response Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm">Email confirmation</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Immediate
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm">Detailed quote</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Within 48hrs
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm">Follow-up call</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    2-3 days
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <span className="text-sm font-medium">No response within 48hrs?</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    Call Us
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 rounded-lg p-6">
            <h3 className="font-elegant text-lg mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Need to Reach Us?
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href="mailto:soultrainseatery@gmail.com" className="story-link">
                  soultrainseatery@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href="tel:8439700265" className="story-link">
                  (843) 970-0265
                </a>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              <strong>Important:</strong> If you don't hear back within 48 hours, please call (843) 970-0265.
            </p>
          </div>

          {/* FAQ Section */}
          <div className="bg-muted/30 rounded-lg p-6">
            <h3 className="font-elegant text-lg mb-4">Common Questions</h3>
            <div className="space-y-3 text-sm text-left">
              <div>
                <p className="font-medium text-foreground">When will I hear back?</p>
                <p className="text-muted-foreground">Within 48 hours via email with a detailed quote</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Can I make changes to my request?</p>
                <p className="text-muted-foreground">Yes! Call us at (843) 970-0265 or reply to our email</p>
              </div>
              <div>
                <p className="font-medium text-foreground">What if I need rush service?</p>
                <p className="text-muted-foreground">Contact us immediately at (843) 970-0265 for expedited quotes</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" className="neumorphic-button-primary">
              <Link to="/request-quote" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Request Quote
              </Link>
            </Button>
            <Button asChild variant="outline" className="neumorphic-button-secondary">
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};