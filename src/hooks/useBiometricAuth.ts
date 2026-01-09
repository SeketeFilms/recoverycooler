import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

interface BiometricResult {
  isAvailable: boolean;
  biometryType: 'fingerprint' | 'faceId' | 'iris' | 'none';
}

export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<string>('none');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAvailability();
    loadSettings();
  }, []);

  const checkAvailability = async () => {
    if (!Capacitor.isNativePlatform()) {
      setIsLoading(false);
      return;
    }

    try {
      const { NativeBiometric } = await import('capacitor-native-biometric');
      const result = await NativeBiometric.isAvailable();
      setIsAvailable(result.isAvailable);
      setBiometryType(result.biometryType.toString());
    } catch (error) {
      console.log('Biometric not available:', error);
      setIsAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = () => {
    const enabled = localStorage.getItem('biometric_enabled') === 'true';
    setIsEnabled(enabled);
  };

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform() || !isAvailable) {
      return true; // Skip on web
    }

    try {
      const { NativeBiometric } = await import('capacitor-native-biometric');
      await NativeBiometric.verifyIdentity({
        reason: 'Verify your identity to access Recovery Cooler',
        title: 'Biometric Authentication',
        subtitle: 'Use your fingerprint or face to unlock',
        description: 'Touch the sensor or look at the camera',
      });
      return true;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }, [isAvailable]);

  const enableBiometric = async (): Promise<boolean> => {
    const success = await authenticate();
    if (success) {
      localStorage.setItem('biometric_enabled', 'true');
      setIsEnabled(true);
    }
    return success;
  };

  const disableBiometric = () => {
    localStorage.setItem('biometric_enabled', 'false');
    setIsEnabled(false);
  };

  const getBiometryLabel = (): string => {
    switch (biometryType) {
      case '1': // TouchID / Fingerprint
        return 'Fingerprint';
      case '2': // FaceID
        return 'Face ID';
      case '3': // Iris
        return 'Iris';
      default:
        return 'Biometric';
    }
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
