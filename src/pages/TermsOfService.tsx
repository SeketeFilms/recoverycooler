import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Terms of Service</h1>
        </div>

        <Card className="gentle-fade-in">
          <CardHeader>
            <CardTitle>Terms of Service for Recovery Cooler</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: February 2, 2026</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By downloading, installing, accessing, or using the Recovery Cooler mobile application 
                ("App," "Service," or "we/us/our"), you ("User" or "you") agree to be bound by these 
                Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our App.
              </p>
              <p className="text-muted-foreground mt-2">
                These Terms constitute a legally binding agreement between you and Sekete Films Production/Se-Mo Group 
                ("Company," "we," "us," or "our") concerning your access to and use of the Recovery Cooler 
                application and all related services, features, and content.
              </p>
              <p className="text-muted-foreground mt-2">
                We reserve the right to modify these Terms at any time. We will notify users of any material 
                changes by posting the new Terms within the App and updating the "Last updated" date. Your 
                continued use of the App after any such changes constitutes your acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">2. Description of Service</h2>
              <p className="text-muted-foreground">
                Recovery Cooler is a comprehensive addiction recovery support application designed to assist 
                individuals in their journey toward recovery from various addictions, including but not limited 
                to gambling, alcohol, and pornography addiction. The App provides:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                <li><strong>Progress Tracking:</strong> Tools to monitor recovery streaks, milestones, and achievements</li>
                <li><strong>Daily Motivational Content:</strong> Personalized quotes and encouragement based on addiction type</li>
                <li><strong>Cooldown Timer:</strong> Emergency intervention features for moments of crisis or urge</li>
                <li><strong>Spending Tracker:</strong> Financial monitoring tools to track and manage spending related to addiction</li>
                <li><strong>Recovery Journal:</strong> Personal journaling features for documenting experiences, triggers, and progress</li>
                <li><strong>Community Features:</strong> Forums and success story sharing with other users in recovery</li>
                <li><strong>AI Recovery Assistant:</strong> AI-powered chat support for guidance and conversation</li>
                <li><strong>Crisis Support:</strong> Access to emergency resources and helpline information</li>
                <li><strong>Self-Exclusion Tools:</strong> Website and outlet blocking features</li>
                <li><strong>Meditation Features:</strong> Guided meditation and mindfulness exercises</li>
                <li><strong>Accountability Partners:</strong> Connection with trusted support persons</li>
                <li><strong>Location Alerts:</strong> Geofencing alerts for risky locations</li>
                <li><strong>Weekly Reports:</strong> Progress reports and analytics</li>
                <li><strong>Relapse Prevention:</strong> Trigger management and coping strategy tools</li>
                <li><strong>Rebuild Life Modules:</strong> Comprehensive life improvement programs including finance recovery, relationship healing, building new habits, goal setting, and mental health support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold">3. User Eligibility</h2>
              <h3 className="text-base font-medium mt-4">3.1 Age Requirements</h3>
              <p className="text-muted-foreground">
                You must be at least 18 years of age to use this App. By using Recovery Cooler, you represent 
                and warrant that you are at least 18 years old and have the legal capacity to enter into 
                this agreement.
              </p>
              <h3 className="text-base font-medium mt-4">3.2 Account Registration</h3>
              <p className="text-muted-foreground">
                To access certain features of the App, you must create an account. When creating an account, 
                you agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your login credentials secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold">4. User Conduct and Responsibilities</h2>
              <h3 className="text-base font-medium mt-4">4.1 Acceptable Use</h3>
              <p className="text-muted-foreground">You agree to use the App only for lawful purposes and in accordance with these Terms. You agree not to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Use the App in any way that violates applicable laws or regulations</li>
                <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation</li>
                <li>Interfere with or disrupt the App's functionality or servers</li>
                <li>Attempt to gain unauthorized access to any part of the App</li>
                <li>Use automated systems (bots, scrapers) to access the App</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Engage in any conduct that restricts others' use of the App</li>
              </ul>
              <h3 className="text-base font-medium mt-4">4.2 Community Guidelines</h3>
              <p className="text-muted-foreground">When participating in community features (forums, success stories, comments), you agree to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Treat other users with respect and dignity</li>
                <li>Not post content that is harmful, threatening, abusive, harassing, defamatory, or hateful</li>
                <li>Not post content that promotes illegal activities or self-harm</li>
                <li>Not share personal information of others without consent</li>
                <li>Not post spam, advertisements, or solicitations</li>
                <li>Not post content that infringes intellectual property rights</li>
                <li>Support fellow community members in their recovery journey</li>
              </ul>
              <h3 className="text-base font-medium mt-4">4.3 Content Moderation</h3>
              <p className="text-muted-foreground">
                We reserve the right to remove or modify any user-generated content that violates these Terms 
                or is otherwise objectionable. Users may report inappropriate content through the App's 
                reporting feature. We may suspend or terminate accounts that repeatedly violate community guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">5. Privacy and Data Protection</h2>
              <p className="text-muted-foreground">
                Your privacy is important to us. Our collection, use, and protection of your personal 
                information is governed by our Privacy Policy, which is incorporated into these Terms by 
                reference. By using the App, you consent to the collection and use of your information as 
                described in our Privacy Policy.
              </p>
              <p className="text-muted-foreground mt-2">
                We are committed to protecting your sensitive recovery data. All personal information, 
                including journal entries, progress data, and health-related information, is encrypted 
                and stored securely.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">6. Intellectual Property Rights</h2>
              <h3 className="text-base font-medium mt-4">6.1 Our Intellectual Property</h3>
              <p className="text-muted-foreground">
                The App and its original content, features, and functionality are owned by Sekete Films 
                Production/Se-Mo Group and are protected by international copyright, trademark, patent, 
                trade secret, and other intellectual property laws.
              </p>
              <h3 className="text-base font-medium mt-4">6.2 Limited License</h3>
              <p className="text-muted-foreground">
                We grant you a limited, non-exclusive, non-transferable, revocable license to use the App 
                for personal, non-commercial purposes in accordance with these Terms.
              </p>
              <h3 className="text-base font-medium mt-4">6.3 User Content</h3>
              <p className="text-muted-foreground">
                You retain ownership of content you create (journal entries, forum posts, success stories). 
                By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, 
                display, and distribute such content within the App for operational purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">7. Disclaimer of Warranties</h2>
              <h3 className="text-base font-medium mt-4">7.1 No Medical Advice</h3>
              <p className="text-muted-foreground font-semibold">
                IMPORTANT: RECOVERY COOLER IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE, DIAGNOSIS, 
                OR TREATMENT. The App is designed to support, not replace, the relationship between users 
                and their healthcare providers.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                <li>The App does not provide medical, psychiatric, or psychological treatment</li>
                <li>Always seek professional help for addiction treatment</li>
                <li>In case of emergency, contact emergency services immediately</li>
                <li>The AI Assistant provides general support, not professional counseling</li>
              </ul>
              <h3 className="text-base font-medium mt-4">7.2 Service Availability</h3>
              <p className="text-muted-foreground">
                THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER 
                EXPRESS OR IMPLIED. We do not guarantee that the App will be uninterrupted, secure, or 
                error-free.
              </p>
              <h3 className="text-base font-medium mt-4">7.3 Third-Party Resources</h3>
              <p className="text-muted-foreground">
                The App may contain links to external helplines and resources. We are not responsible for 
                the content, accuracy, or availability of these third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SEKETE FILMS PRODUCTION/SE-MO GROUP SHALL NOT BE 
                LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING 
                BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                <li>Loss of profits, data, use, or goodwill</li>
                <li>Interruption of service</li>
                <li>Any relapse or setback in recovery</li>
                <li>Decisions made based on App content</li>
                <li>Unauthorized access to your account</li>
                <li>Bugs, viruses, or errors in the App</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Our total liability for any claims arising from your use of the App shall not exceed the 
                amount you paid for the App in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">9. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to indemnify, defend, and hold harmless Sekete Films Production/Se-Mo Group, its 
                officers, directors, employees, and agents from any claims, damages, losses, liabilities, 
                costs, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Your use or misuse of the App</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another person or entity</li>
                <li>Content you post or share through the App</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold">10. Account Termination</h2>
              <h3 className="text-base font-medium mt-4">10.1 Termination by You</h3>
              <p className="text-muted-foreground">
                You may delete your account at any time through the App's settings or by contacting us. 
                Upon deletion, your personal data will be removed in accordance with our Privacy Policy 
                and applicable data protection laws.
              </p>
              <h3 className="text-base font-medium mt-4">10.2 Termination by Us</h3>
              <p className="text-muted-foreground">
                We reserve the right to suspend or terminate your account at any time, with or without 
                cause and with or without notice, for:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Violation of these Terms</li>
                <li>Conduct harmful to other users or the community</li>
                <li>Fraudulent or illegal activities</li>
                <li>Extended periods of inactivity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold">11. Dispute Resolution</h2>
              <h3 className="text-base font-medium mt-4">11.1 Governing Law</h3>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the 
                jurisdiction in which Sekete Films Production/Se-Mo Group operates, without regard 
                to conflict of law principles.
              </p>
              <h3 className="text-base font-medium mt-4">11.2 Informal Resolution</h3>
              <p className="text-muted-foreground">
                Before filing any formal dispute, you agree to first contact us at info@semogrouptech.com 
                to attempt to resolve the issue informally within thirty (30) days.
              </p>
              <h3 className="text-base font-medium mt-4">11.3 Arbitration</h3>
              <p className="text-muted-foreground">
                Any disputes that cannot be resolved informally shall be submitted to binding arbitration 
                in accordance with applicable arbitration rules. You waive any right to participate in 
                class action lawsuits against us.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">12. Special Provisions</h2>
              <h3 className="text-base font-medium mt-4">12.1 AI Assistant Disclaimer</h3>
              <p className="text-muted-foreground">
                The AI Recovery Assistant feature uses artificial intelligence to provide supportive 
                conversation. The AI:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Is not a licensed therapist, counselor, or medical professional</li>
                <li>May not always provide accurate or appropriate responses</li>
                <li>Should not be relied upon for crisis intervention</li>
                <li>Is designed for general support and encouragement only</li>
              </ul>
              <h3 className="text-base font-medium mt-4">12.2 Self-Exclusion Features</h3>
              <p className="text-muted-foreground">
                Self-exclusion and website blocking tools are provided as supplementary support. We do 
                not guarantee these features will prevent access to all targeted content. Users are 
                responsible for seeking comprehensive self-exclusion programs through official channels.
              </p>
              <h3 className="text-base font-medium mt-4">12.3 Location Services</h3>
              <p className="text-muted-foreground">
                Location-based features require your permission. We do not guarantee the accuracy of 
                location data or the reliability of location-based alerts.
              </p>
              <h3 className="text-base font-medium mt-4">12.4 Push Notifications</h3>
              <p className="text-muted-foreground">
                Push notifications are optional and can be disabled at any time through device settings 
                or the App. Notifications are designed to support recovery but may not always be delivered 
                due to technical limitations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">13. Miscellaneous</h2>
              <h3 className="text-base font-medium mt-4">13.1 Entire Agreement</h3>
              <p className="text-muted-foreground">
                These Terms, together with the Privacy Policy, constitute the entire agreement between 
                you and us regarding your use of the App.
              </p>
              <h3 className="text-base font-medium mt-4">13.2 Severability</h3>
              <p className="text-muted-foreground">
                If any provision of these Terms is found invalid or unenforceable, the remaining provisions 
                shall continue in full force and effect.
              </p>
              <h3 className="text-base font-medium mt-4">13.3 Waiver</h3>
              <p className="text-muted-foreground">
                Our failure to enforce any right or provision of these Terms shall not constitute a waiver 
                of such right or provision.
              </p>
              <h3 className="text-base font-medium mt-4">13.4 Assignment</h3>
              <p className="text-muted-foreground">
                You may not assign or transfer your rights under these Terms without our prior written 
                consent. We may assign our rights and obligations without restriction.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">14. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions, concerns, or feedback regarding these Terms of Service, please contact us:
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Email:</strong> info@semogrouptech.com<br />
                <strong>Developer:</strong> Sekete Films Production/Se-Mo Group<br />
                <strong>App Name:</strong> Recovery Cooler
              </p>
              <p className="text-muted-foreground mt-2">
                We strive to respond to all inquiries within 72 business hours.
              </p>
            </section>

            <section className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                By using Recovery Cooler, you acknowledge that you have read, understood, and agree to be 
                bound by these Terms of Service. If you do not agree to these Terms, please discontinue 
                use of the App immediately.
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

export default TermsOfService;
