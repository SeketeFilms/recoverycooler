import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Current app version - update this when releasing new versions
export const APP_VERSION = '1.0.0';

interface AppVersionInfo {
  version: string;
  releaseNotes: string;
  isRequired: boolean;
  releaseDate: string;
}

interface UseAppUpdateReturn {
  currentVersion: string;
  latestVersion: string | null;
  isUpdateAvailable: boolean;
  isRequired: boolean;
  releaseNotes: string | null;
  isChecking: boolean;
  lastChecked: Date | null;
  checkForUpdates: () => Promise<void>;
  dismissUpdate: () => void;
  isDismissed: boolean;
}

const DISMISSED_VERSION_KEY = 'app_dismissed_update_version';
const LAST_CHECK_KEY = 'app_last_update_check';

export const useAppUpdate = (): UseAppUpdateReturn => {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [releaseNotes, setReleaseNotes] = useState<string | null>(null);
  const [isRequired, setIsRequired] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  };

  const checkForUpdates = useCallback(async () => {
    setIsChecking(true);
    try {
      // Check from edge function or local storage simulation
      // In production, this would call an edge function that returns version info
      const { data, error } = await supabase.functions.invoke('check-app-version', {
        body: { currentVersion: APP_VERSION }
      });

      if (error) {
        console.error('Error checking for updates:', error);
        // Fallback: use localStorage for demo/testing
        const storedVersion = localStorage.getItem('app_latest_version');
        if (storedVersion) {
          const versionInfo: AppVersionInfo = JSON.parse(storedVersion);
          setLatestVersion(versionInfo.version);
          setReleaseNotes(versionInfo.releaseNotes);
          setIsRequired(versionInfo.isRequired);
        }
      } else if (data) {
        setLatestVersion(data.version);
        setReleaseNotes(data.releaseNotes);
        setIsRequired(data.isRequired);
      }

      const now = new Date();
      setLastChecked(now);
      localStorage.setItem(LAST_CHECK_KEY, now.toISOString());

      // Check if this version was previously dismissed
      const dismissedVersion = localStorage.getItem(DISMISSED_VERSION_KEY);
      if (dismissedVersion && data?.version === dismissedVersion) {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    if (latestVersion && !isRequired) {
      localStorage.setItem(DISMISSED_VERSION_KEY, latestVersion);
      setIsDismissed(true);
    }
  }, [latestVersion, isRequired]);

  // Check on mount and periodically
  useEffect(() => {
    // Check last check time
    const lastCheckStr = localStorage.getItem(LAST_CHECK_KEY);
    if (lastCheckStr) {
      const lastCheck = new Date(lastCheckStr);
      setLastChecked(lastCheck);
      
      // Only auto-check if more than 1 hour has passed
      const hoursSinceCheck = (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCheck >= 1) {
        checkForUpdates();
      }
    } else {
      checkForUpdates();
    }
  }, [checkForUpdates]);

  const isUpdateAvailable = latestVersion 
    ? compareVersions(latestVersion, APP_VERSION) > 0 
    : false;

  return {
    currentVersion: APP_VERSION,
    latestVersion,
    isUpdateAvailable,
    isRequired,
    releaseNotes,
    isChecking,
    lastChecked,
    checkForUpdates,
    dismissUpdate,
    isDismissed,
  };
};
