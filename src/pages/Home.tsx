import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, DollarSign, Shield, HelpCircle, LogOut, MessageSquare, AlertCircle } from 'lucide-react';
import AppReviews from '@/components/AppReviews';
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
    "Your worth isn't measured by wins or losses.",
    "Today's choice builds tomorrow's freedom.",
    "Recovery is progress, not perfection.",
    "You have the power to break this cycle.",
    "Each day clean is a gift to yourself.",
    "Your family believes in you. Keep going.",
    "The casino doesn't care about you. We do.",
    "Financial freedom starts with one choice.",
    "Gambling took enough. Reclaim your life.",
    "You're writing a new story today.",
    "Strength grows from struggle.",
    "Your recovery matters more than any bet.",
    "One hour at a time if needed.",
    "You've survived 100% of your hardest days.",
    "Peace is worth more than any jackpot.",
    "Your mind is clearer without gambling.",
    "Every 'no' is a step toward freedom.",
    "You're building a life worth living.",
    "The urge lies. Your strength tells the truth.",
    "Recovery is your greatest investment.",
    "You deserve a life free from addiction.",
    "Today you choose yourself over the game.",
    "Healing happens when you show up daily.",
    "Your journey inspires others. Keep walking.",
    "The best bet is on your recovery.",
    "Courage isn't absence of fear. It's action despite it.",
    "You're more than your addiction.",
    "Freedom feels better than any win.",
    "Every trigger you resist makes you stronger.",
    "Your story of recovery begins now.",
    "The person you want to be is waiting.",
    "Control the controllable. Let go of the rest.",
    "You're planting seeds for a better future.",
    "Recovery: the only game where everyone wins.",
    "Your peace of mind is priceless.",
    "Stand tall. You're fighting for your life.",
    "Today's discomfort is tomorrow's strength.",
    "You're rewriting your brain's patterns.",
    "Self-compassion fuels lasting change.",
    "The life you want is on the other side of this.",
    "Keep showing up. That's all recovery asks.",
    "You matter. Your recovery matters.",
    "Choose life over the illusion of luck.",
    "Every clean day compounds into freedom.",
    "Your resilience is remarkable.",
    "The urge is temporary. Your courage is lasting.",
    "You're not starting over. You're starting stronger.",
    "Believe in your ability to change.",
    "Recovery is the bravest choice you'll make.",
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
    "Sobriety is freedom, not restriction.",
    "Your life is worth living fully present.",
    "Recovery reveals who you really are.",
    "Every sober morning is a gift.",
    "You're rebuilding trust—starting with yourself.",
    "Clear eyes, clear mind, clear future.",
    "The bottle empties you. Recovery fills you.",
    "You deserve relationships built on presence.",
    "Waking up without regret is priceless.",
    "Your body is healing with every sober day.",
    "Alcohol promised relief but delivered chains.",
    "You're proving yourself wrong in the best way.",
    "Sobriety unlocks your true potential.",
    "Your feelings are valid without numbing them.",
    "Each day sober is a rebellion against addiction.",
    "You're learning to live, not just survive.",
    "The person you're becoming is worth it.",
    "Clarity is your new superpower.",
    "Recovery gives back everything alcohol took.",
    "You're brave for choosing this path.",
    "Sleep, health, peace—sobriety's gifts.",
    "Your story can help someone else.",
    "Triggers don't control you. You do.",
    "Alcohol-free doesn't mean fun-free.",
    "You're finding joy in unexpected places.",
    "Every craving resisted is a victory.",
    "Your brain is thanking you for this break.",
    "Connection, not alcohol, heals loneliness.",
    "You're writing a new chapter.",
    "Sobriety is self-love in action.",
    "The hard days make the good days better.",
    "You're stronger than any bottle.",
    "Real life beats any buzz.",
    "Your emotions are messengers, not enemies.",
    "Recovery opens doors you forgot existed.",
    "You're showing up for yourself today.",
    "Progress isn't always linear. Keep going.",
    "The sober version of you is amazing.",
    "Freedom from alcohol is true liberation.",
    "You're not missing out. You're gaining everything.",
    "Your presence is a present to those who love you.",
    "One choice, one moment, one day at a time.",
    "You're healing wounds alcohol only masked.",
    "Sobriety: the ultimate act of self-respect.",
    "Your courage today creates your freedom tomorrow.",
    "The life you imagined is within reach.",
    "You're doing something incredible right now.",
    "Every sober day is a building block.",
    "Your worth has nothing to do with drinking.",
    "Recovery is the kindest thing you can do for yourself.",
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
    "Intimacy grows when screens turn off.",
    "You're breaking chains you didn't choose.",
    "Real life holds more than any screen.",
    "Your brain is designed for real connection.",
    "Every day clean rewires your mind for better.",
    "You're reclaiming your time and attention.",
    "Authenticity beats artificial every time.",
    "Your relationships will thank you.",
    "Freedom means controlling what controls you.",
    "You're building the capacity for real love.",
    "Screen-free moments become sacred.",
    "Your mind deserves better content.",
    "Recovery reveals your true desires.",
    "You're healing neural pathways daily.",
    "Real touch matters. Real eyes matter.",
    "You're choosing depth over distraction.",
    "Your attention is your most valuable asset.",
    "Recovery reconnects you to real life.",
    "You're worth more than what screens offer.",
    "Every clean day is brain healing in action.",
    "True intimacy requires presence.",
    "You're training your brain for healthy love.",
    "The fog lifts as you stay clean.",
    "Your energy belongs to real relationships.",
    "You're becoming fully present.",
    "Recovery unlocks emotional availability.",
    "Your partner deserves the real you.",
    "Pixels can't replace genuine connection.",
    "You're reclaiming your imagination.",
    "Mental clarity improves daily.",
    "You're investing in future relationships.",
    "The brain's plasticity is on your side.",
    "Real confidence grows in recovery.",
    "You're choosing meaning over momentary.",
    "Your heart knows what it really wants.",
    "Recovery makes space for real love.",
    "You're breaking generational patterns.",
    "Every urge resisted is growth.",
    "Your story helps others facing the same.",
    "Presence is the greatest gift you can give.",
    "You're learning to feel, not just escape.",
    "Real fulfillment awaits beyond the screen.",
    "Your mind is becoming your ally again.",
    "Recovery restores your self-respect.",
    "You're capable of deep, real connection.",
    "The struggle today builds strength for tomorrow.",
    "Your brain thanks you for choosing differently.",
    "Authentic joy is worth the journey.",
    "You're becoming who you were meant to be.",
    "Every clean day is a step toward wholeness.",
  ],
};

const Home = () => {
  const [quote, setQuote] = useState('');
  const [addictionType, setAddictionType] = useState<'gambling' | 'alcohol' | 'pornography'>('gambling');
  const [appName, setAppName] = useState('Recovery App');
  const [shortcuts, setShortcuts] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadUserProfile();
    loadUserShortcuts();
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

  const loadUserShortcuts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_shortcuts')
      .select('shortcut_key')
      .eq('user_id', user.id)
      .order('position');

    if (data && data.length > 0) {
      setShortcuts(data.map(s => s.shortcut_key));
    } else {
      // Default shortcuts
      setShortcuts(['progress', 'journal', 'crisis', 'community']);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const availableShortcuts = {
    progress: {
      icon: Sparkles,
      label: 'Progress',
      path: '/progress',
      color: 'text-primary'
    },
    journal: {
      icon: MessageSquare,
      label: 'Journal',
      path: '/journal',
      color: 'text-accent'
    },
    crisis: {
      icon: AlertCircle,
      label: 'Crisis Support',
      path: '/crisis',
      color: 'text-destructive'
    },
    community: {
      icon: MessageSquare,
      label: 'Community',
      path: '/community',
      color: 'text-primary'
    },
    relapse: {
      icon: Shield,
      label: 'Relapse Prevention',
      path: '/relapse-prevention',
      color: 'text-accent'
    },
    exclusion: {
      icon: Shield,
      label: addictionType === 'gambling' ? 'Blocking' : 'Outlet Blocking',
      path: '/exclusion',
      color: 'text-primary'
    },
    ai: {
      icon: MessageSquare,
      label: 'AI Assistant',
      path: '/ai-chat',
      color: 'text-accent'
    },
    help: {
      icon: HelpCircle,
      label: 'Help Resources',
      path: '/help',
      color: 'text-primary'
    },
    meditation: {
      icon: Sparkles,
      label: 'Meditation',
      path: '/meditation',
      color: 'text-accent'
    },
    partners: {
      icon: MessageSquare,
      label: 'Partners',
      path: '/partners',
      color: 'text-primary'
    },
    reports: {
      icon: Sparkles,
      label: 'Reports',
      path: '/reports',
      color: 'text-primary'
    },
    locations: {
      icon: AlertCircle,
      label: 'Location Alerts',
      path: '/location-alerts',
      color: 'text-destructive'
    }
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
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-destructive/10 hover:border-destructive/50 transition-all"
            onClick={() => navigate('/cooldown')}
          >
            <AlertCircle className="h-6 w-6 text-destructive" />
            <span className="text-sm font-medium">Need Help Now</span>
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

        {/* Quick Access Shortcuts */}
        {shortcuts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Quick Access</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings/shortcuts')}
                className="text-xs"
              >
                Customize
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {shortcuts.map((key) => {
                const shortcut = availableShortcuts[key as keyof typeof availableShortcuts];
                if (!shortcut) return null;
                const Icon = shortcut.icon;
                return (
                  <Button
                    key={key}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
                    onClick={() => navigate(shortcut.path)}
                  >
                    <Icon className={`h-5 w-5 ${shortcut.color}`} />
                    <span className="text-sm font-medium">{shortcut.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Rebuild Life */}
        <Button 
          variant="outline"
          className="h-20 flex items-center justify-center gap-3 hover:bg-primary/10 hover:border-primary/50 transition-all"
          onClick={() => navigate('/rebuild-life')}
        >
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">Rebuild My Life</span>
        </Button>

        {/* App Reviews */}
        <AppReviews />

      </div>
    </div>
  );
};

export default Home;
