import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Pause } from 'lucide-react';

const breathingSteps = [
  "Take a slow, deep breath in through your nose for 4 counts...",
  "Hold your breath gently for 4 counts...",
  "Exhale slowly through your mouth for 6 counts...",
  "Notice how your body feels. You're doing great.",
  "Name 3 things you can see around you...",
  "Name 3 things you can hear right now...",
  "Feel your feet on the ground. You are safe.",
  "This urge is temporary. It will pass.",
  "You are stronger than you think.",
  "Take another deep breath. You've got this.",
];

const Cooldown = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < breathingSteps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => Math.min(prev + 1, breathingSteps.length - 1));
      }, 6000); // 6 seconds per step
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Guided Cooldown</h1>
        </div>

        {/* Breathing Circle */}
        <div className="flex justify-center py-12">
          <div className={`w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-medium ${isPlaying ? 'breathe-animation' : ''}`}>
            <p className="text-lg">Breathe</p>
          </div>
        </div>

        {/* Current Step */}
        <Card className="gentle-fade-in">
          <CardHeader>
            <CardTitle className="text-center text-lg">
              Step {currentStep + 1} of {breathingSteps.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xl leading-relaxed">{breathingSteps[currentStep]}</p>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex gap-4">
          <Button
            size="lg"
            className="flex-1"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                {currentStep === 0 ? 'Start' : 'Resume'}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={resetExercise}
          >
            Reset
          </Button>
        </div>

        {currentStep === breathingSteps.length - 1 && (
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="pt-6 text-center space-y-4">
              <p className="font-medium">You did it! Well done for taking this time for yourself.</p>
              <Button onClick={() => navigate('/home')} className="w-full">
                Return Home
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Crisis Support */}
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6 space-y-2">
            <p className="font-medium text-sm">In Crisis? Get Immediate Help:</p>
            <p className="text-sm">National Gambling Helpline: 1-800-522-4700</p>
            <p className="text-sm">Crisis Text Line: Text "HELLO" to 741741</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cooldown;
