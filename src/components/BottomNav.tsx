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
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-2xl z-50">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex items-center justify-around h-20">
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
