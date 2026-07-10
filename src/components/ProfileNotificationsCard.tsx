import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Zap, Copy, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useWebPushNotifications } from '@/hooks/useWebPushNotifications';

declare global {
  interface Window {
    OneSignal?: any;
    OneSignalDeferred?: any[];
  }
}

const REDUCE_MOTION_KEY = 'rc_reduce_motion';
const PUSH_PREF_KEY = 'rc_push_enabled';
const LOG_KEY = 'rc_notification_log';
const MAX_LOG = 10;

type LogEntry = {
  ts: number;
  title: string;
  status: 'sent' | 'shown' | 'error' | 'received';
  detail?: string;
};

const readLog = (): LogEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
  } catch {
    return [];
  }
};
const pushLog = (entry: LogEntry) => {
  const next = [entry, ...readLog()].slice(0, MAX_LOG);
  localStorage.setItem(LOG_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('rc-notif-log'));
};

export default function ProfileNotificationsCard() {
  const { isSupported, isGranted, permissionStatus, requestPermission } = useWebPushNotifications();
  const [osOptedIn, setOsOptedIn] = useState<boolean | null>(null);
  const [osId, setOsId] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState<boolean>(
    () => typeof window !== 'undefined' && localStorage.getItem(REDUCE_MOTION_KEY) === '1'
  );
  const [pushPref, setPushPref] = useState<boolean>(
    () => typeof window !== 'undefined' && localStorage.getItem(PUSH_PREF_KEY) === '1'
  );
  const [log, setLog] = useState<LogEntry[]>(() => readLog());
  const [testing, setTesting] = useState(false);

  // Persist reduce-motion
  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) {
      root.classList.add('reduce-motion');
      localStorage.setItem(REDUCE_MOTION_KEY, '1');
    } else {
      root.classList.remove('reduce-motion');
      localStorage.removeItem(REDUCE_MOTION_KEY);
    }
  }, [reduceMotion]);

  // Persist push preference
  useEffect(() => {
    if (pushPref) localStorage.setItem(PUSH_PREF_KEY, '1');
    else localStorage.removeItem(PUSH_PREF_KEY);
  }, [pushPref]);

  // Live log updates
  useEffect(() => {
    const h = () => setLog(readLog());
    window.addEventListener('rc-notif-log', h);
    window.addEventListener('storage', h);
    return () => {
      window.removeEventListener('rc-notif-log', h);
      window.removeEventListener('storage', h);
    };
  }, []);

  // Poll OneSignal subscription status
  useEffect(() => {
    let cancel = false;
    const check = () => {
      try {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async (OneSignal: any) => {
          if (cancel) return;
          try {
            const optedIn = OneSignal?.User?.PushSubscription?.optedIn ?? false;
            const id = OneSignal?.User?.PushSubscription?.id ?? null;
            setOsOptedIn(optedIn);
            setOsId(id);
            // Listen for received notifications (once)
            if (!(window as any).__rcOsListenerBound) {
              (window as any).__rcOsListenerBound = true;
              try {
                OneSignal.Notifications.addEventListener('foregroundWillDisplay', (ev: any) => {
                  pushLog({
                    ts: Date.now(),
                    title: ev?.notification?.title || 'OneSignal',
                    status: 'received',
                    detail: ev?.notification?.body,
                  });
                });
              } catch {}
            }
          } catch {
            setOsOptedIn(false);
          }
        });
      } catch {
        setOsOptedIn(false);
      }
    };
    check();
    const iv = setInterval(check, 4000);
    return () => {
      cancel = true;
      clearInterval(iv);
    };
  }, []);

  const enableOneSignal = async () => {
    const ok = await requestPermission();
    if (!ok) {
      toast.error('Permission denied. Enable notifications in browser settings.');
      return;
    }
    try {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          await OneSignal.Notifications.requestPermission();
          await OneSignal.User.PushSubscription.optIn();
          const id = OneSignal?.User?.PushSubscription?.id ?? null;
          setOsOptedIn(true);
          setOsId(id);
          setPushPref(true);
          toast.success('Push notifications enabled');
        } catch (e: any) {
          toast.error(e?.message || 'OneSignal subscription failed');
        }
      });
    } catch {
      toast.error('OneSignal not available');
    }
  };

  const disableOneSignal = async () => {
    try {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          await OneSignal.User.PushSubscription.optOut();
          setOsOptedIn(false);
          setPushPref(false);
          toast.success('Unsubscribed from push');
        } catch (e: any) {
          toast.error(e?.message || 'Failed to unsubscribe');
        }
      });
    } catch {}
  };

  const handleTest = async () => {
    if (!isGranted) {
      toast.error('Enable notifications first');
      return;
    }
    setTesting(true);
    const title = 'Recovery Cooler';
    const options: NotificationOptions = {
      body: 'Test notification — push delivery is working ✅',
      tag: 'profile-test-notification',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    };
    pushLog({ ts: Date.now(), title, status: 'sent', detail: 'Test triggered' });
    try {
      // Prefer service-worker path so mobile PWA can display
      const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, options);
        pushLog({ ts: Date.now(), title, status: 'shown', detail: 'Delivered via service worker' });
        toast.success('Test notification delivered');
      } else {
        const n = new Notification(title, options);
        n.onshow = () =>
          pushLog({ ts: Date.now(), title, status: 'shown', detail: 'Delivered via Notification API' });
        n.onerror = () =>
          pushLog({ ts: Date.now(), title, status: 'error', detail: 'Notification.onerror' });
        toast.success('Test notification sent');
      }
    } catch (e: any) {
      pushLog({ ts: Date.now(), title, status: 'error', detail: e?.message || 'unknown' });
      toast.error(`Failed: ${e?.message || 'unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const copyId = async () => {
    if (!osId) return;
    try {
      await navigator.clipboard.writeText(osId);
      toast.success('Device ID copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const clearLog = () => {
    localStorage.removeItem(LOG_KEY);
    setLog([]);
    toast.success('Log cleared');
  };

  const statusVariant =
    osOptedIn === true ? 'default' : osOptedIn === false ? 'secondary' : 'outline';
  const statusText =
    osOptedIn === null
      ? 'Checking…'
      : osOptedIn
        ? 'Subscribed'
        : isGranted
          ? 'Permission granted — not subscribed'
          : `Not subscribed (${permissionStatus})`;

  return (
    <Card className="gentle-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
        </CardTitle>
        <CardDescription>Push permissions, delivery test & accessibility</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subscription state */}
        <div className="rounded-lg border p-3 bg-muted/30 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">OneSignal Push</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={statusVariant as any}>{statusText}</Badge>
              </div>
            </div>
            <Switch
              checked={!!osOptedIn}
              onCheckedChange={(v) => (v ? enableOneSignal() : disableOneSignal())}
              disabled={!isSupported}
            />
          </div>
          <div className="text-xs text-muted-foreground pt-2 border-t space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="shrink-0">Device / User ID:</span>
              {osId ? (
                <div className="flex items-center gap-1 min-w-0">
                  <code className="font-mono text-[10px] truncate max-w-[180px]">{osId}</code>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyId}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <span className="italic">not assigned</span>
              )}
            </div>
            <div>Browser permission: <code className="font-mono">{permissionStatus}</code></div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={!isGranted || testing}
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-2" /> {testing ? 'Sending…' : 'Test Notification'}
          </Button>
          {!isGranted && (
            <Button size="sm" onClick={enableOneSignal} className="flex-1">
              <Zap className="h-4 w-4 mr-2" /> Enable
            </Button>
          )}
        </div>

        {/* Notification log */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" /> Recent notification events
            </Label>
            {log.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearLog} className="h-7 text-xs">
                Clear
              </Button>
            )}
          </div>
          {log.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No events yet. Tap Test Notification.</p>
          ) : (
            <ul className="space-y-1 max-h-40 overflow-auto rounded-md border p-2 bg-muted/20">
              {log.map((e, i) => (
                <li key={i} className="text-xs flex items-start gap-2">
                  {e.status === 'error' ? (
                    <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                  ) : e.status === 'sent' ? (
                    <Send className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{e.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(e.ts).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {e.status} {e.detail ? `— ${e.detail}` : ''}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Reduce motion */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <Label className="text-base">Reduce motion</Label>
            <p className="text-xs text-muted-foreground">Tone down logo & shimmer animations</p>
          </div>
          <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
        </div>
      </CardContent>
    </Card>
  );
}
