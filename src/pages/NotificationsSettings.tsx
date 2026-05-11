import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useWebPushNotifications } from '@/hooks/useWebPushNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Bell, BellRing, Clock, Send, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Prefs {
  meditation_reminders: boolean;
  recovery_checkins: boolean;
  meditation_time: string;
  checkin_time: string;
}

const DEFAULTS: Prefs = {
  meditation_reminders: true,
  recovery_checkins: true,
  meditation_time: '09:00',
  checkin_time: '20:00',
};

export default function NotificationsSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSupported, isGranted, permissionStatus, requestPermission, sendLocalNotification } =
    useWebPushNotifications();

  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningNow, setRunningNow] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setPrefs({
          meditation_reminders: data.meditation_reminders ?? true,
          recovery_checkins: data.recovery_checkins ?? true,
          meditation_time: (data.meditation_time ?? '09:00:00').slice(0, 5),
          checkin_time: (data.checkin_time ?? '20:00:00').slice(0, 5),
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const savePrefs = async (next: Prefs) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('notification_preferences').upsert(
      {
        user_id: user.id,
        meditation_reminders: next.meditation_reminders,
        recovery_checkins: next.recovery_checkins,
        meditation_time: `${next.meditation_time}:00`,
        checkin_time: `${next.checkin_time}:00`,
      },
      { onConflict: 'user_id' }
    );
    setSaving(false);
    if (error) {
      toast.error('Failed to save preferences');
    } else {
      toast.success('Preferences saved');
    }
  };

  const update = <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    savePrefs(next);
  };

  const handleEnable = async () => {
    const ok = await requestPermission();
    if (ok) {
      toast.success('Notifications enabled');
    } else {
      toast.error('Permission denied. Enable notifications in your browser settings.');
    }
  };

  const handleTest = () => {
    if (!isSupported) {
      toast.error('Notifications are not supported on this device');
      return;
    }
    if (!isGranted) {
      toast.error('Enable notifications first');
      return;
    }
    sendLocalNotification('Recovery Cooler', {
      body: 'This is a test notification — push delivery is working.',
      tag: 'test-notification',
    });
    toast.success('Test notification sent');
  };

  const handleRunNow = async () => {
    setRunningNow(true);
    try {
      const { data, error } = await supabase.functions.invoke('trigger-checkin-now', {
        body: {},
      });
      if (error) throw error;

      const title = data?.title ?? 'Recovery Cooler check-in';
      const message = data?.message ?? 'Keep going — you are doing great.';

      if (isGranted) {
        sendLocalNotification(title, { body: message, tag: 'run-now-checkin' });
      }

      toast.success(
        data?.deliveredTo > 0
          ? `Check-in dispatched (${data.deliveredTo} device${data.deliveredTo === 1 ? '' : 's'})`
          : 'Check-in fired — shown locally (no registered devices yet)'
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to run check-in');
    } finally {
      setRunningNow(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3 pt-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Bell className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              Manage reminders and test push delivery
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              Browser Notifications
            </CardTitle>
            <CardDescription>
              Permission status:{' '}
              <span className="font-medium capitalize">{permissionStatus}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isSupported ? (
              <p className="text-sm text-muted-foreground">
                This browser does not support web notifications.
              </p>
            ) : !isGranted ? (
              <Button onClick={handleEnable} className="w-full">
                Enable Notifications
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Notifications are enabled for this device.
              </p>
            )}

            <Button
              variant="outline"
              onClick={handleTest}
              disabled={!isGranted}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Test Notification
            </Button>

            <Button
              variant="secondary"
              onClick={handleRunNow}
              disabled={runningNow}
              className="w-full"
            >
              <Zap className="mr-2 h-4 w-4" />
              {runningNow ? 'Running…' : 'Run Daily Check-in Now'}
            </Button>
            <p className="text-xs text-muted-foreground -mt-1">
              Triggers the scheduled check-in immediately so you can verify delivery.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Daily Reminders
            </CardTitle>
            <CardDescription>
              We&apos;ll send a check-in at your preferred local time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Morning meditation reminder</Label>
                <p className="text-xs text-muted-foreground">A gentle nudge to start your day</p>
              </div>
              <Switch
                checked={prefs.meditation_reminders}
                disabled={loading || saving}
                onCheckedChange={(v) => update('meditation_reminders', v)}
              />
            </div>
            {prefs.meditation_reminders && (
              <div className="space-y-2">
                <Label htmlFor="med-time" className="text-sm">
                  Meditation time
                </Label>
                <Input
                  id="med-time"
                  type="time"
                  value={prefs.meditation_time}
                  onChange={(e) => update('meditation_time', e.target.value)}
                />
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Evening recovery check-in</Label>
                <p className="text-xs text-muted-foreground">A reminder to log your day</p>
              </div>
              <Switch
                checked={prefs.recovery_checkins}
                disabled={loading || saving}
                onCheckedChange={(v) => update('recovery_checkins', v)}
              />
            </div>
            {prefs.recovery_checkins && (
              <div className="space-y-2">
                <Label htmlFor="checkin-time" className="text-sm">
                  Check-in time
                </Label>
                <Input
                  id="checkin-time"
                  type="time"
                  value={prefs.checkin_time}
                  onChange={(e) => update('checkin_time', e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
