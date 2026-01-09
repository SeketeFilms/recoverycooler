import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useNativePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('prompt');
  const { user } = useAuth();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setIsSupported(true);
      checkPermissions();
      setupListeners();
    }
  }, []);

  const checkPermissions = async () => {
    try {
      const result = await PushNotifications.checkPermissions();
      setPermissionStatus(result.receive);
    } catch (error) {
      console.error('Error checking push permissions:', error);
    }
  };

  const setupListeners = () => {
    // On registration success
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success, token:', token.value);
      setToken(token.value);
      setIsRegistered(true);
      
      // Save token to database if user is logged in
      if (user) {
        await saveTokenToDatabase(token.value);
      }
    });

    // On registration error
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error:', error);
      setIsRegistered(false);
    });

    // On push notification received
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received:', notification);
    });

    // On notification action performed
    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Push notification action performed:', action);
      // Handle navigation based on notification data
      const data = action.notification.data;
      if (data?.url) {
        window.location.href = data.url;
      }
    });
  };

  const saveTokenToDatabase = async (pushToken: string) => {
    if (!user) return;

    try {
      // First delete any existing tokens for this user
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);

      // Insert new token
      await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user.id,
          endpoint: pushToken,
          p256dh: 'native',
          auth: 'native',
        });
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      let permResult = await PushNotifications.checkPermissions();
      
      if (permResult.receive === 'prompt') {
        permResult = await PushNotifications.requestPermissions();
      }

      if (permResult.receive === 'granted') {
        await PushNotifications.register();
        setPermissionStatus('granted');
        return true;
      }

      setPermissionStatus(permResult.receive);
      return false;
    } catch (error) {
      console.error('Error requesting push permissions:', error);
      return false;
    }
  }, []);

  const unregister = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await PushNotifications.removeAllListeners();
      setIsRegistered(false);
      setToken(null);

      if (user) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error unregistering push notifications:', error);
    }
  }, [user]);

  return {
    isSupported,
    isRegistered,
    token,
    permissionStatus,
    requestPermission,
    unregister,
  };
};
