import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { ArrowLeft, Trophy, Calendar, Flame, TrendingUp, CheckCircle, RotateCcw, AlertTriangle, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';
import BottomNav from '@/components/BottomNav';
import RelapseInsights from '@/components/RelapseInsights';
import RelapseTrendCharts from '@/components/RelapseTrendCharts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RelapseLog {
  id: string;
  relapse_date: string;
  severity: number;
  triggers: string[] | null;
  notes: string | null;
  lessons_learned: string | null;
  mood_before: number | null;
  mood_after: number | null;
  created_at: string;
}

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
  const [relapseLogs, setRelapseLogs] = useState<RelapseLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Relapse log form state
  const [showRelapseDialog, setShowRelapseDialog] = useState(false);
  const [relapseSeverity, setRelapseSeverity] = useState([5]);
  const [relapseNotes, setRelapseNotes] = useState('');
  const [relapseLessons, setRelapseLessons] = useState('');
  const [relapseTriggers, setRelapseTriggers] = useState('');
  const [relapseMoodBefore, setRelapseMoodBefore] = useState([5]);
  const [relapseMoodAfter, setRelapseMoodAfter] = useState([3]);

  useEffect(() => {
    if (user) {
      loadProgressData();
      loadAchievements();
      loadRelapseLogs();
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

    // Check for streak milestones and send email notifications
    const milestones = [7, 14, 30, 60, 90, 180, 365];
    const hitMilestone = milestones.find(m => streak === m);
    
    if (hitMilestone) {
      try {
        const milestoneAchievement = newAchievements.find(a => 
          a.requirement_type === 'streak_days' && a.requirement_value === hitMilestone
        );
        
        await supabase.functions.invoke('send-streak-notification', {
          body: {
            milestone: hitMilestone,
            achievementName: milestoneAchievement?.name,
          },
        });
      } catch (error) {
        console.error('Failed to send streak notification:', error);
      }
    }

    if (newAchievements.length > 0) {
      loadAchievements();
    }
  };

  const handleResetProgress = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('progress_tracking')
        .update({
          clean_since: today,
          current_streak: 1,
          longest_streak: 1,
          total_check_ins: 1,
          last_check_in: new Date().toISOString()
        })
        .eq('user_id', user!.id);

      if (error) throw error;

      await supabase
        .from('user_achievements')
        .delete()
        .eq('user_id', user!.id);

      toast.success('Progress reset! Your fresh journey begins today 🌟');
      loadProgressData();
      loadAchievements();
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast.error('Failed to reset progress');
    }
  };

  const handleResetStreakOnly = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('progress_tracking')
        .update({
          clean_since: today,
          current_streak: 1,
          last_check_in: new Date().toISOString()
        })
        .eq('user_id', user!.id);

      if (error) throw error;

      toast.success('Streak reset! Your achievements are safe 🛡️');
      loadProgressData();
    } catch (error) {
      console.error('Error resetting streak:', error);
      toast.error('Failed to reset streak');
    }
  };

  const loadRelapseLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('relapse_logs')
        .select('*')
        .eq('user_id', user!.id)
        .order('relapse_date', { ascending: false });

      if (error) throw error;
      setRelapseLogs(data || []);
    } catch (error) {
      console.error('Error loading relapse logs:', error);
    }
  };

  const handleLogRelapse = async () => {
    try {
      const triggersArray = relapseTriggers.trim() 
        ? relapseTriggers.split(',').map(t => t.trim()).filter(Boolean)
        : null;

      const { error } = await supabase
        .from('relapse_logs')
        .insert({
          user_id: user!.id,
          severity: relapseSeverity[0],
          notes: relapseNotes || null,
          lessons_learned: relapseLessons || null,
          triggers: triggersArray,
          mood_before: relapseMoodBefore[0],
          mood_after: relapseMoodAfter[0],
        });

      if (error) throw error;

      toast.success('Setback logged. Every step teaches something valuable 💙');
      setShowRelapseDialog(false);
      setRelapseNotes('');
      setRelapseLessons('');
      setRelapseTriggers('');
      setRelapseSeverity([5]);
      setRelapseMoodBefore([5]);
      setRelapseMoodAfter([3]);
      loadRelapseLogs();
    } catch (error) {
      console.error('Error logging relapse:', error);
      toast.error('Failed to log setback');
    }
  };

  const handleDeleteRelapseLog = async (id: string) => {
    const { error } = await supabase.from('relapse_logs').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete log');
    } else {
      toast.success('Log deleted');
      loadRelapseLogs();
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
        <div className="flex items-center justify-between gentle-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Your Progress</h1>
          </div>
          <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/progress/weekly')}>
            <TrendingUp className="h-4 w-4 mr-2" /> Weekly
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Flame className="h-4 w-4 mr-2" />
                    Reset Streak Only
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Streak Only?</AlertDialogTitle>
                    <AlertDialogDescription>
                      <p>This will only reset your streak and clean days count.</p>
                      <p className="mt-2 font-medium text-primary">Your achievements, check-ins, and all other data will be kept! 🛡️</p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetStreakOnly} className="bg-destructive hover:bg-destructive/90">
                      Reset Streak
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Full Reset
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Full Reset?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>This will reset ALL recovery progress including:</p>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        <li>Clean days count</li>
                        <li>Current and longest streak</li>
                        <li>All unlocked achievements</li>
                        <li>Total check-ins count</li>
                      </ul>
                      <p className="mt-4 font-medium">Journal entries and other data will be kept.</p>
                      <p className="text-primary mt-2">A fresh start is a brave step forward! 💪</p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetProgress} className="bg-destructive hover:bg-destructive/90">
                      Yes, Start Fresh
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
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

        {/* Relapse Tracking Section */}
        <Card className="gentle-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Setback Tracker
                </CardTitle>
                <CardDescription>
                  Log setbacks to learn and grow stronger
                </CardDescription>
              </div>
              <Dialog open={showRelapseDialog} onOpenChange={setShowRelapseDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Setback
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log a Setback</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <div>
                      <Label>Severity (1-10): {relapseSeverity[0]}</Label>
                      <Slider value={relapseSeverity} onValueChange={setRelapseSeverity} min={1} max={10} step={1} className="mt-2" />
                    </div>
                    <div>
                      <Label>Mood Before (1-10): {relapseMoodBefore[0]}</Label>
                      <Slider value={relapseMoodBefore} onValueChange={setRelapseMoodBefore} min={1} max={10} step={1} className="mt-2" />
                    </div>
                    <div>
                      <Label>Mood After (1-10): {relapseMoodAfter[0]}</Label>
                      <Slider value={relapseMoodAfter} onValueChange={setRelapseMoodAfter} min={1} max={10} step={1} className="mt-2" />
                    </div>
                    <div>
                      <Label>Triggers (comma-separated)</Label>
                      <Input placeholder="e.g., Stress, Boredom, Social pressure" value={relapseTriggers} onChange={(e) => setRelapseTriggers(e.target.value)} />
                    </div>
                    <div>
                      <Label>What happened?</Label>
                      <Textarea placeholder="Describe the situation..." value={relapseNotes} onChange={(e) => setRelapseNotes(e.target.value)} rows={3} />
                    </div>
                    <div>
                      <Label>What did you learn?</Label>
                      <Textarea placeholder="Insights for next time..." value={relapseLessons} onChange={(e) => setRelapseLessons(e.target.value)} rows={3} />
                    </div>
                    <Button onClick={handleLogRelapse} className="w-full">Save Setback Log</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {relapseLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No setbacks logged — keep going strong! 💪</p>
            ) : (
              <div className="space-y-3">
                {relapseLogs.map((log) => (
                  <Card key={log.id} className="p-4 border-destructive/20">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{new Date(log.relapse_date).toLocaleDateString()}</span>
                          <Badge variant="outline" className="text-xs">Severity: {log.severity}/10</Badge>
                        </div>
                        {log.triggers && log.triggers.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {log.triggers.map((t, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                            ))}
                          </div>
                        )}
                        {log.notes && <p className="text-sm text-muted-foreground">{log.notes}</p>}
                        {log.lessons_learned && (
                          <p className="text-sm text-primary italic">💡 {log.lessons_learned}</p>
                        )}
                        {(log.mood_before || log.mood_after) && (
                          <p className="text-xs text-muted-foreground">
                            Mood: {log.mood_before}/10 → {log.mood_after}/10
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteRelapseLog(log.id)}>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trend Charts */}
        <RelapseTrendCharts logs={relapseLogs} />

        {/* AI Insights Section */}
        <RelapseInsights hasLogs={relapseLogs.length > 0} />
      </div>
      <BottomNav />
    </div>
  );
};

export default Progress;
