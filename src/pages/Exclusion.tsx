import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Shield, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const domainSchema = z.object({
  domain: z.string()
    .trim()
    .min(3, 'Domain too short')
    .max(253, 'Domain too long')
    .regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i, 'Invalid domain format'),
});

interface Domain {
  id: string;
  domain: string;
}

const Exclusion = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDomains();
    }
  }, [user]);

  const loadDomains = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('self_exclusion_domains')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setDomains(data);
    }
  };

  const handleAddDomain = async () => {
    if (!user || !newDomain.trim()) return;

    const cleanDomain = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

    const validationResult = domainSchema.safeParse({ domain: cleanDomain });

    if (!validationResult.success) {
      toast.error(validationResult.error.issues[0].message);
      return;
    }

    const { error } = await supabase
      .from('self_exclusion_domains')
      .insert({
        user_id: user.id,
        domain: cleanDomain,
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('This domain is already in your list');
      } else {
        toast.error('Failed to add domain');
      }
      return;
    }

    setNewDomain('');
    loadDomains();
    toast.success(`Blocked ${cleanDomain}`);
  };

  const handleRemoveDomain = async (id: string, domain: string) => {
    const { error } = await supabase
      .from('self_exclusion_domains')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to remove domain');
      return;
    }

    loadDomains();
    toast.success(`Unblocked ${domain}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Self-Exclusion</h1>
        </div>

        <Card className="gentle-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Block Gambling Sites
            </CardTitle>
            <CardDescription>
              Add domains to help prevent access during vulnerable moments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="domain">Website Domain</Label>
                <Input
                  id="domain"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="e.g. casinosite.com"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddDomain} disabled={!newDomain.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {domains.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No blocked domains yet. Add one above to get started.
                </p>
              ) : (
                domains.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                  >
                    <span className="font-mono text-sm">{item.domain}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDomain(item.id, item.domain)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="pt-6 space-y-2">
            <p className="font-medium text-sm">💡 How it works:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Blocked sites are stored in your personal list</li>
              <li>Share this list with accountability partners</li>
              <li>Consider using browser extensions or parental controls for system-wide blocking</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Exclusion;
