import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Phone, MessageSquare } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const Help = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: 'What is GambleCooler?',
      answer: 'GambleCooler is a supportive app designed to help you manage gambling urges through guided meditation, spending tracking, and self-exclusion tools. It provides a safe space for reflection and recovery.',
    },
    {
      question: 'How does the cooldown feature work?',
      answer: 'The cooldown feature provides guided breathing exercises and mindfulness prompts to help you pause when you feel an urge. It takes you through calming steps to help you regain control.',
    },
    {
      question: 'Will this app block gambling sites on my device?',
      answer: 'GambleCooler helps you maintain a list of sites to avoid, but it doesn\'t provide system-wide blocking. For device-level blocking, consider using parental controls or browser extensions in addition to this app.',
    },
    {
      question: 'Is my data safe and private?',
      answer: 'Yes. Your data is encrypted and stored securely. We only collect the minimum information needed to provide the service. You can delete your account and data at any time.',
    },
    {
      question: 'Can I share my progress with others?',
      answer: 'Currently, the app is designed for personal use. We recommend sharing your journey with a trusted friend, family member, or counselor for additional support.',
    },
    {
      question: 'What if I relapse?',
      answer: 'Recovery is not linear. If you experience a setback, be kind to yourself. Use the app to reflect, log what happened, and reach out for support. Every moment is a chance to start again.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Help & Support</h1>
        </div>

        {/* Emergency Contacts */}
        <Card className="gentle-fade-in bg-destructive/10 border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg">🆘 Need Immediate Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium">National Gambling Helpline</p>
                <a href="tel:1-800-522-4700" className="text-sm text-primary hover:underline">
                  1-800-522-4700
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium">Crisis Text Line</p>
                <p className="text-sm text-muted-foreground">Text "HELLO" to 741741</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium">National Council on Problem Gambling</p>
                <a
                  href="https://www.ncpgambling.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  ncpgambling.org
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Terms of Use</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-sm text-muted-foreground">
              GambleCooler is a self-help tool designed to support individuals in managing gambling
              behaviors. It is not a substitute for professional therapy or medical treatment.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This app is intended for adults (18+). By using this app, you acknowledge that you
              are taking personal responsibility for your recovery journey. If you are in crisis,
              please contact emergency services or a professional helpline immediately.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Use this app responsibly and in conjunction with professional support when needed.
              Recovery is possible, and you deserve support every step of the way.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;
