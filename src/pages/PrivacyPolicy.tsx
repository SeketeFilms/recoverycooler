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
            <p className="text-sm text-muted-foreground">Last updated: February 2, 2026</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-lg font-semibold">1. Introduction</h2>
              <p className="text-muted-foreground">
                Welcome to Recovery Cooler ("we," "our," "us," or the "App"), developed and operated by 
                Sekete Films Production/Se-Mo Group. We are committed to protecting your privacy and 
                personal information. This Privacy Policy explains how we collect, use, disclose, and 
                safeguard your information when you use our mobile application and related services.
              </p>
              <p className="text-muted-foreground mt-2">
                We understand that recovery from addiction is a deeply personal journey, and we take 
                the protection of your sensitive health information very seriously. This policy is 
                designed to be transparent about our data practices while ensuring compliance with 
                applicable data protection laws including GDPR, CCPA, and other regional regulations.
              </p>
              <p className="text-muted-foreground mt-2">
                By using Recovery Cooler, you consent to the data practices described in this Privacy 
                Policy. If you do not agree with our practices, please do not use our App.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">2. Information We Collect</h2>
              
              <h3 className="text-base font-medium mt-4">2.1 Personal Information You Provide</h3>
              <p className="text-muted-foreground">When you create an account and use our services, we may collect:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Account Information:</strong> Email address (required for account creation and recovery)</li>
                <li><strong>Profile Information:</strong> Username/display name (optional), full name (optional)</li>
                <li><strong>Demographic Information:</strong> Country/region, gender (optional)</li>
                <li><strong>Addiction Type:</strong> Your selected recovery focus (gambling, alcohol, or pornography)</li>
                <li><strong>Avatar/Profile Picture:</strong> If you choose to upload one</li>
              </ul>

              <h3 className="text-base font-medium mt-4">2.2 Recovery and Health-Related Data</h3>
              <p className="text-muted-foreground">To provide our core recovery support services, we collect:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Progress Tracking:</strong> Recovery start date, current streak, longest streak, check-in history</li>
                <li><strong>Journal Entries:</strong> Personal notes, mood ratings, triggers, coping strategies used, gratitude entries, photos</li>
                <li><strong>Spending Logs:</strong> Financial amounts and notes (if you use the spending tracker)</li>
                <li><strong>Spending Limits:</strong> Daily spending limits you set</li>
                <li><strong>Self-Exclusion Data:</strong> Blocked websites and domains</li>
                <li><strong>Personal Triggers:</strong> Trigger categories, names, severity ratings, and notes</li>
                <li><strong>Coping Strategies:</strong> Strategy names, descriptions, effectiveness ratings</li>
                <li><strong>Risky Locations:</strong> Location names, coordinates (optional), and notes</li>
              </ul>

              <h3 className="text-base font-medium mt-4">2.3 Community Content</h3>
              <p className="text-muted-foreground">If you participate in community features, we collect:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Success Stories:</strong> Stories you share, titles, content, anonymity preferences</li>
                <li><strong>Forum Posts:</strong> Posts, comments, and discussions you contribute</li>
                <li><strong>Comments:</strong> Replies and interactions with other users' content</li>
                <li><strong>Content Reports:</strong> Reports of inappropriate content you submit</li>
              </ul>

              <h3 className="text-base font-medium mt-4">2.4 AI Chat Interactions</h3>
              <p className="text-muted-foreground">When using the AI Recovery Assistant:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Chat messages and conversations</li>
                <li>Conversation history and context</li>
                <li>Addiction type context for personalized responses</li>
              </ul>

              <h3 className="text-base font-medium mt-4">2.5 Accountability Partner Data</h3>
              <p className="text-muted-foreground">If you use accountability features:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Partner connections and relationship status</li>
                <li>Notifications sent to partners (with your consent)</li>
              </ul>

              <h3 className="text-base font-medium mt-4">2.6 Technical and Usage Data</h3>
              <p className="text-muted-foreground">We automatically collect:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Device Information:</strong> Device type, operating system, device model</li>
                <li><strong>Session Data:</strong> Login times, session duration, IP address</li>
                <li><strong>App Usage:</strong> Features accessed, frequency of use, navigation patterns</li>
                <li><strong>Push Notification Tokens:</strong> Device tokens for sending notifications</li>
                <li><strong>User Agent:</strong> Browser and app version information</li>
                <li><strong>Location Data:</strong> Only if you enable location alerts (not collected by default)</li>
              </ul>

              <h3 className="text-base font-medium mt-4">2.7 App Reviews and Feedback</h3>
              <p className="text-muted-foreground">If you provide feedback:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Star ratings and review text</li>
                <li>Anonymity preferences for reviews</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold">3. How We Use Your Information</h2>
              <p className="text-muted-foreground">We use the collected information for the following purposes:</p>
              
              <h3 className="text-base font-medium mt-4">3.1 Core Service Delivery</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Provide and maintain the Recovery Cooler application</li>
                <li>Track and display your recovery progress and achievements</li>
                <li>Store and display your journal entries securely</li>
                <li>Power the AI Recovery Assistant with personalized context</li>
                <li>Enable community features and user interactions</li>
                <li>Send notifications and reminders (with your permission)</li>
                <li>Manage accountability partner connections</li>
                <li>Generate weekly progress reports</li>
              </ul>

              <h3 className="text-base font-medium mt-4">3.2 Personalization</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Display motivational quotes based on your addiction type</li>
                <li>Customize app features and content to your recovery focus</li>
                <li>Provide relevant crisis resources and helplines</li>
                <li>Suggest coping strategies based on your triggers</li>
              </ul>

              <h3 className="text-base font-medium mt-4">3.3 Communication</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Send check-in reminders and recovery notifications</li>
                <li>Notify accountability partners (with your consent)</li>
                <li>Alert you near risky locations (if enabled)</li>
                <li>Celebrate milestones and achievements</li>
                <li>Provide important service updates</li>
              </ul>

              <h3 className="text-base font-medium mt-4">3.4 Safety and Security</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Authenticate users and secure accounts</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Moderate community content</li>
                <li>Maintain session security</li>
                <li>Enable biometric authentication (optional)</li>
              </ul>

              <h3 className="text-base font-medium mt-4">3.5 Improvement and Analytics</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Analyze usage patterns to improve the app</li>
                <li>Debug technical issues</li>
                <li>Develop new features based on user needs</li>
                <li>Conduct anonymized research to advance addiction recovery support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold">4. Data Storage and Security</h2>
              
              <h3 className="text-base font-medium mt-4">4.1 Security Measures</h3>
              <p className="text-muted-foreground">We implement industry-standard security measures including:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest</li>
                <li><strong>Secure Infrastructure:</strong> Hosted on secure cloud infrastructure with regular security audits</li>
                <li><strong>Access Controls:</strong> Strict access controls and authentication requirements</li>
                <li><strong>Row-Level Security:</strong> Database-level security ensuring users only access their own data</li>
                <li><strong>Session Management:</strong> Secure session handling with automatic expiration</li>
                <li><strong>Biometric Protection:</strong> Optional biometric lock for additional security</li>
              </ul>

              <h3 className="text-base font-medium mt-4">4.2 Data Retention</h3>
              <p className="text-muted-foreground">
                We retain your data for as long as your account is active or as needed to provide services. 
                Upon account deletion, we will delete or anonymize your personal data within 30 days, except 
                where required by law to retain certain information.
              </p>

              <h3 className="text-base font-medium mt-4">4.3 Data Location</h3>
              <p className="text-muted-foreground">
                Your data is stored on secure servers. Data may be processed in different jurisdictions 
                with appropriate safeguards in place.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">5. Data Sharing and Disclosure</h2>
              
              <h3 className="text-base font-medium mt-4">5.1 We Do Not Sell Your Data</h3>
              <p className="text-muted-foreground font-semibold">
                We do not sell, trade, or rent your personal information to third parties for marketing 
                or advertising purposes.
              </p>

              <h3 className="text-base font-medium mt-4">5.2 Limited Sharing</h3>
              <p className="text-muted-foreground">We may share your information only in the following circumstances:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>With Your Consent:</strong> When you explicitly agree (e.g., sharing with accountability partners)</li>
                <li><strong>Service Providers:</strong> With trusted vendors who assist in app operations (under strict confidentiality)</li>
                <li><strong>AI Processing:</strong> With AI service providers to power the Recovery Assistant (anonymized where possible)</li>
                <li><strong>Community Features:</strong> Content you post publicly or anonymously in community sections</li>
              </ul>

              <h3 className="text-base font-medium mt-4">5.3 Legal Requirements</h3>
              <p className="text-muted-foreground">We may disclose your information if required to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Comply with legal obligations, court orders, or government requests</li>
                <li>Protect our rights, property, or safety</li>
                <li>Prevent fraud, abuse, or security issues</li>
                <li>Respond to emergency situations involving potential harm</li>
              </ul>

              <h3 className="text-base font-medium mt-4">5.4 Anonymized Data</h3>
              <p className="text-muted-foreground">
                We may share aggregated, anonymized data for research purposes to improve addiction 
                recovery support. This data cannot be used to identify individual users.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">6. Your Rights and Choices</h2>
              <p className="text-muted-foreground">Depending on your location, you may have the following rights:</p>
              
              <h3 className="text-base font-medium mt-4">6.1 Access Rights</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Request access to your personal data</li>
                <li>Obtain a copy of your data in a portable format</li>
                <li>Know what information we hold about you</li>
              </ul>

              <h3 className="text-base font-medium mt-4">6.2 Control Rights</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Correct inaccurate or incomplete data</li>
                <li>Delete your account and associated data</li>
                <li>Restrict processing of your data</li>
                <li>Object to certain uses of your data</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h3 className="text-base font-medium mt-4">6.3 Notification Preferences</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Enable or disable push notifications</li>
                <li>Customize notification types and timing</li>
                <li>Opt out of non-essential communications</li>
              </ul>

              <h3 className="text-base font-medium mt-4">6.4 How to Exercise Your Rights</h3>
              <p className="text-muted-foreground">
                You can exercise most rights through the App's settings. For data export or deletion 
                requests, visit our Data Deletion Request page or contact us at info@semogrouptech.com.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">7. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Recovery Cooler is intended for users aged 18 and older. We do not knowingly collect 
                personal information from children under 18 years of age.
              </p>
              <p className="text-muted-foreground mt-2">
                If we discover that we have inadvertently collected information from a child under 18, 
                we will take immediate steps to delete such information. If you believe a child under 
                18 has provided us with personal information, please contact us immediately at 
                info@semogrouptech.com.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">8. Third-Party Services</h2>
              <p className="text-muted-foreground">
                Our App may contain links to external resources, helplines, and support services. This 
                Privacy Policy does not apply to third-party websites or services.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                <li>We are not responsible for third-party privacy practices</li>
                <li>We encourage you to review third-party privacy policies</li>
                <li>External helplines and resources have their own data practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold">9. Cookies and Tracking</h2>
              <p className="text-muted-foreground">
                The mobile app primarily uses local storage and secure tokens rather than traditional 
                cookies. We may use:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Session tokens for authentication</li>
                <li>Local storage for app preferences</li>
                <li>Analytics tools to understand app usage (anonymized)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold">10. International Data Transfers</h2>
              <p className="text-muted-foreground">
                If you access our App from outside our primary jurisdiction, your data may be transferred 
                to and processed in other countries. We ensure appropriate safeguards are in place, such 
                as standard contractual clauses, to protect your data during international transfers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">11. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time to reflect changes in our practices, 
                technology, legal requirements, or other factors.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                <li>We will notify you of material changes through the App or email</li>
                <li>The "Last updated" date at the top indicates when changes were made</li>
                <li>Continued use after changes constitutes acceptance of the updated policy</li>
                <li>We encourage you to review this policy periodically</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold">12. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data 
                practices, please contact us:
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Email:</strong> info@semogrouptech.com<br />
                <strong>Developer:</strong> Sekete Films Production/Se-Mo Group<br />
                <strong>App Name:</strong> Recovery Cooler
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Data Protection Inquiries:</strong> For GDPR-related requests or data protection 
                concerns, please include "Privacy Request" in your email subject line.
              </p>
              <p className="text-muted-foreground mt-2">
                We strive to respond to all privacy-related inquiries within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">13. Your California Privacy Rights (CCPA)</h2>
              <p className="text-muted-foreground">
                If you are a California resident, you have additional rights under the California Consumer 
                Privacy Act (CCPA):
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of sale of personal information (we do not sell your data)</li>
                <li>Right to request deletion of personal information</li>
                <li>Right to non-discrimination for exercising your rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold">14. European Users' Rights (GDPR)</h2>
              <p className="text-muted-foreground">
                If you are in the European Economic Area (EEA), you have rights under the General Data 
                Protection Regulation (GDPR):
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Legal bases for processing: consent, contract performance, legitimate interests, and legal obligations.
              </p>
            </section>

            <section className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                By using Recovery Cooler, you agree to the collection and use of information in accordance 
                with this Privacy Policy. Your trust is important to us, and we are committed to protecting 
                your privacy throughout your recovery journey.
              </p>
              <p className="text-sm text-muted-foreground text-center mt-4">
                © 2025-2026 Sekete Films Production/Se-Mo Group. All rights reserved.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
