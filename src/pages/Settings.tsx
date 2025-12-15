import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  MessageSquare
} from 'lucide-react';


const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

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
      </div>
      
    </div>
  );
};

export default Settings;
