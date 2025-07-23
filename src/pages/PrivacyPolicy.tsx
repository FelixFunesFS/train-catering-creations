import { Shield, Lock, Eye, Mail } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
const PrivacyPolicy = () => {
  return <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <PageHeader title="Privacy Policy" description="Your privacy is important to us. This policy explains how we collect, use, and protect your personal information." icons={[<Shield className="h-6 w-6 sm:h-8 sm:w-8" />, <Lock className="h-6 w-6 sm:h-8 sm:w-8" />, <Eye className="h-6 w-6 sm:h-8 sm:w-8" />]} />

      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 py-12">
        <div className="prose prose-lg max-w-none">
          <div className="bg-card/50 backdrop-blur-sm border border-border/20 rounded-lg p-8 lg:p-12 xl:p-16 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We collect information you provide directly to us, such as when you:
                </p>
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
                  <li>Send you updates about our services (with your consent)</li>
                  <li>Improve our website and services</li>
                  <li>Comply with legal obligations</li>
                </ul>
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
                  <li>Service providers who assist us in operating our business</li>
                  <li>Legal requirements or to protect our rights</li>
                  <li>Business transfers (mergers, acquisitions, etc.)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We implement appropriate security measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction. However, 
                  no method of transmission over the internet is 100% secure.
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
              <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Restrict or object to certain processing</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you have questions about this Privacy Policy or our data practices, 
                  please contact us:
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Mail className="h-4 w-4" />
                  <span>Email: soultrainseatery@gmail.com</span>
                </div>
                <div className="mt-4">
                  <p className="text-sm">
                    <strong>Last updated:</strong> January 23, 2025
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>;
};
export default PrivacyPolicy;