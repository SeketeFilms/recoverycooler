import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>

        <Card className="gentle-fade-in">
          <CardHeader>
            <CardTitle>Privacy Policy for Recovery Cooler</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: January 21, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-lg font-semibold">1. Introduction</h2>
              <p className="text-muted-foreground">
                Welcome to Recovery Cooler ("we," "our," or "us"). We are committed to protecting your privacy 
                and personal information. This Privacy Policy explains how we collect, use, disclose, and 
                safeguard your information when you use our mobile application.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">2. Information We Collect</h2>
              <h3 className="text-base font-medium mt-4">2.1 Personal Information</h3>
              <p className="text-muted-foreground">When you create an account, we may collect:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Email address</li>
                <li>Username (optional)</li>
                <li>Country/region</li>
                <li>Gender (optional)</li>
              </ul>

              <h3 className="text-base font-medium mt-4">2.2 Usage Data</h3>
              <p className="text-muted-foreground">We automatically collect:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>App usage statistics</li>
                <li>Session duration and frequency</li>
                <li>Feature usage patterns</li>
                <li>Device information (device type, operating system)</li>
              </ul>

              <h3 className="text-base font-medium mt-4">2.3 Recovery Data</h3>
              <p className="text-muted-foreground">To provide our services, we collect:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Recovery progress and streak information</li>
                <li>Journal entries (stored securely and privately)</li>
                <li>Spending logs (if you choose to use this feature)</li>
                <li>Self-exclusion preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold">3. How We Use Your Information</h2>
              <p className="text-muted-foreground">We use the collected information to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Provide and maintain our services</li>
                <li>Track your recovery progress</li>
                <li>Send you motivational notifications (if enabled)</li>
                <li>Improve and personalize user experience</li>
                <li>Provide customer support</li>
                <li>Detect and prevent technical issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold">4. Data Storage and Security</h2>
              <p className="text-muted-foreground">
                Your data is stored securely using industry-standard encryption. We use secure cloud 
                infrastructure to protect your information. All data transmission is encrypted using 
                SSL/TLS protocols.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">5. Data Sharing</h2>
              <p className="text-muted-foreground">
                We do not sell, trade, or rent your personal information to third parties. We may share 
                anonymized, aggregated data for research purposes to improve addiction recovery support.
              </p>
              <p className="text-muted-foreground mt-2">We may disclose your information if required by law or to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Comply with legal obligations</li>
                <li>Protect our rights and safety</li>
                <li>Prevent fraud or security issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold">6. Your Rights</h2>
              <p className="text-muted-foreground">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and all associated data</li>
                <li>Export your data</li>
                <li>Opt out of notifications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold">7. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our app is intended for users aged 18 and older. We do not knowingly collect information 
                from children under 18. If you believe a child has provided us with personal information, 
                please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">8. Third-Party Services</h2>
              <p className="text-muted-foreground">
                Our app may contain links to external resources and helplines. We are not responsible for 
                the privacy practices of these third-party services. We encourage you to review their 
                privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">9. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">10. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy or your data, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Email:</strong> support@recoverycooler.com<br />
                <strong>Developer:</strong> Sekete Films Production/Se-Mo Group
              </p>
            </section>

            <section className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                By using Recovery Cooler, you agree to the collection and use of information in accordance 
                with this Privacy Policy.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
