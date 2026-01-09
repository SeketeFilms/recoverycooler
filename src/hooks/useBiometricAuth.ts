import { useState, useCallback } from 'react';

// Web-only biometric auth hook - always returns unavailable
export const useBiometricAuth = () => {
  const [isAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading] = useState(false);
  const [biometryType] = useState<string>('none');

  const authenticate = useCallback(async (): Promise<boolean> => {
    // Biometric not available on web
    return true;
  }, []);

  const enableBiometric = async (): Promise<boolean> => {
    // Not available on web
    return false;
  };

  const disableBiometric = () => {
    setIsEnabled(false);
  };

  const getBiometryLabel = (): string => {
    return 'Biometric';
  };

  return {
    isAvailable,
    isEnabled,
    isLoading,
    biometryType,
    authenticate,
    enableBiometric,
    disableBiometric,
    getBiometryLabel,
  };
};
