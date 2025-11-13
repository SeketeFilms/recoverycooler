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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<typeof meditationTracks[0] | null>(null);
  const playerRef = useRef<any>(null);
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

  // Select random track when entering timed mode
  useEffect(() => {
    if (selectedMode === 'timed' && !selectedTrack) {
      const randomIndex = Math.floor(Math.random() * meditationTracks.length);
      setSelectedTrack(meditationTracks[randomIndex]);
    }
  }, [selectedMode, selectedTrack]);

  // Load YouTube IFrame API
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      if (selectedTrack && selectedMode === 'timed') {
        playerRef.current = new (window as any).YT.Player('session-player', {
          videoId: selectedTrack.videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (event: any) => {
              event.target.setVolume(volume * 100);
              if (isMuted) event.target.mute();
            },
          },
        });
      }
    };
  }, [selectedTrack, selectedMode]);

  // Update timer based on video playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedMode === 'timed' && playerRef.current) {
      interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const currentTime = Math.floor(playerRef.current.getCurrentTime());
          setElapsedTime(currentTime);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedMode]);

  // Control video playback
  useEffect(() => {
    if (playerRef.current && selectedMode === 'timed') {
      if (isPlaying) {
        playerRef.current.playVideo?.();
      } else {
        playerRef.current.pauseVideo?.();
      }
    }
  }, [isPlaying, selectedMode]);

  // Control volume
  useEffect(() => {
    if (playerRef.current && selectedMode === 'timed') {
      if (isMuted) {
        playerRef.current.mute?.();
      } else {
        playerRef.current.unMute?.();
        playerRef.current.setVolume?.(volume * 100);
      }
    }
  }, [volume, isMuted, selectedMode]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setCurrentStep(0);
    setElapsedTime(0);
    setIsPlaying(false);
    if (playerRef.current && selectedMode === 'timed') {
      playerRef.current.seekTo?.(0);
      playerRef.current.pauseVideo?.();
    }
    if (selectedMode === 'timed') {
      const randomIndex = Math.floor(Math.random() * meditationTracks.length);
      setSelectedTrack(meditationTracks[randomIndex]);
    }
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
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Guided Session
                </CardTitle>
                {selectedTrack && (
                  <p className="text-sm text-center text-muted-foreground">
                    Playing: {selectedTrack.name}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* YouTube Player (hidden) */}
                {selectedTrack && (
                  <div className="hidden">
                    <div id="session-player"></div>
                  </div>
                )}

                {/* Timer Display */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-48 h-48">
                    {/* Progress Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-primary/20"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - getProgressPercent() / 100)}`}
                        className="text-primary transition-all duration-300"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-foreground">
                        {formatTime(elapsedTime)}
                      </span>
                      <span className="text-sm text-muted-foreground mt-1">
                        {Math.round(getProgressPercent())}%
                      </span>
                    </div>
                  </div>

                  {/* Audio Controls */}
                  <div className="w-full max-w-xs space-y-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMuted(!isMuted)}
                        className="shrink-0"
                      >
                        {isMuted ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </Button>
                      <Slider
                        value={[isMuted ? 0 : volume * 100]}
                        onValueChange={(value) => {
                          setVolume(value[0] / 100);
                          if (value[0] > 0) setIsMuted(false);
                        }}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Play/Pause and Reset Controls */}
                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      onClick={togglePlay}
                      className="w-32"
                      disabled={elapsedTime >= 600}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="mr-2 h-5 w-5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-5 w-5" />
                          {elapsedTime >= 600 ? 'Complete' : 'Start'}
                        </>
                      )}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={resetExercise}
                      className="w-32"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>

                  {elapsedTime >= 600 && (
                    <p className="text-center text-lg font-medium text-primary animate-pulse">
                      Session complete! Well done! 🎉
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
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
