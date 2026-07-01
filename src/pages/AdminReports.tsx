import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, EyeOff, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Report {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter_user_id: string;
}

const AdminReports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isMod, setIsMod] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'all'>('pending');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: roles }, _] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', user.id),
        Promise.resolve(),
      ]);
      const allowed = (roles ?? []).some((r: any) => r.role === 'admin' || r.role === 'moderator');
      setIsMod(allowed);
      if (allowed) await load();
      setLoading(false);
    })();
  }, [user, filter]);

  const load = async () => {
    let q = supabase.from('content_reports').select('*').order('created_at', { ascending: false }).limit(200);
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setReports((data ?? []) as Report[]);
  };

  const logAction = async (journey_id: string | null, report_id: string | null, action: string, notes?: string) => {
    await (supabase as any).from('moderation_actions').insert({
      journey_id, report_id, admin_id: user!.id, action, notes: notes ?? null,
    });
  };

  const updateReport = async (r: Report, status: 'reviewed' | 'dismissed') => {
    const { error } = await supabase
      .from('content_reports')
      .update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq('id', r.id);
    if (error) { toast.error('Failed'); return; }
    await logAction(r.content_type === 'public_journey' ? r.content_id : null, r.id, status);
    toast.success('Updated');
    load();
  };

  const hideJourney = async (r: Report) => {
    if (r.content_type !== 'public_journey') {
      toast.error('Hide is only wired for public journeys for now');
      return;
    }
    const { error } = await supabase
      .from('public_journeys')
      .update({ moderation_status: 'hidden', is_public: false } as any)
      .eq('id', r.content_id);
    if (error) { toast.error('Could not hide'); return; }
    await logAction(r.content_id, r.id, 'hidden');
    // Notify journey owner
    const { data: j } = await supabase.from('public_journeys').select('user_id').eq('id', r.content_id).maybeSingle();
    if (j?.user_id) {
      await (supabase as any).from('notifications').insert({
        recipient_id: j.user_id, actor_id: user!.id, type: 'moderation',
        target_type: 'public_journey', target_id: r.content_id,
        data: { message: 'Your public journey was hidden by moderators. You can appeal in Share Settings.' },
      });
    }
    await updateReport(r, 'reviewed');
    toast.success('Journey hidden');
  };


  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!isMod) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-3">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
            <h1 className="text-xl font-bold">Moderators only</h1>
            <p className="text-sm text-muted-foreground">You do not have access to this page.</p>
            <Button onClick={() => navigate('/home')}>Go home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 pb-28">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" /> Reports
          </h1>
        </div>

        <div className="flex gap-2">
          {(['pending', 'resolved', 'all'] as const).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
            >
              {f === 'resolved' ? 'Reviewed' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No reports {filter !== 'all' && `(${filter})`}.
            </CardContent>
          </Card>
        ) : (
          reports.map(r => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{r.reason}</CardTitle>
                  <Badge variant={r.status === 'pending' ? 'destructive' : 'secondary'}>{r.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {r.content_type} · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {r.description && <p className="text-sm whitespace-pre-wrap">{r.description}</p>}
                <p className="text-xs text-muted-foreground font-mono break-all">id: {r.content_id}</p>
                {r.status === 'pending' && (
                  <div className="flex flex-wrap gap-2">
                    {r.content_type === 'public_journey' && (
                      <Button size="sm" variant="destructive" onClick={() => hideJourney(r)}>
                        <EyeOff className="h-4 w-4 mr-2" /> Hide journey
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => updateReport(r, 'reviewed')}>
                      <Check className="h-4 w-4 mr-2" /> Mark reviewed
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateReport(r, 'dismissed')}>
                      <X className="h-4 w-4 mr-2" /> Dismiss
                    </Button>

                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReports;
