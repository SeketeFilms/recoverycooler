import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Pause, RotateCcw, Wind, Heart, Brain, Moon } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface Exercise {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  duration: number;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfterExhale?: number;
  color: string;
}

const exercises: Exercise[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal parts inhale, hold, exhale, hold. Great for anxiety.',
    icon: Wind,
    duration: 240,
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfterExhale: 4,
    color: 'bg-primary/20 text-primary',
  },
  {
    id: '478',
    name: '4-7-8 Relaxation',
    description: 'Calming technique to reduce stress and improve sleep.',
    icon: Moon,
    duration: 180,
    inhale: 4,
    hold: 7,
    exhale: 8,
    color: 'bg-accent/20 text-accent',
  },
  {
    id: 'calm',
    name: 'Calming Breath',
    description: 'Simple breathing to center yourself in moments of urge.',
    icon: Heart,
    duration: 120,
    inhale: 4,
    hold: 2,
    exhale: 6,
    color: 'bg-destructive/20 text-destructive',
  },
  {
    id: 'focus',
    name: 'Focus Breath',
    description: 'Energizing breath pattern to increase alertness.',
    icon: Brain,
    duration: 180,
    inhale: 3,
    hold: 3,
    exhale: 3,
    color: 'bg-secondary/50 text-secondary-foreground',
  },
];

const Meditation = () => {
  const navigate = useNavigate();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdAfterExhale'>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
    };
  }, []);

  const startExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setTimeRemaining(exercise.duration);
    setCurrentPhase('inhale');
    setPhaseTime(exercise.inhale);
    setCycleCount(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!selectedExercise) return;

    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      startTimer();
    }
  };

  const startTimer = () => {
    if (!selectedExercise) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    runPhaseTimer();
  };

  const runPhaseTimer = () => {
    if (!selectedExercise) return;

    phaseIntervalRef.current = setInterval(() => {
      setPhaseTime((prev) => {
        if (prev <= 1) {
          advancePhase();
          return getNextPhaseTime();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const advancePhase = () => {
    if (!selectedExercise) return;

    setCurrentPhase((prev) => {
      switch (prev) {
        case 'inhale':
          return 'hold';
        case 'hold':
          return 'exhale';
        case 'exhale':
          if (selectedExercise.holdAfterExhale) {
            return 'holdAfterExhale';
          }
          setCycleCount((c) => c + 1);
          return 'inhale';
        case 'holdAfterExhale':
          setCycleCount((c) => c + 1);
          return 'inhale';
        default:
          return 'inhale';
      }
    });
  };

  const getNextPhaseTime = (): number => {
    if (!selectedExercise) return 4;

    switch (currentPhase) {
      case 'inhale':
        return selectedExercise.hold;
      case 'hold':
        return selectedExercise.exhale;
      case 'exhale':
        return selectedExercise.holdAfterExhale || selectedExercise.inhale;
      case 'holdAfterExhale':
        return selectedExercise.inhale;
      default:
        return selectedExercise.inhale;
    }
  };

  const resetExercise = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
    setIsPlaying(false);
    if (selectedExercise) {
      setTimeRemaining(selectedExercise.duration);
      setCurrentPhase('inhale');
      setPhaseTime(selectedExercise.inhale);
      setCycleCount(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'holdAfterExhale':
        return 'Hold';
    }
  };

  const getCircleScale = () => {
    if (!isPlaying) return 1;
    switch (currentPhase) {
      case 'inhale':
        return 1.3;
      case 'hold':
        return 1.3;
      case 'exhale':
        return 1;
      case 'holdAfterExhale':
        return 1;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-28">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Meditation & Breathing</h1>
            <p className="text-sm text-muted-foreground">Calm your mind, resist urges</p>
          </div>
        </div>

        {!selectedExercise ? (
          <div className="grid gap-4">
            {exercises.map((exercise) => {
              const Icon = exercise.icon;
              return (
                <Card
                  key={exercise.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01]"
                  onClick={() => startExercise(exercise)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${exercise.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{exercise.name}</CardTitle>
                        <CardDescription>{exercise.description}</CardDescription>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.floor(exercise.duration / 60)} min
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>Inhale: {exercise.inhale}s</span>
                      <span>•</span>
                      <span>Hold: {exercise.hold}s</span>
                      <span>•</span>
                      <span>Exhale: {exercise.exhale}s</span>
                      {exercise.holdAfterExhale && (
                        <>
                          <span>•</span>
                          <span>Hold: {exercise.holdAfterExhale}s</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedExercise.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedExercise(null)}>
                    Change
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Breathing Circle */}
                <div className="flex flex-col items-center justify-center py-8">
                  <div
                    className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center transition-transform duration-1000 ease-in-out"
                    style={{ transform: `scale(${getCircleScale()})` }}
                  >
                    <div className="w-36 h-36 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{phaseTime}</div>
                        <div className="text-sm font-medium">{getPhaseText()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Time Remaining</span>
                    <span className="font-mono">{formatTime(timeRemaining)}</span>
                  </div>
                  <Progress
                    value={((selectedExercise.duration - timeRemaining) / selectedExercise.duration) * 100}
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    Cycles completed: {cycleCount}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  <Button variant="outline" size="icon" onClick={resetExercise}>
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    className="w-32"
                    onClick={togglePlay}
                    disabled={timeRemaining === 0}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-5 w-5 mr-2" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" /> Start
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tips for Effective Breathing</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Find a comfortable seated or lying position</li>
                  <li>• Close your eyes to minimize distractions</li>
                  <li>• Breathe through your nose if possible</li>
                  <li>• Focus on the sensation of breath in your body</li>
                  <li>• If your mind wanders, gently return to the breath</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Meditation;
