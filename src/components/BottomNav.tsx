import { Home, Clock, DollarSign, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Clock, label: 'Cooldown', path: '/cooldown' },
    { icon: DollarSign, label: 'Spending', path: '/spending' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6">
      <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-around h-20 px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300",
                  isActive 
                    ? "text-primary scale-110 bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:scale-105 hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-6 w-6", isActive && "drop-shadow-[0_0_10px_hsl(var(--primary)/0.6)]")} />
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
