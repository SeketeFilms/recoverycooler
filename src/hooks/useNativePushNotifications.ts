import { useState, useCallback } from 'react';

// Web-only push notifications hook - native push not supported
export const useNativePushNotifications = () => {
  const [isSupported] = useState(false);
  const [isRegistered] = useState(false);
  const [token] = useState<string | null>(null);
  const [permissionStatus] = useState<string>('denied');

  const requestPermission = useCallback(async (): Promise<boolean> => {
    // Native push not available on web
    return false;
  }, []);

  const unregister = useCallback(async () => {
    // No-op on web
  }, []);

  return {
    isSupported,
    isRegistered,
    token,
    permissionStatus,
    requestPermission,
    unregister,
  };
};
