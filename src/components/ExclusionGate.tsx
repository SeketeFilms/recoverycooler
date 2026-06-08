import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Phone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface Period {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
}

const ALLOWED_PATHS = ['/crisis', '/auth', '/privacy-policy', '/terms-of-service', '/data-deletion'];

export const ExclusionGate = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [period, setPeriod] = useState<Period | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!user) {
      setPeriod(null);
      return;
    }
    const check = async () => {
      const { data } = await supabase
        .from('self_exclusion_periods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString())
        .order('ends_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setPeriod(data as Period | null);
    };
    check();
    const i = setInterval(check, 60000);
    return () => clearInterval(i);
  }, [user]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!period) return <>{children}</>;
  if (ALLOWED_PATHS.includes(location.pathname)) return <>{children}</>;

  const remainingMs = new Date(period.ends_at).getTime() - now;
  const days = Math.floor(remainingMs / 86400000);
  const hours = Math.floor((remainingMs % 86400000) / 3600000);
  const minutes = Math.floor((remainingMs % 3600000) / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/10 via-background to-primary/10 p-6">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Self-Exclusion Active</h1>
            <p className="text-muted-foreground mt-2">
              You chose to take a break. Stay strong — the app will unlock automatically.
            </p>
          </div>
          {period.reason && (
            <p className="text-sm italic text-muted-foreground">"{period.reason}"</p>
          )}
          <div className="grid grid-cols-4 gap-2">
            <TimeBlock label="Days" value={days} />
            <TimeBlock label="Hrs" value={hours} />
            <TimeBlock label="Min" value={minutes} />
            <TimeBlock label="Sec" value={seconds} />
          </div>
          <div className="space-y-2">
            <Button className="w-full" onClick={() => navigate('/crisis')}>
              <Phone className="h-4 w-4 mr-2" /> Crisis Support
            </Button>
            <p className="text-xs text-muted-foreground">
              In an emergency, please call your local helpline.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TimeBlock = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-card border rounded-lg p-2">
    <div className="text-2xl font-bold font-mono">{String(Math.max(0, value)).padStart(2, '0')}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);
