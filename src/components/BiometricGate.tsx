import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { Button } from '@/components/ui/button';
import { Fingerprint, Shield } from 'lucide-react';

interface BiometricGateProps {
  children: React.ReactNode;
}

const BiometricGate = ({ children }: BiometricGateProps) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { isEnabled, authenticate, getBiometryLabel, isLoading } = useBiometricAuth();

  useEffect(() => {
    if (!isLoading) {
      checkAndAuthenticate();
    }
  }, [isLoading, isEnabled]);

  const checkAndAuthenticate = async () => {
    // Skip biometric check if not on native platform or not enabled
    if (!Capacitor.isNativePlatform() || !isEnabled) {
      setIsUnlocked(true);
      setIsChecking(false);
      return;
    }

    // Check if recently authenticated (within last 5 minutes)
    const lastAuth = localStorage.getItem('last_biometric_auth');
    if (lastAuth) {
      const timeSinceAuth = Date.now() - parseInt(lastAuth);
      if (timeSinceAuth < 5 * 60 * 1000) { // 5 minutes
        setIsUnlocked(true);
        setIsChecking(false);
        return;
      }
    }

    // Attempt biometric authentication
    setIsChecking(false);
    await attemptUnlock();
  };

  const attemptUnlock = async () => {
    const success = await authenticate();
    if (success) {
      localStorage.setItem('last_biometric_auth', Date.now().toString());
      setIsUnlocked(true);
    }
  };

  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading security...</p>
        </div>
      </div>
    );
  }

  if (!isUnlocked && isEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-sm">
          <div className="space-y-4">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Fingerprint className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Recovery Cooler</h1>
            <p className="text-muted-foreground">
              Use {getBiometryLabel()} to unlock the app
            </p>
          </div>

          <Button
            size="lg"
            onClick={attemptUnlock}
            className="w-full py-6"
          >
            <Fingerprint className="w-5 h-5 mr-2" />
            Unlock with {getBiometryLabel()}
          </Button>

          <p className="text-xs text-muted-foreground">
            Your data is protected with biometric security
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default BiometricGate;
