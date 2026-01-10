import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { History, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { APP_VERSION } from '@/hooks/useAppUpdate';

interface AppVersion {
  id: string;
  version: string;
  release_notes: string;
  is_required: boolean;
  is_current: boolean;
  minimum_supported_version: string | null;
  release_date: string;
  created_at: string;
}

const ChangelogHistory = () => {
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const { data, error } = await supabase
          .from('app_versions')
          .select('*')
          .order('release_date', { ascending: false });

        if (error) throw error;
        setVersions(data || []);
      } catch (err) {
        console.error('Error fetching versions:', err);
        setError('Failed to load changelog');
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, []);

  const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  };

  const getVersionStatus = (version: AppVersion) => {
    const comparison = compareVersions(version.version, APP_VERSION);
    
    if (version.is_current) {
      return { label: 'Latest', variant: 'default' as const, icon: CheckCircle2 };
    }
    if (comparison > 0) {
      return { label: 'Newer', variant: 'destructive' as const, icon: AlertTriangle };
    }
    if (version.version === APP_VERSION) {
      return { label: 'Installed', variant: 'secondary' as const, icon: CheckCircle2 };
    }
    return { label: 'Previous', variant: 'outline' as const, icon: Clock };
  };

  const renderReleaseNotes = (notes: string) => {
    // Simple markdown-like rendering for release notes
    return notes.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('### ')) {
        return <h4 key={index} className="text-md font-medium mt-3 mb-1 text-muted-foreground">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 text-sm text-muted-foreground">
            {line.replace('- ', '')}
          </li>
        );
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="text-sm text-muted-foreground">{line}</p>;
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Changelog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Changelog & Release History
        </CardTitle>
        <CardDescription>
          View all app updates and release notes. Current version: {APP_VERSION}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No version history available yet.
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {versions.map((version) => {
                const status = getVersionStatus(version);
                const StatusIcon = status.icon;
                
                return (
                  <div 
                    key={version.id} 
                    className={`border-l-2 pl-4 pb-4 ${
                      version.version === APP_VERSION 
                        ? 'border-primary' 
                        : 'border-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-semibold text-lg">v{version.version}</span>
                      <Badge variant={status.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                      {version.is_required && (
                        <Badge variant="destructive">Required Update</Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">
                      Released {format(new Date(version.release_date), 'MMMM d, yyyy')}
                    </p>
                    
                    <div className="bg-muted/50 rounded-lg p-4">
                      {renderReleaseNotes(version.release_notes)}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ChangelogHistory;
