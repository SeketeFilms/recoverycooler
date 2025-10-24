import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, DollarSign, Shield, User, HelpCircle, LogOut } from 'lucide-react';

const motivationalQuotes = [
  "You are stronger than the urge. Pause and breathe.",
  "Every moment of resistance is a victory.",
  "One breath at a time. You've got this.",
  "Your future self will thank you for today's strength.",
  "The urge will pass. Your strength will remain.",
  "You're not alone in this journey.",
  "Small steps lead to big changes.",
  "Choose calm over chaos. You can do this.",
];

const Home = () => {
  const [quote, setQuote] = useState('');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gentle-fade-in">
          <div>
            <h1 className="text-3xl font-bold">GambleCooler</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.email?.split('@')[0]}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/help')}>
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Daily Motivation */}
        <Card className="gentle-fade-in bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              Daily Motivation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium italic">{quote}</p>
          </CardContent>
        </Card>

        {/* Emergency Cooldown Button */}
        <div className="flex justify-center py-8">
          <button
            onClick={() => navigate('/cooldown')}
            className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full bg-primary text-primary-foreground shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 breathe-animation"
          >
            <div className="text-center space-y-2 px-4">
              <p className="text-xl sm:text-2xl font-bold">I NEED HELP</p>
              <p className="text-xs sm:text-sm opacity-90">Tap for immediate support</p>
            </div>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            variant="outline"
            size="lg"
            className="h-24 flex-col gap-2"
            onClick={() => navigate('/spending')}
          >
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-sm sm:text-base">Spending Tracker</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-24 flex-col gap-2"
            onClick={() => navigate('/exclusion')}
          >
            <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-sm sm:text-base">Self-Exclusion</span>
          </Button>
        </div>

        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => navigate('/profile')}
        >
          <User className="mr-2 h-5 w-5" />
          Profile & Settings
        </Button>
      </div>
    </div>
  );
};

export default Home;
