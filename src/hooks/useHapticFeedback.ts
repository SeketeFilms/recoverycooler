export const useHapticFeedback = () => {
  const trigger = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const durations = {
        light: 10,
        medium: 25,
        heavy: 50,
      };
      navigator.vibrate(durations[intensity]);
    }
  };

  return { trigger };
};
