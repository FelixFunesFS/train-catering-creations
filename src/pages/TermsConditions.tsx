import { FileText, Scale, Handshake, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
const TermsConditions = () => {
  return <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <PageHeader title="Terms & Conditions" description="Please read these terms carefully before using our catering services. They outline the agreement between you and Soul Train's Eatery." icons={[<FileText className="h-6 w-6 sm:h-8 sm:w-8" />, <Scale className="h-6 w-6 sm:h-8 sm:w-8" />, <Handshake className="h-6 w-6 sm:h-8 sm:w-8" />]} />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="prose prose-lg max-w-none">
          <div className="bg-card/50 backdrop-blur-sm border border-border/20 rounded-lg p-8 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  By requesting our catering services or using our website, you agree to be bound by 
                  these Terms and Conditions. If you do not agree with these terms, please do not 
                  use our services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Service Description</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Soul Train's Eatery provides professional catering services including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Wedding and event catering</li>
                  <li>Corporate catering</li>
                  <li>Private party catering</li>
                  <li>Menu planning and consultation</li>
                  <li>Food preparation and delivery</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Booking and Payment</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>Deposits:</strong> A deposit may be required to secure your event date. 
                  The deposit amount will be specified in your catering agreement.
                </p>
                <p>
                  <strong>Final Payment:</strong> Full payment is typically due prior to or on the day 
                  of your event, as specified in your catering agreement.
                </p>
                <p>
                  <strong>Menu Changes:</strong> Menu changes may be accommodated up to 7 days before 
                  your event, subject to availability and additional charges.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Cancellation Policy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>Client Cancellations:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>30+ days before event: Full refund minus processing fees</li>
                  <li>14-29 days before event: 50% refund of total contract</li>
                  <li>Less than 14 days: No refund, full payment due</li>
                </ul>
                <p>
                  <strong>Force Majeure:</strong> We are not liable for delays or inability to perform 
                  due to circumstances beyond our control (weather, natural disasters, government restrictions, etc.).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Food Safety and Allergies</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>Food Allergies:</strong> Please inform us of any food allergies or dietary 
                  restrictions when booking. While we take precautions, we cannot guarantee that our 
                  food is completely free from allergens.
                </p>
                <p>
                  <strong>Food Safety:</strong> We follow all applicable food safety regulations. 
                  Food is prepared fresh and should be consumed within recommended timeframes.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our liability is limited to the total amount paid for our services. We are not 
                  responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Damages to venue property</li>
                  <li>Indirect or consequential damages</li>
                  <li>Guest injuries not caused by our negligence</li>
                  <li>Food spoilage due to improper storage by client</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  All content on our website, including recipes, images, and branding, is the 
                  intellectual property of Soul Train's Eatery and is protected by copyright law.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  These terms are governed by the laws of South Carolina. Any disputes will be 
                  resolved in the courts of Charleston County, South Carolina.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  For questions about these Terms and Conditions, please contact us:
                </p>
                <div className="space-y-2">
                  <p><strong>Soul Train's Eatery</strong></p>
                  <p>Email: soultrainseatery@gmail.com</p>
                  <p>Phone: (843) 970-0265</p>
                </div>
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Important:</strong> These terms may be updated from time to time. 
                        The most current version will always be available on our website.
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                        Last updated: January 23, 2025
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>;
};
export default TermsConditions;