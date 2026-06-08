import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flame, Wind, Snowflake, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import BottomNav from '@/components/BottomNav';

interface DayBucket {
  day: string;
  cooldowns: number;
  meditationMin: number;
  journals: number;
}

const WeeklyDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<DayBucket[]>([]);
  const [streak, setStreak] = useState(0);
  const [longest, setLongest] = useState(0);
  const [totalMeditation, setTotalMeditation] = useState(0);
  const [totalCooldowns, setTotalCooldowns] = useState(0);
  const [adherence, setAdherence] = useState(0);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    if (!user) return;
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const [progress, sessions, medSessions, journals, schedules] = await Promise.all([
      supabase.from('progress_tracking').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('session_logs').select('login_time').eq('user_id', user.id).gte('login_time', since.toISOString()),
      supabase.from('meditation_sessions').select('duration_minutes, created_at').eq('user_id', user.id).gte('created_at', since.toISOString()),
      supabase.from('journal_entries').select('entry_date').eq('user_id', user.id).gte('entry_date', since.toISOString().slice(0, 10)),
      supabase.from('check_in_schedules').select('*').eq('user_id', user.id).eq('is_enabled', true),
    ]);

    setStreak(progress.data?.current_streak ?? 0);
    setLongest(progress.data?.longest_streak ?? 0);

    const buckets: DayBucket[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.push({
        day: d.toLocaleDateString(undefined, { weekday: 'short' }),
        cooldowns: 0,
        meditationMin: 0,
        journals: 0,
      });
    }

    const dayIndex = (iso: string) => {
      const d = new Date(iso);
      const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
      return 6 - diff;
    };

    let cd = 0, med = 0;
    (sessions.data ?? []).forEach((s) => {
      const i = dayIndex(s.login_time);
      if (i >= 0 && i < 7) buckets[i].cooldowns += 1;
      cd++;
    });
    (medSessions.data ?? []).forEach((s) => {
      const i = dayIndex(s.created_at);
      if (i >= 0 && i < 7) buckets[i].meditationMin += s.duration_minutes ?? 0;
      med += s.duration_minutes ?? 0;
    });
    (journals.data ?? []).forEach((j) => {
      const i = dayIndex(j.entry_date);
      if (i >= 0 && i < 7) buckets[i].journals += 1;
    });

    setData(buckets);
    setTotalCooldowns(cd);
    setTotalMeditation(med);

    const expected = (schedules.data?.length || 1) * 7;
    const actual = (journals.data?.length ?? 0);
    setAdherence(Math.min(100, Math.round((actual / expected) * 100)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-28">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Weekly Progress</h1>
            <p className="text-sm text-muted-foreground">The last 7 days at a glance</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Flame} label="Current streak" value={`${streak} days`} sub={`Best: ${longest}`} />
          <StatCard icon={Wind} label="Meditation" value={`${totalMeditation} min`} sub="This week" />
          <StatCard icon={Snowflake} label="Cooldowns" value={`${totalCooldowns}`} sub="Sessions" />
          <StatCard icon={Target} label="Goal adherence" value={`${adherence}%`} sub="Check-ins met" />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Cooldowns per day</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cooldowns" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Meditation minutes</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="meditationMin" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </CardContent>
  </Card>
);

export default WeeklyDashboard;
