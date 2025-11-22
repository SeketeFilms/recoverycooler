import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const BuildNewHabits = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-28">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate('/rebuild-life')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Build New Habits
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Replace old patterns with positive routines that support recovery
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What to Do</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <p className="text-muted-foreground">
                  Step-by-step habit creation (choose a habit → set reminders → track streaks).
                </p>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <p className="text-muted-foreground">
                  Science-backed exercises like "Habit stacking," "5-minute start," or "Reward building."
                </p>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <p className="text-muted-foreground">
                  Daily/weekly progress tracking with streak counters and habit logs.
                </p>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <p className="text-muted-foreground">
                  Access to professional habit-building tips and behaviour change techniques.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              More tools and features coming soon to help you build lasting positive habits.
            </p>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default BuildNewHabits;
