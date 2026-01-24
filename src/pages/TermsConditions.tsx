import { FileText, Mail, Globe, Shield, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection } from "@/components/ui/page-section";
import { Link } from "react-router-dom";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <PageSection pattern="a">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            badge={{
              icon: <FileText className="h-5 w-5" />,
              text: "Legal"
            }}
            title="Terms & Conditions"
            subtitle="Our Commitment to You"
            description="Please read these terms carefully before using our catering services. They outline the agreement between you and Soul Train's Eatery."
          />
        </div>
      </PageSection>

      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 py-12">
        <div className="prose prose-lg max-w-none">
          <div className="bg-card/50 backdrop-blur-sm border border-border/20 rounded-lg p-8 lg:p-12 xl:p-16 space-y-8">
            
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
                  <li>Military functions and ceremonies</li>
                  <li>Private party catering</li>
                  <li>Menu planning and consultation</li>
                  <li>Food preparation and delivery</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Electronic Communications</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  By submitting a quote request or engaging our services, you consent to receive
                  electronic communications from us, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Quote confirmations and estimates</li>
                  <li>Invoices and payment receipts</li>
                  <li>Event updates and reminders</li>
                  <li>Service-related announcements</li>
                </ul>
                <p>
                  These transactional communications are necessary for providing our services and
                  are not considered marketing communications. You may opt out of promotional
                  communications at any time by contacting us.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Booking and Payment</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>Deposits:</strong> A non-refundable deposit of 10% is required to secure your 
                  event date. This deposit will be credited towards your final payment.
                </p>
                <p>
                  <strong>Progress Payment:</strong> 50% of the total is required no later than 30 days 
                  prior to your event date.
                </p>
                <p>
                  <strong>Final Payment:</strong> The remaining balance is due no later than 14 days 
                  prior to the event date.
                </p>
                <p>
                  <strong>Menu Changes:</strong> Menu changes may be accommodated up to 7 days before
                  your event, subject to availability and additional charges.
                </p>
                <p>
                  <strong>Payment Methods:</strong> We accept payments through Stripe (credit/debit cards),
                  bank transfers, Venmo, Zelle, cash, and checks. All online payments are processed securely through Stripe.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Cancellation Policy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p><strong>Client Cancellations:</strong></p>
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
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Third-Party Services</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our website and services integrate with third-party services to provide you with
                  the best experience. By using our services, you acknowledge and agree to the
                  following:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Google Services:</strong> We use the Gmail API to send transactional
                    emails. Your use is subject to{" "}
                    <a
                      href="https://policies.google.com/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-primary/80"
                    >
                      Google's Terms of Service
                    </a>
                    .
                  </li>
                  <li>
                    <strong>Stripe Payments:</strong> Payment processing is handled by Stripe.
                    Your use is subject to{" "}
                    <a
                      href="https://stripe.com/legal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-primary/80"
                    >
                      Stripe's Terms of Service
                    </a>
                    .
                  </li>
                </ul>
                <p>
                  We are not responsible for the content, privacy policies, or practices of
                  third-party services. We encourage you to review their terms before using our services.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Service Modifications & Availability</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>Modifications:</strong> We reserve the right to modify, suspend, or
                  discontinue any aspect of our services at any time without notice. We may also
                  update these Terms and Conditions from time to time.
                </p>
                <p>
                  <strong>Availability:</strong> While we strive to ensure our website and online
                  services are always available, we do not guarantee uninterrupted access. We are
                  not liable for any downtime or technical issues.
                </p>
                <p>
                  <strong>Account Termination:</strong> We reserve the right to refuse service,
                  terminate accounts, or cancel orders at our discretion, particularly in cases
                  of Terms violation, fraudulent activity, or abusive behavior.
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
                  <li>Issues arising from third-party service disruptions</li>
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
              <h2 className="text-2xl font-semibold text-foreground mb-4">Privacy Policy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Your privacy is important to us. Please review our{" "}
                  <Link to="/privacy-policy" className="text-primary underline hover:text-primary/80">
                    Privacy Policy
                  </Link>{" "}
                  to understand how we collect, use, and protect your personal information,
                  including our use of Google APIs.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>For questions about these Terms and Conditions, please contact us:</p>
                <div className="space-y-2">
                  <p><strong>Soul Train's Eatery</strong></p>
                  <p>Email: soultrainseatery@gmail.com</p>
                  <p>Phone: (843) 970-0265</p>
                  <p>Service Area: Charleston's Lowcountry and surrounding areas</p>
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
                        Last updated: December 12, 2024
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
