import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import BottomNav from '@/components/BottomNav';

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
  { name: 'Ocean Waves', duration: 600, description: 'Calming ocean sounds' },
  { name: 'Forest Rain', duration: 600, description: 'Peaceful rainfall in nature' },
  { name: 'Gentle Piano', duration: 600, description: 'Soft piano melodies' },
  { name: 'Tibetan Bowls', duration: 600, description: 'Healing sound bath' },
];

const Cooldown = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'breathing' | 'meditation' | 'timed'>('breathing');
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

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

  // Timed session timer (10 minutes = 600 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedMode === 'timed' && elapsedTime < 600) {
      interval = setInterval(() => {
        setElapsedTime((prev) => Math.min(prev + 1, 600));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, elapsedTime, selectedMode]);

  // Setup audio element for meditation sounds
  useEffect(() => {
    if (selectedMode === 'meditation' || selectedMode === 'timed') {
      // In production, replace these with actual audio file URLs
      // For now, using Web Audio API to generate placeholder sounds
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      if (isPlaying && !isMuted) {
        // Create a simple ambient sound using oscillators
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 200 + (selectedTrack * 50); // Different frequency per track
        gainNode.gain.value = volume * 0.1; // Very low volume for ambient
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        
        return () => {
          oscillator.stop();
          audioContext.close();
        };
      }
    }
  }, [isPlaying, selectedMode, selectedTrack, volume, isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setCurrentStep(0);
    setElapsedTime(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercent = () => {
    if (selectedMode === 'breathing') {
      return ((currentStep + 1) / breathingSteps.length) * 100;
    }
    return (elapsedTime / 600) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
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
            <TabsTrigger value="timed">10 Min Session</TabsTrigger>
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
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Meditation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {meditationTracks.map((track, index) => (
                  <Button
                    key={index}
                    variant={selectedTrack === index ? 'default' : 'outline'}
                    className="w-full justify-start text-left"
                    onClick={() => {
                      setSelectedTrack(index);
                      setIsPlaying(false);
                      setElapsedTime(0);
                    }}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{track.name}</p>
                      <p className="text-xs opacity-70">{track.description}</p>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Visualization */}
            <div className="flex justify-center py-6 sm:py-8">
              <div className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-accent to-accent/40 flex items-center justify-center transition-all duration-1000 ${isPlaying ? 'wave-pulse' : ''}`}>
                <div className="text-center text-foreground px-4">
                  <p className="text-xs sm:text-sm font-medium">{meditationTracks[selectedTrack].name}</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-2">{formatTime(elapsedTime)}</p>
                </div>
              </div>
            </div>

            {/* Audio Controls */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <Slider
                    value={[volume * 100]}
                    onValueChange={(v) => setVolume(v[0] / 100)}
                    max={100}
                    step={1}
                    className="flex-1"
                    disabled={isMuted}
                  />
                </div>
                
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
                        Play
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="lg" onClick={resetExercise}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 10 Minute Timed Session Tab */}
          <TabsContent value="timed" className="space-y-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">10 Minute Breathing Session</p>
                <p className="text-xs text-muted-foreground">
                  Follow the breathing circle and let the time guide you
                </p>
              </CardContent>
            </Card>

            {/* Timer Circle */}
            <div className="flex justify-center py-6 sm:py-8">
              <div className="relative">
                <svg className="w-56 h-56 sm:w-64 sm:h-64 transform -rotate-90">
                  <circle
                    cx="112"
                    cy="112"
                    r="105"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-muted sm:hidden"
                  />
                  <circle
                    cx="112"
                    cy="112"
                    r="105"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 105}`}
                    strokeDashoffset={`${2 * Math.PI * 105 * (1 - getProgressPercent() / 100)}`}
                    className="text-primary transition-all duration-1000 sm:hidden"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted hidden sm:block"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 120}`}
                    strokeDashoffset={`${2 * Math.PI * 120 * (1 - getProgressPercent() / 100)}`}
                    className="text-primary transition-all duration-1000 hidden sm:block"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground ${isPlaying ? 'breathe-animation' : ''}`}>
                    <div className="text-center px-2">
                      <p className="text-2xl sm:text-3xl font-bold">{formatTime(600 - elapsedTime)}</p>
                      <p className="text-xs mt-1">remaining</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Breathing Instruction */}
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-lg leading-relaxed">
                  {isPlaying ? breathingSteps[Math.floor((elapsedTime / 60) % breathingSteps.length)] : "Press start to begin your 10-minute session"}
                </p>
              </CardContent>
            </Card>

            {/* Audio Controls */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <Slider
                    value={[volume * 100]}
                    onValueChange={(v) => setVolume(v[0] / 100)}
                    max={100}
                    step={1}
                    className="flex-1"
                    disabled={isMuted}
                  />
                  <p className="text-sm text-muted-foreground min-w-[80px]">Background sound</p>
                </div>
                
                <div className="flex gap-4">
                  <Button size="lg" className="flex-1" onClick={togglePlay} disabled={elapsedTime >= 600}>
                    {isPlaying ? (
                      <>
                        <Pause className="mr-2 h-5 w-5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        {elapsedTime === 0 ? 'Start' : elapsedTime >= 600 ? 'Completed' : 'Resume'}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="lg" onClick={resetExercise}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {elapsedTime >= 600 && (
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="pt-6 text-center space-y-4">
                  <p className="text-xl font-medium">🎉 Session Complete!</p>
                  <p className="text-sm">You've completed your 10-minute meditation. Well done!</p>
                  <Button onClick={() => navigate('/home')} className="w-full">
                    Return Home
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Crisis Support */}
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6 space-y-2">
            <p className="font-medium text-sm">In Crisis? Get Immediate Help:</p>
            <Button
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={() => navigate('/help')}
            >
              View Support Resources
            </Button>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default Cooldown;
