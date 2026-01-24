import { Shield, Mail, Database, Globe, Clock, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection } from "@/components/ui/page-section";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <PageSection pattern="a">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            badge={{
              icon: <Shield className="h-5 w-5" />,
              text: "Legal"
            }}
            title="Privacy Policy"
            subtitle="Protecting Your Information"
            description="Your privacy is important to us. This policy explains how we collect, use, and protect your personal information."
          />
        </div>
      </PageSection>

      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 py-12">
        <div className="prose prose-lg max-w-none">
          <div className="bg-card/50 backdrop-blur-sm border border-border/20 rounded-lg p-8 lg:p-12 xl:p-16 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We collect information you provide directly to us, such as when you:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Request a catering quote through our forms</li>
                  <li>Contact us via phone, email, or our website</li>
                  <li>Subscribe to our newsletter or updates</li>
                  <li>Interact with our social media pages</li>
                </ul>
                <p>
                  This may include your name, email address, phone number, event details,
                  dietary preferences, and any other information you choose to provide.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide catering quotes and services</li>
                  <li>Communicate with you about your events</li>
                  <li>Send transactional emails (quotes, estimates, invoices, confirmations)</li>
                  <li>Send you updates about our services (with your consent)</li>
                  <li>Improve our website and services</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Third-Party Services & APIs</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We use the following third-party services to operate our business and provide you with the best experience:
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Google Gmail API</h3>
                    <p>
                      We use the Gmail API to send transactional emails to customers, including quote confirmations,
                      estimates, invoices, and event updates. Our application connects to Google's Gmail service
                      solely for sending business communications on behalf of Soul Train's Eatery.
                    </p>
                    <p className="mt-2">
                      <strong>What we access:</strong> We only request permission to send emails using the
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm mx-1">gmail.send</code> scope.
                      We do <strong>not</strong> read, access, or store the contents of any personal Gmail inbox or messages.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground">Supabase</h3>
                    <p>
                      We use Supabase for secure database hosting, user authentication, and backend services.
                      Your data is stored securely using industry-standard encryption.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground">Stripe</h3>
                    <p>
                      We use Stripe to process payments securely. Payment information is handled directly by
                      Stripe and is not stored on our servers. Stripe is PCI-DSS compliant.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Google API Data Usage Disclosure</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Soul Train's Eatery's use and transfer of information received from Google APIs adheres to the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the Limited Use requirements.
                </p>
                
                <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-foreground">Our Gmail API Usage:</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Purpose:</strong> We only use the Gmail API to send transactional emails related
                      to your catering orders (quote confirmations, estimates, invoices, and event updates).
                    </li>
                    <li>
                      <strong>Scope:</strong> We request only the <code className="bg-background px-1 py-0.5 rounded text-sm">gmail.send</code> scope,
                      which allows us to send emails. We cannot and do not read your emails.
                    </li>
                    <li>
                      <strong>Data Storage:</strong> We store OAuth authentication tokens securely to maintain
                      email sending capability. These tokens are encrypted and stored in our secure database.
                    </li>
                    <li>
                      <strong>No Sharing:</strong> We do not share, transfer, or sell any data obtained through
                      Google APIs to third parties.
                    </li>
                    <li>
                      <strong>No AI/ML Training:</strong> We do not use data obtained through Google APIs to
                      develop, improve, or train generalized AI or machine learning models.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Data Retention</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>We retain your personal information for the following periods:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Quote and Event Data:</strong> Retained for 7 years after the event date
                    for accounting and legal compliance purposes.
                  </li>
                  <li>
                    <strong>Contact Information:</strong> Retained as long as you are an active customer
                    or until you request deletion.
                  </li>
                  <li>
                    <strong>Payment Records:</strong> Retained for 7 years as required by tax regulations.
                  </li>
                  <li>
                    <strong>Authentication Tokens:</strong> OAuth tokens are refreshed automatically and
                    stored only as long as necessary to provide email services.
                  </li>
                </ul>
                <p>
                  You may request deletion of your personal data at any time by contacting us.
                  We will comply with your request within 30 days, except where retention is required by law.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Information Sharing</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties
                  without your consent, except in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Service Providers:</strong> Trusted third-party services that assist us in
                    operating our business (Supabase, Google, Stripe) under strict confidentiality agreements.
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or to protect our rights.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale
                    of assets, with notice to affected users.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We implement appropriate security measures to protect your personal information
                  against unauthorized access, alteration, disclosure, or destruction. This includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited employee access to personal information</li>
                </ul>
                <p>
                  However, no method of transmission over the internet is 100% secure. We cannot
                  guarantee absolute security of your data.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies and Tracking</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our website may use cookies and similar tracking technologies to enhance your
                  browsing experience. You can control cookie settings through your browser preferences.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Your Rights</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and obtain a copy of your personal information</li>
                  <li>Update or correct your personal information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Restrict or object to certain processing</li>
                  <li>Revoke OAuth access permissions at any time</li>
                </ul>
                <p>
                  To revoke Gmail API access, you can visit your{" "}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80"
                  >
                    Google Account permissions page
                  </a>{" "}
                  and remove Soul Train's Eatery from the list of connected apps.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">California Privacy Rights (CCPA)</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>If you are a California resident, you have additional rights under the CCPA:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Right to Know:</strong> You can request details about the personal information
                    we collect, use, and disclose about you.
                  </li>
                  <li>
                    <strong>Right to Delete:</strong> You can request deletion of your personal information,
                    subject to certain exceptions.
                  </li>
                  <li>
                    <strong>Right to Opt-Out of Sale:</strong> We do not sell your personal information
                    to third parties.
                  </li>
                  <li>
                    <strong>Right to Non-Discrimination:</strong> We will not discriminate against you
                    for exercising your privacy rights.
                  </li>
                </ul>
                <p>
                  To exercise these rights, please contact us at soultrainseatery@gmail.com.
                  We will respond to your request within 45 days.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you have questions about this Privacy Policy or our data practices,
                  please contact us:
                </p>
                <div className="space-y-2">
                  <p><strong>Soul Train's Eatery</strong></p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email: soultrainseatery@gmail.com</span>
                  </div>
                  <p>Phone: (843) 970-0265</p>
                  <p>Service Area: Charleston's Lowcountry and surrounding areas</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm">
                    <strong>Last updated:</strong> December 12, 2024
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
