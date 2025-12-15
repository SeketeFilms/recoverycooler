import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { offlineCache } from '@/lib/offlineCache';
import { useOnlineStatus } from './useOnlineStatus';

export const useOfflineCache = () => {
  const { user } = useAuth();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!user || !isOnline) return;

    const syncData = async () => {
      try {
        // Fetch and cache profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, username, addiction_type')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          offlineCache.saveUserProfile(profile);
        }

        // Fetch and cache progress
        const { data: progress } = await supabase
          .from('progress_tracking')
          .select('current_streak, longest_streak, clean_since')
          .eq('user_id', user.id)
          .single();

        if (progress) {
          offlineCache.saveProgress(progress);
        }

        // Fetch and cache coping strategies
        const { data: strategies } = await supabase
          .from('coping_strategies')
          .select('strategy_name, strategy_description')
          .eq('user_id', user.id)
          .limit(10);

        if (strategies) {
          offlineCache.saveCopingStrategies(strategies);
        }
      } catch (error) {
        console.error('Failed to sync offline data:', error);
      }
    };

    syncData();
  }, [user, isOnline]);
};
