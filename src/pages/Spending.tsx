import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingDown, Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { z } from 'zod';
import { getCurrencySymbol } from '@/lib/currency';

const spendingSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount too large')
    .multipleOf(0.01, 'Amount can have at most 2 decimal places'),
  notes: z.string().trim().max(200, 'Notes too long').optional(),
});

const Spending = () => {
  const [dailyLimit, setDailyLimit] = useState<number>(0);
  const [todaySpent, setTodaySpent] = useState<number>(0);
  const [newLimit, setNewLimit] = useState<string>('');
  const [logAmount, setLogAmount] = useState<string>('');
  const [logNotes, setLogNotes] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    // Load user's country for currency
    const { data: profileData } = await supabase
      .from('profiles')
      .select('country')
      .eq('user_id', user.id)
      .single();

    if (profileData?.country) {
      setCurrencySymbol(getCurrencySymbol(profileData.country));
    }

    // Load daily limit
    const { data: limitData } = await supabase
      .from('spending_limits')
      .select('daily_limit')
      .eq('user_id', user.id)
      .single();

    if (limitData) {
      setDailyLimit(limitData.daily_limit);
    }

    // Load today's spending
    const today = new Date().toISOString().split('T')[0];
    const { data: logsData } = await supabase
      .from('spending_logs')
      .select('amount')
      .eq('user_id', user.id)
      .eq('date', today);

    if (logsData) {
      const total = logsData.reduce((sum, log) => sum + Number(log.amount), 0);
      setTodaySpent(total);
    }
  };

  const handleSaveLimit = async () => {
    if (!user || !newLimit) return;

    const limitValue = parseFloat(newLimit);
    const validationResult = spendingSchema.safeParse({ amount: limitValue });

    if (!validationResult.success) {
      toast.error(validationResult.error.issues[0].message);
      return;
    }

    const { error } = await supabase
      .from('spending_limits')
      .upsert({
        user_id: user.id,
        daily_limit: parseFloat(newLimit),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      toast.error('Failed to save limit');
      return;
    }

    setDailyLimit(parseFloat(newLimit));
    setNewLimit('');
    toast.success('Daily limit updated!');
  };

  const handleLogSpend = async () => {
    if (!user || !logAmount) return;

    const amount = parseFloat(logAmount);
    const validationResult = spendingSchema.safeParse({ amount, notes: logNotes });

    if (!validationResult.success) {
      toast.error(validationResult.error.issues[0].message);
      return;
    }

    const { error } = await supabase
      .from('spending_logs')
      .insert({
        user_id: user.id,
        amount,
        notes: logNotes,
      });

    if (error) {
      toast.error('Failed to log spending');
      return;
    }

    const newTotal = todaySpent + amount;
    setTodaySpent(newTotal);
    setLogAmount('');
    setLogNotes('');
    setDialogOpen(false);

    if (dailyLimit > 0 && newTotal >= dailyLimit) {
      toast.error('You have reached your daily spending limit!', {
        description: 'Take a moment to breathe and reflect.',
      });
    } else {
      toast.success(`Logged ${currencySymbol}${amount.toFixed(2)}`);
    }
  };

  const percentage = dailyLimit > 0 ? (todaySpent / dailyLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-32">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="gentle-fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Spending Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage your daily spending</p>
        </div>

        {/* Today's Progress */}
        <Card className="gentle-fade-in border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Today's Spending
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-5xl font-bold">{currencySymbol}{todaySpent.toFixed(2)}</p>
              <p className="text-muted-foreground">
                {dailyLimit > 0 ? `of ${currencySymbol}${dailyLimit.toFixed(2)} limit` : 'No limit set'}
              </p>
            </div>
            {dailyLimit > 0 && (
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      percentage >= 100 ? 'bg-destructive' : percentage >= 75 ? 'bg-yellow-500' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  {percentage >= 100 ? 'Limit reached!' : `${percentage.toFixed(0)}% of daily limit`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Set Daily Limit */}
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-accent" />
              Daily Limit
            </CardTitle>
            <CardDescription>
              Set a daily spending limit to help manage your habits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="limit">New Daily Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder={`e.g. ${currencySymbol}50.00`}
                  className="text-lg"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSaveLimit} disabled={!newLimit} className="h-10">
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Log Spending */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              Log Spending
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Spending</DialogTitle>
              <DialogDescription>
                Track your spending to stay mindful of your habits
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={logAmount}
                  onChange={(e) => setLogAmount(e.target.value)}
                  placeholder={`e.g. ${currencySymbol}25.00`}
                  className="text-lg"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Where did you spend?"
                />
              </div>
              <Button onClick={handleLogSpend} disabled={!logAmount} className="w-full">
                Log Amount
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
    </div>
  );
};

export default Spending;
