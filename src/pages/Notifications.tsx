import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bell, Heart, MessageCircle, UserPlus, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface N {
  id: string;
  type: string;
  actor_id: string | null;
  target_type: string | null;
  target_id: string | null;
  data: any;
  read_at: string | null;
  created_at: string;
}

const iconFor = (t: string) => {
  if (t === 'like') return <Heart className="h-4 w-4 text-primary" />;
  if (t === 'comment') return <MessageCircle className="h-4 w-4 text-primary" />;
  if (t === 'follow') return <UserPlus className="h-4 w-4 text-primary" />;
  if (t === 'moderation' || t === 'appeal_update') return <ShieldAlert className="h-4 w-4 text-destructive" />;
  return <Bell className="h-4 w-4" />;
};

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<N[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    setItems((data ?? []) as N[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await (supabase as any)
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', user.id)
      .is('read_at', null);
    load();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 pb-28">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6" /> Notifications
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={markAllRead}>Mark all read</Button>
        </div>

        {items.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No notifications yet.</CardContent></Card>
        ) : items.map(n => (
          <Card key={n.id} className={!n.read_at ? 'border-primary/40' : ''}>
            <CardContent className="py-3 flex items-start gap-3">
              <div className="mt-1">{iconFor(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  {n.data?.message ?? `New ${n.type}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
              {!n.read_at && <Badge>new</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
