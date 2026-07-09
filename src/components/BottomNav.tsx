import { useEffect, useState } from 'react';
import { Home, AlertCircle, DollarSign, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getSignedAvatarUrl } from '@/lib/avatarUrl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trigger } = useHapticFeedback();
  const { user } = useAuth();
  const [avatarSrc, setAvatarSrc] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return setAvatarSrc('');
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      const stored = data?.avatar_url;
      if (!stored) return;
      const signed = await getSignedAvatarUrl(stored);
      if (!cancelled && signed) setAvatarSrc(signed);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleNavClick = (path: string) => {
    trigger('medium');
    navigate(path);
  };

  const initial = (user?.email?.[0] || 'U').toUpperCase();

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: AlertCircle, label: 'Cooldown', path: '/cooldown' },
    { icon: DollarSign, label: 'Spending', path: '/spending' },
    { icon: User, label: 'Profile', path: '/profile', isProfile: true },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
      <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-full shadow-2xl">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-300 min-w-[60px]",
                  isActive 
                    ? "text-primary scale-105 bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:scale-102 hover:bg-muted/50"
                )}
              >
                {item.isProfile ? (
                  <Avatar className={cn("h-6 w-6 border", isActive && "ring-2 ring-primary")}>
                    {avatarSrc && <AvatarImage src={avatarSrc} alt="Profile" />}
                    <AvatarFallback className="text-[10px]">{initial}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]")} />
                )}
                <span className="text-[10px] font-semibold leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
