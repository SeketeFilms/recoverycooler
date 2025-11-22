import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Phone, MessageSquare, Globe } from 'lucide-react';
import { countries } from '@/lib/countries';
import { countryResources, DEFAULT_RESOURCES } from '@/lib/helpResources';
import ShareJourney from '@/components/ShareJourney';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const Help = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [country, setCountry] = useState<string>('US');
  const [addictionType, setAddictionType] = useState<'gambling' | 'alcohol'>('gambling');

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('country, addiction_type')
      .eq('user_id', user.id)
      .single();

    if (data?.country) {
      setCountry(data.country);
    }
    if (data?.addiction_type) {
      setAddictionType(data.addiction_type as 'gambling' | 'alcohol');
    }
  };

  const countryData = countryResources[country] || DEFAULT_RESOURCES;
  const resources = countryData[addictionType];
  const countryName = countries.find(c => c.code === country)?.name || countryData.name;

  const faqs = addictionType === 'gambling' ? [
    {
      question: 'What is this app?',
      answer: 'This supportive app helps you manage gambling urges through guided meditation, spending tracking, and self-exclusion tools. It provides a safe space for reflection and recovery.',
    },
    {
      question: 'How does the cooldown feature work?',
      answer: 'The cooldown feature provides guided breathing exercises, meditation soundtracks, and mindfulness prompts to help you pause when you feel an urge. Choose between listening to calming sounds, breathing exercises, or a full 10-minute meditation session.',
    },
    {
      question: 'Will this app block gambling sites on my device?',
      answer: 'This app helps you maintain a list of sites to avoid, but it doesn\'t provide system-wide blocking. For device-level blocking, consider using parental controls or browser extensions in addition to this app.',
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
  ] : [
    {
      question: 'What is this app?',
      answer: 'This supportive app helps you manage alcohol cravings through guided meditation, spending tracking on alcohol, and access to recovery resources. It provides a safe space for reflection and recovery.',
    },
    {
      question: 'How does the cooldown feature work?',
      answer: 'The cooldown feature provides guided breathing exercises, meditation soundtracks, and mindfulness prompts to help you pause when you feel a craving. Choose between listening to calming sounds, breathing exercises, or a full 10-minute meditation session.',
    },
    {
      question: 'Can this app help me quit drinking?',
      answer: 'This app is a supportive tool designed to complement professional treatment and support groups like AA. It helps you track your progress, manage cravings, and access resources, but it\'s not a substitute for medical treatment or therapy.',
    },
    {
      question: 'Is my data safe and private?',
      answer: 'Yes. Your data is encrypted and stored securely. We only collect the minimum information needed to provide the service. You can delete your account and data at any time.',
    },
    {
      question: 'Can I share my progress with others?',
      answer: 'Currently, the app is designed for personal use. We recommend sharing your journey with a trusted friend, family member, sponsor, or counselor for additional support.',
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

        {/* Country & Addiction Type Indicator */}
        <Card className="gentle-fade-in bg-accent/20">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium">
                Showing <span className="text-primary">{addictionType === 'gambling' ? 'gambling' : 'alcohol'}</span> resources for: <span className="text-primary">{countryName}</span>
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              Change
            </Button>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="gentle-fade-in bg-destructive/10 border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg">Need Immediate Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resources.helplines.map((helpline, index) => (
              <div key={index} className="flex items-start gap-3">
                {helpline.phone ? (
                  <Phone className="w-5 h-5 text-destructive mt-0.5" />
                ) : (
                  <MessageSquare className="w-5 h-5 text-destructive mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{helpline.name}</p>
                  {helpline.phone && (
                    <a href={helpline.link} className="text-sm text-primary hover:underline">
                      {helpline.phone}
                    </a>
                  )}
                  {helpline.text && (
                    <p className="text-sm text-muted-foreground">{helpline.text}</p>
                  )}
                </div>
              </div>
            ))}
            
            {resources.websites.map((website, index) => (
              <div key={index} className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium">{website.name}</p>
                  <a
                    href={website.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {website.url.replace('https://', '').replace('www.', '')}
                  </a>
                </div>
              </div>
            ))}
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

        {/* Share Journey */}
        <ShareJourney />

        {/* Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Terms of Use</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-sm text-muted-foreground">
              This app is a self-help tool designed to support individuals in managing addictive
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
            <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border text-center font-medium">
              App by Sekete Films Production/Se-Mo Group
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;
