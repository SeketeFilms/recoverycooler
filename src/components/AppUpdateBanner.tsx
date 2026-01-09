import { useState } from 'react';
import { Download, X, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppUpdate, APP_VERSION } from '@/hooks/useAppUpdate';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

export const AppUpdateBanner = () => {
  const {
    currentVersion,
    latestVersion,
    isUpdateAvailable,
    isRequired,
    releaseNotes,
    isChecking,
    checkForUpdates,
    dismissUpdate,
    isDismissed,
  } = useAppUpdate();

  const [showDialog, setShowDialog] = useState(false);

  // Don't show if no update or dismissed (unless required)
  if (!isUpdateAvailable || (isDismissed && !isRequired)) {
    return null;
  }

  const handleUpdate = () => {
    // For PWA: Reload the page to get new service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update();
        });
      });
    }
    
    // Force reload to get latest version
    window.location.reload();
  };

  const handleDismiss = () => {
    if (!isRequired) {
      dismissUpdate();
    }
    setShowDialog(false);
  };

  return (
    <>
      {/* Floating banner */}
      <div className="fixed top-0 left-0 right-0 z-50 p-2 bg-primary text-primary-foreground shadow-lg animate-in slide-in-from-top duration-300">
        <div className="container mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium truncate">
              {isRequired ? 'Required update available!' : 'New version available!'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowDialog(true)}
              className="h-7 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Update
            </Button>
            {!isRequired && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDismiss}
                className="h-7 w-7 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Update Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              App Update Available
            </DialogTitle>
            <DialogDescription>
              A new version of the app is ready to install.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current version:</span>
              <span className="font-mono">{currentVersion}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">New version:</span>
              <span className="font-mono text-primary font-medium">{latestVersion}</span>
            </div>

            {isRequired && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Required Update</AlertTitle>
                <AlertDescription>
                  This update is required to continue using the app.
                </AlertDescription>
              </Alert>
            )}

            {releaseNotes && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">What's new:</h4>
                <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {releaseNotes}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {!isRequired && (
              <Button variant="outline" onClick={handleDismiss} className="w-full sm:w-auto">
                Later
              </Button>
            )}
            <Button onClick={handleUpdate} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Update Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Manual check component for Settings page
export const UpdateChecker = () => {
  const {
    currentVersion,
    latestVersion,
    isUpdateAvailable,
    isChecking,
    lastChecked,
    checkForUpdates,
    releaseNotes,
  } = useAppUpdate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">App Version</h3>
          <p className="text-sm text-muted-foreground font-mono">{currentVersion}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={checkForUpdates}
          disabled={isChecking}
        >
          {isChecking ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Check for Updates
        </Button>
      </div>

      {lastChecked && (
        <p className="text-xs text-muted-foreground">
          Last checked: {lastChecked.toLocaleString()}
        </p>
      )}

      {isUpdateAvailable && latestVersion && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertTitle>Update Available</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Version {latestVersion} is available.</p>
            {releaseNotes && (
              <p className="text-xs">{releaseNotes}</p>
            )}
            <Button
              size="sm"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              <Download className="h-4 w-4 mr-2" />
              Update Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!isUpdateAvailable && !isChecking && lastChecked && (
        <p className="text-sm text-green-600 dark:text-green-400">
          ✓ You're on the latest version
        </p>
      )}
    </div>
  );
};
