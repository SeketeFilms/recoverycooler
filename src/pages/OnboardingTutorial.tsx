import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wind, BookOpen, Snowflake, Heart, ChevronRight, ChevronLeft, SkipForward } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

const slides = [
  {
    icon: Heart,
    title: 'Welcome to RecoveryCooler',
    body: 'A gentle companion for your recovery. Tools, community, and progress — all in one place.',
    accent: 'from-primary/30 to-accent/30',
  },
  {
    icon: Wind,
    title: 'Breathing Exercises',
    body: 'When an urge hits, slow your breath. Box, 4-7-8, and calming patterns help you ride the wave.',
    accent: 'from-accent/30 to-primary/20',
  },
  {
    icon: BookOpen,
    title: 'Daily Journaling',
    body: 'Capture your mood, gratitude, and reflections. Writing it down is the first step to seeing patterns.',
    accent: 'from-primary/20 to-secondary/50',
  },
  {
    icon: Snowflake,
    title: 'Cooldown Sessions',
    body: 'Urges pass. Start a cooldown timer, breathe, and remember why you started this journey.',
    accent: 'from-secondary/40 to-accent/30',
  },
];

const OnboardingTutorial = () => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { triggerLight } = useHapticFeedback();
  const last = index === slides.length - 1;
  const Icon = slides[index].icon;

  const finish = async () => {
    if (user) {
      await supabase.from('profiles').update({ tutorial_completed: true }).eq('user_id', user.id);
    }
    navigate('/home');
  };

  const next = () => {
    triggerLight();
    if (last) finish();
    else setIndex(index + 1);
  };

  const back = () => {
    triggerLight();
    if (index > 0) setIndex(index - 1);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br ${slides[index].accent} p-6`}>
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={finish}>
          <SkipForward className="h-4 w-4 mr-1" /> Skip
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md gentle-fade-in">
          <CardContent className="pt-10 pb-8 text-center space-y-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{slides[index].title}</h2>
            <p className="text-muted-foreground leading-relaxed">{slides[index].body}</p>

            <div className="flex justify-center gap-2 pt-2">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? 'w-8 bg-primary' : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center max-w-md w-full mx-auto">
        <Button variant="ghost" onClick={back} disabled={index === 0}>
          <ChevronLeft className="h-5 w-5 mr-1" /> Back
        </Button>
        <Button size="lg" onClick={next}>
          {last ? 'Get Started' : 'Next'}
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
