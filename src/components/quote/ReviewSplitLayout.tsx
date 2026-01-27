/**
 * Desktop split-view layout for the Review step (step 6).
 * Left panel: Review summary
 * Right panel: Submit CTA and confirmation details
 */

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Phone, Mail, Send, Shield, Users, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewSplitLayoutProps {
  reviewContent: ReactNode;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function ReviewSplitLayout({
  reviewContent,
  onSubmit,
  onBack,
  isSubmitting,
}: ReviewSplitLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex gap-8">
      {/* Left Panel - Review Summary (scrollable) */}
      <div className="w-[55%] overflow-y-auto pr-4 max-h-[calc(100vh-14rem)]">
        {reviewContent}
      </div>

      {/* Right Panel - Submit CTA (sticky) */}
      <div className="w-[45%] flex flex-col gap-6">
        {/* Ready to Submit Card */}
        <Card className="border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Send className="h-5 w-5 text-primary" />
              </div>
              Ready to Submit?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Your quote request will be sent to our team for review. We'll respond within 48 hours with a detailed quote.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>All details reviewed and ready</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>Response within 48 hours</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>Email confirmation sent immediately</span>
              </div>
            </div>

            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              size="lg"
              className="w-full h-14 text-lg font-semibold"
              variant="cta"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Submit Quote Request
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter ↵</kbd> to submit
            </p>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <Card className="border-muted">
          <CardContent className="py-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">20+ Years of Excellence</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">500+ Satisfied Customers</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">Charleston's Trusted Caterer</span>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Questions?</p>
          <div className="flex items-center justify-center gap-4">
            <a href="tel:+18439700265" className="flex items-center gap-1 text-primary hover:underline">
              <Phone className="h-3.5 w-3.5" />
              (843) 970-0265
            </a>
            <a href="mailto:soultrainseatery@gmail.com" className="flex items-center gap-1 text-primary hover:underline">
              <Mail className="h-3.5 w-3.5" />
              Email
            </a>
          </div>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mt-auto"
        >
          ← Back to Supplies
        </Button>
      </div>
    </div>
  );
}
