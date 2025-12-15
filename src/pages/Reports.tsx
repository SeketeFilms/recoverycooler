import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, BookOpen, Flame, Target, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, format, parseISO, differenceInDays } from 'date-fns';
import BottomNav from '@/components/BottomNav';

interface ReportData {
  journalEntries: number;
  averageMood: number | null;
  checkIns: number;
  currentStreak: number;
  moodTrend: 'up' | 'down' | 'stable';
  topTriggers: string[];
  topStrategies: string[];
  spendingTotal: number;
}

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
  const [previousReport, setPreviousReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user, period]);

  const loadReports = async () => {
    setLoading(true);

    const now = new Date();
    let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;

    if (period === 'week') {
      currentStart = startOfWeek(now, { weekStartsOn: 1 });
      currentEnd = endOfWeek(now, { weekStartsOn: 1 });
      previousStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      previousEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    } else {
      currentStart = startOfMonth(now);
      currentEnd = endOfMonth(now);
      previousStart = startOfMonth(subMonths(now, 1));
      previousEnd = endOfMonth(subMonths(now, 1));
    }

    const [current, previous] = await Promise.all([
      fetchPeriodData(currentStart, currentEnd),
      fetchPeriodData(previousStart, previousEnd),
    ]);

    // Calculate mood trend
    if (current && previous) {
      if (current.averageMood !== null && previous.averageMood !== null) {
        if (current.averageMood > previous.averageMood + 0.5) {
          current.moodTrend = 'up';
        } else if (current.averageMood < previous.averageMood - 0.5) {
          current.moodTrend = 'down';
        } else {
          current.moodTrend = 'stable';
        }
      }
    }

    setCurrentReport(current);
    setPreviousReport(previous);
    setLoading(false);
  };

  const fetchPeriodData = async (start: Date, end: Date): Promise<ReportData> => {
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    // Fetch journal entries
    const { data: journals } = await supabase
      .from('journal_entries')
      .select('mood, triggers')
      .eq('user_id', user!.id)
      .gte('entry_date', startStr)
      .lte('entry_date', endStr);

    // Fetch progress
    const { data: progress } = await supabase
      .from('progress_tracking')
      .select('current_streak, total_check_ins')
      .eq('user_id', user!.id)
      .single();

    // Fetch spending
    const { data: spending } = await supabase
      .from('spending_logs')
      .select('amount')
      .eq('user_id', user!.id)
      .gte('date', startStr)
      .lte('date', endStr);

    // Fetch coping strategies used
    const { data: strategies } = await supabase
      .from('coping_strategies')
      .select('strategy_name, times_used')
      .eq('user_id', user!.id)
      .order('times_used', { ascending: false })
      .limit(3);

    // Calculate stats
    const moods = journals?.filter((j) => j.mood !== null).map((j) => j.mood as number) || [];
    const averageMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : null;

    // Count triggers
    const triggerCounts: Record<string, number> = {};
    journals?.forEach((j) => {
      (j.triggers || []).forEach((t: string) => {
        triggerCounts[t] = (triggerCounts[t] || 0) + 1;
      });
    });
    const topTriggers = Object.entries(triggerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([t]) => t);

    const spendingTotal = spending?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;

    return {
      journalEntries: journals?.length || 0,
      averageMood,
      checkIns: progress?.total_check_ins || 0,
      currentStreak: progress?.current_streak || 0,
      moodTrend: 'stable',
      topTriggers,
      topStrategies: strategies?.map((s) => s.strategy_name) || [],
      spendingTotal,
    };
  };

  const getChangeIndicator = (current: number, previous: number, invertColors = false) => {
    if (current === previous) {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
    const isUp = current > previous;
    const color = invertColors
      ? isUp
        ? 'text-destructive'
        : 'text-green-500'
      : isUp
      ? 'text-green-500'
      : 'text-destructive';

    return isUp ? (
      <TrendingUp className={`h-4 w-4 ${color}`} />
    ) : (
      <TrendingDown className={`h-4 w-4 ${color}`} />
    );
  };

  const getMoodEmoji = (mood: number | null) => {
    if (mood === null) return '😐';
    if (mood >= 8) return '😊';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    if (mood >= 2) return '😕';
    return '😢';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-28">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Progress Reports</h1>
            <p className="text-sm text-muted-foreground">Track your recovery journey</p>
          </div>
        </div>

        {/* Period Selector */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as 'week' | 'month')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading report...</div>
            ) : currentReport ? (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <Flame className="h-4 w-4" />
                        Current Streak
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-primary">
                          {currentReport.currentStreak}
                        </span>
                        <span className="text-sm text-muted-foreground">days</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Journal Entries
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold">{currentReport.journalEntries}</span>
                        {previousReport &&
                          getChangeIndicator(
                            currentReport.journalEntries,
                            previousReport.journalEntries
                          )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Mood Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Average Mood
                      {currentReport.moodTrend === 'up' && (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      )}
                      {currentReport.moodTrend === 'down' && (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{getMoodEmoji(currentReport.averageMood)}</span>
                      <div>
                        <div className="text-2xl font-bold">
                          {currentReport.averageMood?.toFixed(1) || 'N/A'}
                          <span className="text-sm font-normal text-muted-foreground"> / 10</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {currentReport.moodTrend === 'up' && 'Improving from last period'}
                          {currentReport.moodTrend === 'down' && 'Lower than last period'}
                          {currentReport.moodTrend === 'stable' && 'Stable mood this period'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Triggers & Strategies */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Top Triggers</CardTitle>
                      <CardDescription>Most frequently noted this {period}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {currentReport.topTriggers.length > 0 ? (
                        <ul className="space-y-2">
                          {currentReport.topTriggers.map((trigger, i) => (
                            <li
                              key={trigger}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span className="w-5 h-5 rounded-full bg-destructive/20 text-destructive flex items-center justify-center text-xs">
                                {i + 1}
                              </span>
                              {trigger}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No triggers recorded</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Coping Strategies</CardTitle>
                      <CardDescription>Most effective techniques</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {currentReport.topStrategies.length > 0 ? (
                        <ul className="space-y-2">
                          {currentReport.topStrategies.map((strategy, i) => (
                            <li
                              key={strategy}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-xs">
                                {i + 1}
                              </span>
                              {strategy}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No strategies recorded</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Spending */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Spending This {period === 'week' ? 'Week' : 'Month'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold">
                        ${currentReport.spendingTotal.toFixed(2)}
                      </span>
                      {previousReport && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {getChangeIndicator(
                            currentReport.spendingTotal,
                            previousReport.spendingTotal,
                            true
                          )}
                          vs ${previousReport.spendingTotal.toFixed(2)} last {period}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No data available for this period</p>
                  <p className="text-sm">Start journaling and checking in to see reports</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default Reports;
