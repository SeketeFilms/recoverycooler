import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ShieldAlert, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const AdminAppeals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isMod, setIsMod] = useState(false);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    const { data } = await (supabase as any)
      .from('journey_appeals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    setAppeals(data ?? []);
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
      const allowed = (data ?? []).some((r: any) => r.role === 'admin' || r.role === 'moderator');
      setIsMod(allowed);
      if (allowed) await load();
      setLoading(false);
    })();
  }, [user]);

  const decide = async (a: any, approve: boolean) => {
    const status = approve ? 'approved' : 'denied';
    const decision_notes = notes[a.id] ?? '';
    const { error: err1 } = await (supabase as any)
      .from('journey_appeals')
      .update({ status, decision_notes, reviewed_by: user!.id, reviewed_at: new Date().toISOString() })
      .eq('id', a.id);
    if (err1) { toast.error(err1.message); return; }

    if (approve) {
      await supabase
        .from('public_journeys')
        .update({ moderation_status: 'active', is_public: true } as any)
        .eq('id', a.journey_id);
    }

    await (supabase as any).from('moderation_actions').insert({
      journey_id: a.journey_id,
      admin_id: user!.id,
      action: approve ? 'appeal_approved' : 'appeal_denied',
      notes: decision_notes,
    });

    await (supabase as any).from('notifications').insert({
      recipient_id: a.user_id,
      actor_id: user!.id,
      type: 'appeal_update',
      target_type: 'public_journey',
      target_id: a.journey_id,
      data: { message: approve ? 'Your appeal was approved. Journey restored.' : 'Your appeal was denied.', notes: decision_notes },
    });

    toast.success(approve ? 'Approved & restored' : 'Denied');
    load();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isMod) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-3">
            <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground" />
            <h1 className="text-xl font-bold">Moderators only</h1>
            <Button onClick={() => navigate('/home')}>Go home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 pb-28">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6" /> Appeals
          </h1>
        </div>

        {appeals.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No appeals.</CardContent></Card>
        ) : appeals.map(a => (
          <Card key={a.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Appeal</CardTitle>
                <Badge variant={a.status === 'pending' ? 'destructive' : 'secondary'}>{a.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm whitespace-pre-wrap">{a.message}</p>
              <p className="text-xs text-muted-foreground font-mono break-all">journey: {a.journey_id}</p>
              {a.status === 'pending' && (
                <>
                  <Textarea
                    placeholder="Decision notes (optional)"
                    value={notes[a.id] ?? ''}
                    onChange={e => setNotes({ ...notes, [a.id]: e.target.value })}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => decide(a, true)}>
                      <Check className="h-4 w-4 mr-2" /> Approve & restore
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => decide(a, false)}>
                      <X className="h-4 w-4 mr-2" /> Deny
                    </Button>
                  </div>
                </>
              )}
              {a.decision_notes && a.status !== 'pending' && (
                <p className="text-xs text-muted-foreground border-t pt-2">Notes: {a.decision_notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminAppeals;
