import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Phone, MessageSquare, Globe } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const countryResources = {
  US: {
    name: 'United States',
    helplines: [
      { name: 'National Gambling Helpline', phone: '1-800-522-4700', link: 'tel:1-800-522-4700' },
      { name: 'Crisis Text Line', text: 'Text "HELLO" to 741741', link: 'sms:741741&body=HELLO' },
    ],
    websites: [
      { name: 'National Council on Problem Gambling', url: 'https://www.ncpgambling.org' },
      { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
    ],
  },
  GB: {
    name: 'United Kingdom',
    helplines: [
      { name: 'National Gambling Helpline', phone: '0808 8020 133', link: 'tel:08088020133' },
      { name: 'GamCare Live Chat', text: 'Visit gamcare.org.uk', link: 'https://www.gamcare.org.uk' },
    ],
    websites: [
      { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
      { name: 'BeGambleAware', url: 'https://www.begambleaware.org' },
      { name: 'Gamblers Anonymous UK', url: 'https://www.gamblersanonymous.org.uk' },
    ],
  },
  CA: {
    name: 'Canada',
    helplines: [
      { name: 'Problem Gambling Helpline', phone: '1-866-531-2600', link: 'tel:1-866-531-2600' },
      { name: 'ConnexOntario (Ontario)', phone: '1-866-531-2600', link: 'tel:1-866-531-2600' },
    ],
    websites: [
      { name: 'Problem Gambling Institute of Ontario', url: 'https://www.problemgambling.ca' },
      { name: 'Responsible Gambling Council', url: 'https://www.responsiblegambling.org' },
    ],
  },
  AU: {
    name: 'Australia',
    helplines: [
      { name: 'National Gambling Helpline', phone: '1800 858 858', link: 'tel:1800858858' },
      { name: 'Gambling Help Online', text: 'Chat available 24/7', link: 'https://www.gamblinghelponline.org.au' },
    ],
    websites: [
      { name: 'Gambling Help Online', url: 'https://www.gamblinghelponline.org.au' },
      { name: 'Gamblers Anonymous Australia', url: 'https://www.gaaustralia.org.au' },
    ],
  },
  NZ: {
    name: 'New Zealand',
    helplines: [
      { name: 'Gambling Helpline', phone: '0800 654 655', link: 'tel:0800654655' },
      { name: 'Problem Gambling Foundation', phone: '0800 664 262', link: 'tel:0800664262' },
    ],
    websites: [
      { name: 'Problem Gambling Foundation', url: 'https://www.pgf.nz' },
      { name: 'Gambling Helpline', url: 'https://www.gamblinghelpline.co.nz' },
    ],
  },
  IE: {
    name: 'Ireland',
    helplines: [
      { name: 'Problem Gambling Ireland', phone: '089 241 5401', link: 'tel:0892415401' },
      { name: 'Dunlewey Addiction Services', phone: '01 853 5444', link: 'tel:018535444' },
    ],
    websites: [
      { name: 'Problem Gambling Ireland', url: 'https://www.problemgambling.ie' },
      { name: 'Gamblers Anonymous Ireland', url: 'https://www.gamblersanonymous.ie' },
    ],
  },
  IN: {
    name: 'India',
    helplines: [
      { name: 'National Helpline', phone: '1800-11-0031', link: 'tel:1800110031' },
      { name: 'NIMHANS Helpline', phone: '080-46110007', link: 'tel:08046110007' },
    ],
    websites: [
      { name: 'Samhita Social Ventures', url: 'https://www.samhitasocialventures.org' },
      { name: 'NIMHANS', url: 'https://nimhans.ac.in' },
    ],
  },
  ZA: {
    name: 'South Africa',
    helplines: [
      { name: 'National Responsible Gambling', phone: '0800 006 008', link: 'tel:0800006008' },
      { name: 'SANCA', phone: '011 892 3829', link: 'tel:0118923829' },
    ],
    websites: [
      { name: 'National Responsible Gambling Programme', url: 'https://www.responsiblegambling.co.za' },
      { name: 'SANCA', url: 'https://www.sanca.co.za' },
    ],
  },
};

const Help = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [country, setCountry] = useState<string>('US');

  useEffect(() => {
    if (user) {
      loadUserCountry();
    }
  }, [user]);

  const loadUserCountry = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('country')
      .eq('user_id', user.id)
      .single();

    if (data?.country) {
      setCountry(data.country);
    }
  };

  const resources = countryResources[country as keyof typeof countryResources] || countryResources.US;

  const faqs = [
    {
      question: 'What is GambleCooler?',
      answer: 'GambleCooler is a supportive app designed to help you manage gambling urges through guided meditation, spending tracking, and self-exclusion tools. It provides a safe space for reflection and recovery.',
    },
    {
      question: 'How does the cooldown feature work?',
      answer: 'The cooldown feature provides guided breathing exercises, meditation soundtracks, and mindfulness prompts to help you pause when you feel an urge. Choose between listening to calming sounds, breathing exercises, or a full 10-minute meditation session.',
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

        {/* Country Indicator */}
        <Card className="gentle-fade-in bg-accent/20">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium">
                Showing resources for: <span className="text-primary">{resources.name}</span>
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              Change Country
            </Button>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="gentle-fade-in bg-destructive/10 border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg">🆘 Need Immediate Help?</CardTitle>
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
