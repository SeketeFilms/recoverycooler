import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { ArrowLeft, Trophy, Calendar, Flame, TrendingUp, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';
import BottomNav from '@/components/BottomNav';

interface ProgressData {
  clean_since: string;
  current_streak: number;
  longest_streak: number;
  total_check_ins: number;
  last_check_in: string | null;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  badge_color: string;
  unlocked_at?: string;
}

const Progress = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgressData();
      loadAchievements();
    }
  }, [user]);

  const loadProgressData = async () => {
    try {
      const { data, error } = await supabase
        .from('progress_tracking')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Create initial progress record
        const { data: newProgress, error: insertError } = await supabase
          .from('progress_tracking')
          .insert({
            user_id: user!.id,
            clean_since: new Date().toISOString().split('T')[0],
            current_streak: 1,
            longest_streak: 1,
            total_check_ins: 1
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setProgress(newProgress);
      } else {
        setProgress(data);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const loadAchievements = async () => {
    try {
      // Get all achievements
      const { data: allAchievements, error: achError } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value');

      if (achError) throw achError;

      // Get user's unlocked achievements
      const { data: userAchievements, error: userAchError } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user!.id);

      if (userAchError) throw userAchError;

      // Merge data
      const mergedAchievements = allAchievements?.map(ach => ({
        ...ach,
        unlocked_at: userAchievements?.find(ua => ua.achievement_id === ach.id)?.unlocked_at
      })) || [];

      setAchievements(mergedAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!progress) return;

    try {
      const daysSinceStart = differenceInDays(new Date(), new Date(progress.clean_since));
      const newStreak = daysSinceStart + 1;

      const { error } = await supabase
        .from('progress_tracking')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, progress.longest_streak),
          total_check_ins: progress.total_check_ins + 1,
          last_check_in: new Date().toISOString()
        })
        .eq('user_id', user!.id);

      if (error) throw error;

      toast.success('Daily check-in completed! 🎉');
      loadProgressData();
      checkForNewAchievements(newStreak, progress.total_check_ins + 1);
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to complete check-in');
    }
  };

  const checkForNewAchievements = async (streak: number, checkIns: number) => {
    const streakAchievements = achievements.filter(
      a => a.requirement_type === 'streak_days' && 
           a.requirement_value <= streak && 
           !a.unlocked_at
    );

    const checkInAchievements = achievements.filter(
      a => a.requirement_type === 'check_ins' && 
           a.requirement_value <= checkIns && 
           !a.unlocked_at
    );

    const newAchievements = [...streakAchievements, ...checkInAchievements];

    for (const achievement of newAchievements) {
      await supabase.from('user_achievements').insert({
        user_id: user!.id,
        achievement_id: achievement.id
      });
      toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`);
    }

    if (newAchievements.length > 0) {
      loadAchievements();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const cleanDays = progress ? differenceInDays(new Date(), new Date(progress.clean_since)) : 0;
  const unlockedCount = achievements.filter(a => a.unlocked_at).length;
  const progressPercent = (unlockedCount / achievements.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-28">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Your Progress</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 gentle-fade-in">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Clean Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{cleanDays}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Since {new Date(progress?.clean_since || '').toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flame className="h-4 w-4 text-accent" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{progress?.current_streak || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Longest: {progress?.longest_streak || 0} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                Total Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{progress?.total_check_ins || 0}</div>
              <Button 
                onClick={handleCheckIn} 
                size="sm" 
                className="mt-2 w-full"
              >
                Daily Check-in
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <Card className="gentle-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  {unlockedCount} of {achievements.length} unlocked
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {Math.round(progressPercent)}%
              </Badge>
            </div>
            <ProgressBar value={progressPercent} className="mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id}
                  className={achievement.unlocked_at ? 'border-primary/50 bg-primary/5' : 'opacity-60'}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          achievement.unlocked_at ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{achievement.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {achievement.description}
                          </CardDescription>
                        </div>
                      </div>
                      {achievement.unlocked_at && (
                        <Badge variant="default" className="ml-2">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default Progress;
