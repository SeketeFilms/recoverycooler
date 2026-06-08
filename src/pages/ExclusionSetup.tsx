import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const PRESETS = [
  { label: '24 hours', hours: 24 },
  { label: '7 days', hours: 24 * 7 },
  { label: '30 days', hours: 24 * 30 },
  { label: '90 days', hours: 24 * 90 },
];

const ExclusionSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hours, setHours] = useState<number>(24);
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const start = async () => {
    if (!user) return;
    setLoading(true);
    const ends = new Date(Date.now() + hours * 3600 * 1000);
    const { error } = await supabase.from('self_exclusion_periods').insert({
      user_id: user.id,
      ends_at: ends.toISOString(),
      reason: reason.trim() || null,
    });
    setLoading(false);
    if (error) {
      toast.error('Failed to start exclusion');
      return;
    }
    toast.success('Exclusion started — stay strong');
    window.location.href = '/home';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/exclusion')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Start Self-Exclusion</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Choose your duration
            </CardTitle>
            <CardDescription>
              Once started, the app will lock until the period ends. Crisis support stays available.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.hours}
                  variant={hours === p.hours ? 'default' : 'outline'}
                  onClick={() => setHours(p.hours)}
                >
                  {p.label}
                </Button>
              ))}
            </div>

            <div>
              <Label htmlFor="custom">Custom hours</Label>
              <Input
                id="custom"
                type="number"
                min={1}
                max={24 * 365}
                value={hours}
                onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="A note to your future self..."
                maxLength={280}
              />
            </div>

            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                This cannot be undone. The lockout will last the full duration you choose.
              </p>
            </div>

            {!confirming ? (
              <Button className="w-full" size="lg" onClick={() => setConfirming(true)}>
                Continue
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-center font-medium">Are you sure?</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => setConfirming(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={start} disabled={loading}>
                    {loading ? 'Starting...' : 'Yes, lock me out'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExclusionSetup;
