import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { format, parseISO, startOfWeek, eachWeekOfInterval, subMonths } from 'date-fns';

interface RelapseLog {
  id: string;
  relapse_date: string;
  severity: number;
  mood_before: number | null;
  mood_after: number | null;
}

interface RelapseTrendChartsProps {
  logs: RelapseLog[];
}

const chartConfig = {
  count: { label: 'Setbacks', color: 'hsl(var(--destructive))' },
  severity: { label: 'Avg Severity', color: 'hsl(var(--primary))' },
  moodBefore: { label: 'Mood Before', color: 'hsl(var(--accent))' },
  moodAfter: { label: 'Mood After', color: 'hsl(var(--secondary))' },
};

const RelapseTrendCharts = ({ logs }: RelapseTrendChartsProps) => {
  const weeklyData = useMemo(() => {
    if (logs.length === 0) return [];

    const sorted = [...logs].sort((a, b) => a.relapse_date.localeCompare(b.relapse_date));
    const earliest = parseISO(sorted[0].relapse_date);
    const latest = new Date();
    const threeMonthsAgo = subMonths(latest, 3);
    const startDate = earliest > threeMonthsAgo ? earliest : threeMonthsAgo;

    const weeks = eachWeekOfInterval({ start: startDate, end: latest });

    return weeks.map((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekLogs = sorted.filter((log) => {
        const d = parseISO(log.relapse_date);
        return d >= weekStart && d <= weekEnd;
      });

      const avgSeverity = weekLogs.length > 0
        ? Math.round((weekLogs.reduce((s, l) => s + l.severity, 0) / weekLogs.length) * 10) / 10
        : 0;

      return {
        week: format(weekStart, 'MMM d'),
        count: weekLogs.length,
        severity: avgSeverity,
      };
    });
  }, [logs]);

  if (logs.length < 2) {
    return null;
  }

  return (
    <Card className="gentle-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Setback Trends
        </CardTitle>
        <CardDescription>Weekly frequency and severity over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Frequency Chart */}
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">Weekly Frequency</p>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Severity Trend */}
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">Average Severity Trend</p>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 10]} fontSize={12} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="severity" stroke="var(--color-severity)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelapseTrendCharts;
