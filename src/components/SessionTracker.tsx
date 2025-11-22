import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SessionTracker = () => {
  const { user } = useAuth();
  const lastActivityRef = useRef<number>(Date.now());
  const activityTimerRef = useRef<NodeJS.Timeout>();

  const reportActivity = async (activity: 'active' | 'inactive') => {
    if (!user) return;

    try {
      // Ensure we have a valid session before calling the function
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No valid session for activity tracking');
        return;
      }

      await supabase.functions.invoke('track-session', {
        body: { activity },
      });
    } catch (error) {
      console.error('Error reporting activity:', error);
    }
  };

  const handleActivity = () => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // Only report if it's been more than 5 minutes since last activity report
    if (timeSinceLastActivity > 5 * 60 * 1000) {
      reportActivity('active');
      lastActivityRef.current = now;
    }

    // Reset the inactivity timer
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }

    // Set timer to report inactivity after 5 minutes of no activity
    activityTimerRef.current = setTimeout(() => {
      reportActivity('inactive');
    }, 5 * 60 * 1000);
  };

  useEffect(() => {
    if (!user) return;

    // Report active on mount
    reportActivity('active');

    // Listen for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Set initial inactivity timer
    activityTimerRef.current = setTimeout(() => {
      reportActivity('inactive');
    }, 5 * 60 * 1000);

    // Report inactive when page is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportActivity('inactive');
        if (activityTimerRef.current) {
          clearTimeout(activityTimerRef.current);
        }
      } else {
        reportActivity('active');
        lastActivityRef.current = Date.now();
        handleActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
    };
  }, [user]);

  return null; // This component doesn't render anything
};

export default SessionTracker;
