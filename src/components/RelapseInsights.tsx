import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';

interface RelapseInsightsProps {
  hasLogs: boolean;
}

const RelapseInsights = ({ hasLogs }: RelapseInsightsProps) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isHighRisk, setIsHighRisk] = useState(false);

  const sendHighRiskNotification = (insightText: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⚠️ High-Risk Pattern Detected', {
        body: 'Your recent setbacks show a concerning pattern. Tap to view personalized coping strategies.',
        icon: '/favicon.ico',
        tag: 'high-risk-alert',
      });
    }
    toast.warning('High-risk pattern detected in your recent setbacks. Review the insights below for coping strategies.', {
      duration: 8000,
    });
  };

  const detectHighRisk = (insightText: string): boolean => {
    const highRiskKeywords = [
      'escalating', 'increasing frequency', 'worsening', 'high risk',
      'concerning pattern', 'urgent', 'intensifying', 'dangerous',
      'accelerating', 'crisis', 'immediate attention',
    ];
    const lowerInsight = insightText.toLowerCase();
    return highRiskKeywords.some((kw) => lowerInsight.includes(kw));
  };

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-relapse-patterns');

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      const insightText = data?.insights || null;
      setInsights(insightText);

      if (insightText) {
        const risky = detectHighRisk(insightText);
        setIsHighRisk(risky);
        if (risky) {
          sendHighRiskNotification(insightText);
        }
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`gentle-fade-in ${isHighRisk ? 'border-destructive/50 bg-destructive/5' : 'border-primary/20'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isHighRisk ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <Sparkles className="h-5 w-5 text-primary" />
              )}
              AI Recovery Insights
              {isHighRisk && (
                <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full font-medium">
                  High Risk
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Personalized analysis of your patterns and coping strategies
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={fetchInsights}
            disabled={loading}
            variant={insights ? 'outline' : 'default'}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {insights ? 'Refresh' : 'Analyze'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : insights ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{insights}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {hasLogs
              ? 'Tap "Analyze" to get AI-powered insights based on your logged setbacks.'
              : 'Log some setbacks first, then come back for personalized insights.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RelapseInsights;
