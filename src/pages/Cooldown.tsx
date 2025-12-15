import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Pause, RotateCcw, Volume2, VolumeX, WifiOff } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

import OfflineIndicator from '@/components/OfflineIndicator';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

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

const meditationTracks = [
  { name: 'Night Water Flow 1', videoId: 'I9lq8gIp5es' },
  { name: 'Night Water Flow 2', videoId: 'X3TabauC0uk' },
  { name: 'Night Water Flow 3', videoId: 'JUDmFnqbrb8' },
  { name: 'Power Water Meditation 1', videoId: '81O5_-sFWGw' },
  { name: 'Power Water Meditation 2', videoId: 'QBl5rd-EJB4' },
  { name: 'Power Water Meditation 3', videoId: 'mzSeBjLGqu4' },
  { name: 'Rain & Calm Energy 1', videoId: 'M2zYCg4ExMs' },
  { name: 'Rain & Calm Energy 2', videoId: '8reUL35jWUU' },
  { name: 'Rain & Calm Energy 3', videoId: 'zGjLmtH38o0' },
];

const Cooldown = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'breathing' | 'meditation' | 'timed'>('breathing');
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  // Breathing exercise timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedMode === 'breathing' && currentStep < breathingSteps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => Math.min(prev + 1, breathingSteps.length - 1));
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, selectedMode]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-32">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="gentle-fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Guided Cooldown
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Take a moment to breathe and relax</p>
        </div>

        <Tabs value={selectedMode} onValueChange={(v) => {
          setSelectedMode(v as any);
          resetExercise();
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="breathing">Breathing</TabsTrigger>
            <TabsTrigger value="meditation">Meditation</TabsTrigger>
            <TabsTrigger value="timed">Session</TabsTrigger>
          </TabsList>

          {/* Breathing Exercise Tab */}
          <TabsContent value="breathing" className="space-y-6">
            {/* Breathing Circle */}
            <div className="flex justify-center py-8 sm:py-12">
              <div className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-medium transition-all duration-1000 ${isPlaying ? 'breathe-animation' : ''}`}>
                <p className="text-base sm:text-lg">Breathe</p>
              </div>
            </div>

            {/* Current Step */}
            <Card>
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
              <Button size="lg" className="flex-1" onClick={togglePlay}>
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
              <Button variant="outline" size="lg" onClick={resetExercise}>
                <RotateCcw className="mr-2 h-4 w-4" />
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
          </TabsContent>

          {/* Meditation Soundtracks Tab */}
          <TabsContent value="meditation" className="space-y-6">
            {!isOnline && (
              <Alert className="bg-yellow-500/10 border-yellow-500/30">
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  Internet connection required for meditation videos. Try breathing exercises while offline.
                </AlertDescription>
              </Alert>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Meditation</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-6">
                {meditationTracks.map((track, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="font-medium text-base">{track.name}</h3>
                    <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${track.videoId}?enablejsapi=1&rel=0`}
                        title={track.name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timed Session */}
          <TabsContent value="timed" className="space-y-6">
            {!isOnline && (
              <Alert className="bg-yellow-500/10 border-yellow-500/30">
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  Internet connection required for guided meditation. Try breathing exercises while offline.
                </AlertDescription>
              </Alert>
            )}
            
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Guided Session
                </CardTitle>
                <p className="text-sm text-center text-muted-foreground">
                  Addiction meditation for recovery
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/uXcUYS9W0Oc?enablejsapi=1&rel=0"
                    title="Addiction Meditation"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Crisis Support */}
        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/30 shadow-lg">
          <CardContent className="pt-6 space-y-3">
            <p className="font-semibold text-base text-center">Need Immediate Help?</p>
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center text-base font-medium border-2 hover:bg-destructive/20 transition-all duration-500 ease-in-out hover:scale-[1.02] hover:shadow-md"
              onClick={() => navigate('/help')}
            >
              View Support Resources
            </Button>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
};

export default Cooldown;
