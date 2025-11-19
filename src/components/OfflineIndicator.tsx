import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useEffect, useState } from 'react';

const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  const [show, setShow] = useState(!isOnline);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // Show "back online" message briefly
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!show) return null;

  return (
    <Alert 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md transition-all duration-300 ${
        isOnline 
          ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400' 
          : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400'
      }`}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <AlertDescription className="font-medium">
          {isOnline 
            ? 'Back online! Syncing data...' 
            : 'You\'re offline. Breathing exercises still available.'}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default OfflineIndicator;
