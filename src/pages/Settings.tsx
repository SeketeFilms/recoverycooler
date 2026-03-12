import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  TrendingUp, 
  BookOpen, 
  AlertCircle, 
  Users, 
  Shield, 
  HelpCircle, 
  Lock,
  ChevronRight,
  LogOut,
  MessageSquare,
  Fingerprint,
  Bell,
  Coffee,
  Heart,
  FileText,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useNativePushNotifications } from '@/hooks/useNativePushNotifications';
import { useWebPushNotifications } from '@/hooks/useWebPushNotifications';
import { toast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { UpdateChecker } from '@/components/AppUpdateBanner';
import ChangelogHistory from '@/components/ChangelogHistory';

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { 
    isAvailable: biometricAvailable, 
    isEnabled: biometricEnabled, 
    enableBiometric, 
    disableBiometric,
    getBiometryLabel 
  } = useBiometricAuth();
  const { 
    isSupported: pushSupported, 
    isRegistered: pushRegistered, 
    permissionStatus,
    requestPermission: requestPushPermission 
  } = useNativePushNotifications();
  const {
    isSupported: webPushSupported,
    isGranted: webPushGranted,
    requestPermission: requestWebPushPermission,
  } = useWebPushNotifications();

  const menuItems = [
    {
      icon: TrendingUp,
      title: 'Progress Tracker',
      description: 'View your recovery journey',
      path: '/progress',
      color: 'text-primary',
    },
    {
      icon: BookOpen,
      title: 'Recovery Journal',
      description: 'Log your daily experiences',
      path: '/journal',
      color: 'text-primary',
    },
    {
      icon: AlertCircle,
      title: 'Crisis Support',
      description: 'Get immediate help',
      path: '/crisis',
      color: 'text-destructive',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with others',
      path: '/community',
      color: 'text-primary',
    },
    {
      icon: Shield,
      title: 'Relapse Prevention',
      description: 'Manage triggers and strategies',
      path: '/relapse-prevention',
      color: 'text-primary',
    },
    {
      icon: MessageSquare,
      title: 'AI Assistant',
      description: 'Chat with AI support',
      path: '/ai-chat',
      color: 'text-accent',
    },
    {
      icon: Users,
      title: 'Accountability Partners',
      description: 'Connect with support partners',
      path: '/partners',
      color: 'text-primary',
    },
    {
      icon: TrendingUp,
      title: 'Weekly Reports',
      description: 'View progress reports',
      path: '/reports',
      color: 'text-primary',
    },
    {
      icon: HelpCircle,
      title: 'Help & Resources',
      description: 'Get support and information',
      path: '/help',
      color: 'text-primary',
    },
    {
      icon: Lock,
      title: 'Security',
      description: 'Manage your account security',
      path: '/security',
      color: 'text-primary',
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      const success = await enableBiometric();
      if (success) {
        toast({
          title: 'Biometric Enabled',
          description: `${getBiometryLabel()} authentication is now active`,
        });
      } else {
        toast({
          title: 'Authentication Failed',
          description: 'Could not enable biometric authentication',
          variant: 'destructive',
        });
      }
    } else {
      disableBiometric();
      toast({
        title: 'Biometric Disabled',
        description: 'Biometric authentication has been turned off',
      });
    }
  };

  const handlePushToggle = async () => {
    if (!pushRegistered) {
      const success = await requestPushPermission();
      if (success) {
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive push notifications',
        });
      } else {
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications in your device settings',
          variant: 'destructive',
        });
      }
    }
  };

  const handleWebPushToggle = async () => {
    if (!webPushGranted) {
      const success = await requestWebPushPermission();
      if (success) {
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive browser notifications',
        });
      } else {
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications in your browser settings',
          variant: 'destructive',
        });
      }
    }
  };

  const handleBuyMeCoffee = () => {
    window.open('https://www.paypal.com/ncp/payment/PW92XP4Y58LJN', '_blank');
  };

  const isNative = Capacitor.isNativePlatform();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-32">
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-muted-foreground mt-2">Manage your recovery tools</p>
          </div>
        </div>

        {/* Native Features Section */}
        {isNative && (
          <div className="mb-6 space-y-3">
            <h2 className="text-lg font-semibold text-muted-foreground mb-3">App Security & Notifications</h2>
            
            {biometricAvailable && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-muted">
                      <Fingerprint className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{getBiometryLabel()} Lock</h3>
                      <p className="text-sm text-muted-foreground">Secure app with biometrics</p>
                    </div>
                  </div>
                  <Switch
                    checked={biometricEnabled}
                    onCheckedChange={handleBiometricToggle}
                  />
                </div>
              </Card>
            )}

            {pushSupported && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-muted">
                      <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Push Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        {pushRegistered ? 'Notifications enabled' : 'Enable recovery reminders'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={pushRegistered || permissionStatus === 'granted'}
                    onCheckedChange={handlePushToggle}
                  />
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Web Push for non-native */}
        {!isNative && webPushSupported && (
          <div className="mb-6 space-y-3">
            <h2 className="text-lg font-semibold text-muted-foreground mb-3">Notifications</h2>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-muted">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Browser Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      {webPushGranted ? 'Notifications enabled' : 'Enable recovery reminders'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={webPushGranted}
                  onCheckedChange={handleWebPushToggle}
                />
              </div>
            </Card>
          </div>
        )}

        <div className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.path}
                className="p-4 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-muted">
                      <Icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            );
          })}

          {/* Buy Me Coffee Section */}
          <Card 
            className="p-4 mt-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:shadow-lg transition-all cursor-pointer"
            onClick={handleBuyMeCoffee}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/20">
                  <Coffee className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    Buy Me a Coffee
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  </h3>
                  <p className="text-sm text-muted-foreground">Support the developer via PayPal</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4 mt-8 border-destructive/20">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </Card>
        </div>

        {/* App Updates Section */}
        <Card className="p-4 mt-6">
          <UpdateChecker />
        </Card>

        {/* Changelog History Section */}
        <div className="mt-6">
          <ChangelogHistory />
        </div>

        {/* Legal & Compliance Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Legal & Compliance</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/terms-of-service" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <FileText className="h-4 w-4" />
              Terms of Service
            </Link>
            <a 
              href="https://sites.google.com/view/recoverycooler?usp=sharing" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              Privacy Policy
            </a>
            <Link 
              to="/data-deletion" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Data Deletion
            </Link>
          </div>
        </div>

        {/* App Attribution */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            App by <span className="font-semibold text-primary">Sekete Films Production</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
