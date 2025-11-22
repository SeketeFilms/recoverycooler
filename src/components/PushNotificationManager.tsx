import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Bell, BellOff } from 'lucide-react';

const PushNotificationManager = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    setIsLoading(true);
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive',
        });
        return;
      }

      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
      }

      // VAPID public key (this should match your backend)
      // In production, this should come from your environment
      const vapidPublicKey = 'BEL_4GYhqR5K9Z8vN8vQZGhqR5K9Z8vN8vQZGhqR5K9Z8vN8vQZGhqR5K9Z8vN8vQZGhq';
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to backend
      const { error } = await supabase.functions.invoke('subscribe-to-push', {
        body: {
          subscription: subscription.toJSON(),
          action: 'subscribe',
        },
      });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: 'Subscribed!',
        description: 'You will now receive recovery reminders.',
      });
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast({
        title: 'Subscription Failed',
        description: 'There was an error enabling notifications. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();

        // Notify backend
        await supabase.functions.invoke('subscribe-to-push', {
          body: {
            subscription: subscription.toJSON(),
            action: 'unsubscribe',
          },
        });
      }

      setIsSubscribed(false);
      toast({
        title: 'Unsubscribed',
        description: 'You will no longer receive push notifications.',
      });
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe from notifications.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive daily reminders and recovery support messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSubscribed ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              ✓ You're subscribed to notifications. You'll receive reminders at 8:00 AM and 6:30 PM based on your location.
            </p>
            <Button
              onClick={unsubscribeFromPush}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <BellOff className="w-4 h-4 mr-2" />
              Disable Notifications
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enable notifications to receive:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Daily morning reminders (8:00 AM)</li>
              <li>Evening check-ins (6:30 PM)</li>
              <li>Session reminders if you're away</li>
            </ul>
            <Button
              onClick={subscribeToPush}
              disabled={isLoading}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              Enable Notifications
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationManager;
