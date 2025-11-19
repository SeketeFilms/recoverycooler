import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Pause, RotateCcw, Volume2, VolumeX, WifiOff } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import BottomNav from '@/components/BottomNav';
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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<typeof meditationTracks[0] | null>(null);
  const playerRef = useRef<any>(null);
  const breathingPlayerRef = useRef<any>(null);
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  // Initialize YouTube player for breathing video
  useEffect(() => {
    if (selectedMode === 'breathing' && isOnline) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag.parentNode && !document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      (window as any).onYouTubeIframeAPIReady = () => {
        if (!breathingPlayerRef.current) {
          breathingPlayerRef.current = new (window as any).YT.Player('breathing-player', {
            videoId: 'uXcUYS9W0Oc',
            playerVars: {
              autoplay: 0,
              controls: 1,
              modestbranding: 1,
              rel: 0,
            },
          });
        }
      };
    }
  }, [selectedMode, isOnline]);

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
    if (selectedMode === 'breathing' && breathingPlayerRef.current) {
      if (isPlaying) {
        breathingPlayerRef.current.pauseVideo();
      } else {
        breathingPlayerRef.current.playVideo();
      }
    } else if (selectedMode === 'timed' && playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setCurrentStep(0);
    setElapsedTime(0);
    setIsPlaying(false);
    if (selectedMode === 'breathing' && breathingPlayerRef.current) {
      breathingPlayerRef.current.seekTo(0);
      breathingPlayerRef.current.pauseVideo();
    } else if (playerRef.current && selectedMode === 'timed') {
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
            {!isOnline && (
              <Alert className="bg-yellow-500/10 border-yellow-500/30">
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  Internet connection required for guided meditation video.
                </AlertDescription>
              </Alert>
            )}
            
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                  Addiction Meditation
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Guided meditation for addiction recovery
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Player */}
                <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
                  <div id="breathing-player" className="absolute top-0 left-0 w-full h-full" />
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                  <Button size="lg" className="flex-1" onClick={togglePlay} disabled={!isOnline}>
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
                  <Button variant="outline" size="lg" onClick={resetExercise} disabled={!isOnline}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restart
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                      disabled={elapsedTime >= 600 || !isOnline}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="mr-2 h-5 w-5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-5 w-5" />
                          {elapsedTime >= 600 ? 'Complete' : !isOnline ? 'Offline' : 'Start'}
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
      <BottomNav />
    </div>
  );
};

export default Cooldown;
