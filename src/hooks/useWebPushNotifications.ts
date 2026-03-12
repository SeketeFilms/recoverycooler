import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useWebPushNotifications = () => {
  const [isSupported] = useState('Notification' in window && 'serviceWorker' in navigator);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const { user } = useAuth();

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        // For web push without a service worker/VAPID setup, 
        // we use the Notification API directly for local notifications
        // and store the preference in the database
        if (user) {
          await supabase
            .from('notification_preferences')
            .upsert({
              user_id: user.id,
              recovery_checkins: true,
            }, { onConflict: 'user_id' });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported, user]);

  const sendLocalNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permissionStatus === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  }, [permissionStatus]);

  return {
    isSupported,
    permissionStatus,
    isGranted: permissionStatus === 'granted',
    requestPermission,
    sendLocalNotification,
  };
};
