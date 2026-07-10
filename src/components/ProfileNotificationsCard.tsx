import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Send, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useWebPushNotifications } from '@/hooks/useWebPushNotifications';

declare global {
  interface Window {
    OneSignal?: any;
    OneSignalDeferred?: any[];
  }
}

const REDUCE_MOTION_KEY = 'rc_reduce_motion';

export default function ProfileNotificationsCard() {
  const { isSupported, isGranted, permissionStatus, requestPermission, sendLocalNotification } =
    useWebPushNotifications();
  const [osOptedIn, setOsOptedIn] = useState<boolean | null>(null);
  const [osId, setOsId] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState<boolean>(
    () => typeof window !== 'undefined' && localStorage.getItem(REDUCE_MOTION_KEY) === '1'
  );

  // Apply reduced-motion class to <html>
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

  // Poll OneSignal subscription status
  useEffect(() => {
    let cancel = false;
    const check = async () => {
      try {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async (OneSignal: any) => {
          if (cancel) return;
          try {
            const optedIn = OneSignal?.User?.PushSubscription?.optedIn ?? false;
            const id = OneSignal?.User?.PushSubscription?.id ?? null;
            setOsOptedIn(optedIn);
            setOsId(id);
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
    // First, browser Notification permission
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
          toast.success('OneSignal push enabled');
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
          toast.success('Unsubscribed from push');
        } catch (e: any) {
          toast.error(e?.message || 'Failed to unsubscribe');
        }
      });
    } catch {}
  };

  const handleTest = () => {
    if (!isGranted) {
      toast.error('Enable notifications first');
      return;
    }
    sendLocalNotification('Recovery Cooler', {
      body: 'Test notification — push delivery is working ✅',
      tag: 'profile-test-notification',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    } as NotificationOptions);
    toast.success('Test notification sent');
  };

  const statusLabel = osOptedIn === null
    ? 'Checking…'
    : osOptedIn
      ? 'Subscribed'
      : isGranted ? 'Permission granted — not subscribed' : `Not subscribed (${permissionStatus})`;

  return (
    <Card className="gentle-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
        </CardTitle>
        <CardDescription>Push permissions & accessibility</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">OneSignal push</Label>
            <p className="text-xs text-muted-foreground">Status: {statusLabel}</p>
            {osId && <p className="text-[10px] text-muted-foreground font-mono truncate">ID: {osId}</p>}
          </div>
          <Switch
            checked={!!osOptedIn}
            onCheckedChange={(v) => (v ? enableOneSignal() : disableOneSignal())}
            disabled={!isSupported}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleTest} disabled={!isGranted} className="flex-1">
            <Send className="h-4 w-4 mr-2" /> Test Notification
          </Button>
          {!isGranted && (
            <Button size="sm" onClick={enableOneSignal} className="flex-1">
              <Zap className="h-4 w-4 mr-2" /> Enable
            </Button>
          )}
        </div>

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
