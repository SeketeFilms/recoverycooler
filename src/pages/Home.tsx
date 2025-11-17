import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, DollarSign, Shield, User, HelpCircle, LogOut } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const motivationalQuotes = {
  gambling: [
    "You are stronger than the urge. Pause and breathe.",
    "Every moment of resistance is a victory.",
    "One breath at a time. You've got this.",
    "Your future self will thank you for today's strength.",
    "The urge will pass. Your strength will remain.",
    "You're not alone in this journey.",
    "Small steps lead to big changes.",
    "Choose calm over chaos. You can do this.",
  ],
  alcohol: [
    "You are stronger than the craving. Pause and breathe.",
    "Every moment of sobriety is a victory.",
    "One day at a time. You've got this.",
    "Your future self will thank you for today's choice.",
    "The craving will pass. Your strength will remain.",
    "You're not alone in this journey.",
    "Small steps lead to lasting sobriety.",
    "Choose clarity over chaos. You can do this.",
  ],
};

const Home = () => {
  const [quote, setQuote] = useState('');
  const [addictionType, setAddictionType] = useState<'gambling' | 'alcohol'>('gambling');
  const [appName, setAppName] = useState('Recovery App');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('addiction_type')
      .eq('user_id', user.id)
      .single();

    const type = (data?.addiction_type as 'gambling' | 'alcohol') || 'gambling';
    setAddictionType(type);
    setAppName('Recovery Cooler');
    
    const quotes = motivationalQuotes[type];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gentle-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{appName}</h1>
            <p className="text-sm text-muted-foreground mt-1">Welcome back, {user?.email?.split('@')[0]}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/help')} className="rounded-full hover:scale-110 transition-transform">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full hover:scale-110 transition-transform">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Daily Motivation */}
        <Card className="gentle-fade-in bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-6 h-6 text-primary" />
              Daily Motivation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium italic leading-relaxed">{quote}</p>
          </CardContent>
        </Card>

        {/* Emergency Cooldown Button */}
        <div className="flex justify-center py-12">
          <button
            onClick={() => navigate('/cooldown')}
            className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-105 breathe-animation"
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
            <span className="text-sm sm:text-base">
              {addictionType === 'gambling' ? 'Gambling Tracker' : 'Alcohol Tracker'}
            </span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-24 flex-col gap-2"
            onClick={() => navigate('/exclusion')}
          >
            <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-sm sm:text-base">
              {addictionType === 'gambling' ? 'Site Blocking' : 'Venue Blocking'}
            </span>
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
      <BottomNav />
    </div>
  );
};

export default Home;
