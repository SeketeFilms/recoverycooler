import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, RefreshCw } from 'lucide-react';
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

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-relapse-patterns');

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setInsights(data?.insights || null);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="gentle-fade-in border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Recovery Insights
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
