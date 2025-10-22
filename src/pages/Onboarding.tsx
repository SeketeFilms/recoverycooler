import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Heart, Shield, TrendingDown } from 'lucide-react';

const slides = [
  {
    icon: Heart,
    title: 'Welcome to GambleCooler',
    description: 'A supportive space to help you manage urges, build healthy habits, and regain control of your life.',
  },
  {
    icon: Shield,
    title: 'Your Safe Space',
    description: 'Set spending limits, block harmful sites, and access guided meditations whenever you need support.',
  },
  {
    icon: TrendingDown,
    title: 'Progress, Not Perfection',
    description: 'Track your journey, celebrate wins, and remember: every step forward counts.',
  },
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/auth');
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-6">
      <Card className="w-full max-w-md gentle-fade-in">
        <CardContent className="pt-12 pb-8 space-y-8 text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center breathe-animation">
            <Icon className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold">{slide.title}</h1>
            <p className="text-muted-foreground leading-relaxed">{slide.description}</p>
          </div>
          <div className="flex gap-2 justify-center">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>
          <Button onClick={handleNext} size="lg" className="w-full">
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
