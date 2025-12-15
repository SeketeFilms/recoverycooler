// Offline cache service for persisting user data locally

const CACHE_KEYS = {
  USER_PROFILE: 'rc_user_profile',
  PROGRESS: 'rc_progress',
  COPING_STRATEGIES: 'rc_coping_strategies',
  LAST_SYNC: 'rc_last_sync',
};

export interface CachedUserData {
  profile?: {
    full_name?: string;
    username?: string;
    addiction_type?: string;
  };
  progress?: {
    current_streak: number;
    longest_streak: number;
    clean_since: string;
  };
  copingStrategies?: Array<{
    strategy_name: string;
    strategy_description: string;
  }>;
}

export const offlineCache = {
  saveUserProfile: (profile: CachedUserData['profile']) => {
    try {
      localStorage.setItem(CACHE_KEYS.USER_PROFILE, JSON.stringify(profile));
      localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.error('Failed to cache profile:', e);
    }
  },

  saveProgress: (progress: CachedUserData['progress']) => {
    try {
      localStorage.setItem(CACHE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to cache progress:', e);
    }
  },

  saveCopingStrategies: (strategies: CachedUserData['copingStrategies']) => {
    try {
      localStorage.setItem(CACHE_KEYS.COPING_STRATEGIES, JSON.stringify(strategies));
    } catch (e) {
      console.error('Failed to cache strategies:', e);
    }
  },

  getUserData: (): CachedUserData => {
    try {
      const profile = localStorage.getItem(CACHE_KEYS.USER_PROFILE);
      const progress = localStorage.getItem(CACHE_KEYS.PROGRESS);
      const strategies = localStorage.getItem(CACHE_KEYS.COPING_STRATEGIES);

      return {
        profile: profile ? JSON.parse(profile) : undefined,
        progress: progress ? JSON.parse(progress) : undefined,
        copingStrategies: strategies ? JSON.parse(strategies) : undefined,
      };
    } catch (e) {
      console.error('Failed to read cache:', e);
      return {};
    }
  },

  getLastSync: (): string | null => {
    return localStorage.getItem(CACHE_KEYS.LAST_SYNC);
  },

  clearCache: () => {
    Object.values(CACHE_KEYS).forEach(key => localStorage.removeItem(key));
  },
};
