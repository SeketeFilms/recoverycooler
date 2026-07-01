import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const AppealJourney = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [journey, setJourney] = useState<any>(null);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data: j } = await supabase
      .from('public_journeys')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setJourney(j);
    if (j) {
      const { data: a } = await (supabase as any)
        .from('journey_appeals')
        .select('*')
        .eq('journey_id', j.id)
        .order('created_at', { ascending: false });
      setAppeals(a ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const submit = async () => {
    if (!user || !journey || message.trim().length < 10) {
      toast.error('Please write a longer message (10+ chars)');
      return;
    }
    setSubmitting(true);
    const { error } = await (supabase as any).from('journey_appeals').insert({
      journey_id: journey.id,
      user_id: user.id,
      message: message.trim(),
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Appeal submitted. Moderators will review.');
    setMessage('');
    load();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const isHidden = journey?.moderation_status === 'hidden';
  const pending = appeals.find(a => a.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 pb-28">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6" /> Appeal review
          </h1>
        </div>

        {!journey && <Card><CardContent className="py-6">You don't have a public journey yet.</CardContent></Card>}

        {journey && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Journey status</span>
                <Badge variant={isHidden ? 'destructive' : 'secondary'}>{journey.moderation_status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isHidden ? (
                <p className="text-sm text-muted-foreground">
                  Your journey has been hidden by moderators. You can appeal below.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your journey is currently visible. No appeal needed.
                </p>
              )}

              {isHidden && !pending && (
                <>
                  <Textarea
                    placeholder="Explain why this journey should be reinstated..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={5}
                  />
                  <Button disabled={submitting} onClick={submit} className="w-full">
                    Submit appeal
                  </Button>
                </>
              )}

              {pending && (
                <Card className="bg-muted">
                  <CardContent className="py-4 text-sm">
                    An appeal is pending review ({formatDistanceToNow(new Date(pending.created_at), { addSuffix: true })}).
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {appeals.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Appeal history</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {appeals.map(a => (
                <div key={a.id} className="border rounded-md p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant={a.status === 'approved' ? 'secondary' : a.status === 'denied' ? 'destructive' : 'outline'}>
                      {a.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{a.message}</p>
                  {a.decision_notes && (
                    <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                      Moderator: {a.decision_notes}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AppealJourney;
