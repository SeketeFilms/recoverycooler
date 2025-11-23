import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, DollarSign, Shield, HelpCircle, LogOut, MessageSquare, TrendingUp, BookOpen, AlertCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import InstallPrompt from '@/components/InstallPrompt';

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
  pornography: [
    "Your brain is healing. Every day builds new pathways.",
    "Real connection awaits beyond the screen.",
    "You are reclaiming your authentic self.",
    "The urge will fade. Your worth remains constant.",
    "One moment of strength at a time.",
    "You're rewiring your mind for healthy relationships.",
    "Your future self will thank you for today's choice.",
    "Choose presence over pixels. You've got this.",
  ],
};

const Home = () => {
  const [quote, setQuote] = useState('');
  const [addictionType, setAddictionType] = useState<'gambling' | 'alcohol' | 'pornography'>('gambling');
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

    const type = (data?.addiction_type as 'gambling' | 'alcohol' | 'pornography') || 'gambling';
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-32">
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

        {/* I Need Help Button */}
        <Button 
          size="default"
          onClick={() => navigate('/cooldown')}
          className="w-full py-6 text-base font-semibold bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 transform transition-all duration-300 ease-in-out hover:scale-[1.01] hover:shadow-lg shadow-destructive/30"
        >
          I Need Help
        </Button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
            onClick={() => navigate('/progress')}
          >
            <TrendingUp className="h-6 w-6" />
            <span className="text-sm font-medium">Progress Tracker</span>
          </Button>
          <Button 
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
            onClick={() => navigate('/journal')}
          >
            <BookOpen className="h-6 w-6" />
            <span className="text-sm font-medium">Recovery Journal</span>
          </Button>
          <Button 
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-destructive/10 hover:border-destructive/50 transition-all"
            onClick={() => navigate('/crisis')}
          >
            <AlertCircle className="h-6 w-6 text-destructive" />
            <span className="text-sm font-medium">Crisis Support</span>
          </Button>
          <Button 
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
            onClick={() => navigate('/spending')}
          >
            <DollarSign className="h-6 w-6" />
            <span className="text-sm font-medium">
              {addictionType === 'gambling' ? 'Spending Tracker' : 'Alcohol Spending'}
            </span>
          </Button>
        </div>

        {/* Additional Tools */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline"
            className="h-20 flex items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
            onClick={() => navigate('/exclusion')}
          >
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">
              {addictionType === 'gambling' ? 'Blocking' : 'Outlet Blocking'}
            </span>
          </Button>
          <Button 
            variant="outline"
            className="h-20 flex items-center justify-center gap-2 hover:bg-accent/20 hover:border-accent/50 transition-all"
            onClick={() => navigate('/ai-chat')}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-medium">AI Assistant</span>
          </Button>
        </div>

        {/* Rebuild Life */}
        <Button 
          variant="outline"
          className="h-20 flex items-center justify-center gap-3 hover:bg-primary/10 hover:border-primary/50 transition-all"
          onClick={() => navigate('/rebuild-life')}
        >
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">Rebuild My Life</span>
        </Button>

      </div>
      <BottomNav />
      <InstallPrompt />
    </div>
  );
};

export default Home;
