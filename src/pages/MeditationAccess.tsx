import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Lock, Coffee, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const OWNER_EMAILS = ['seketefilmstv@gmail.com'];
const DONOR_LOCAL_KEY = 'rc_coffee_giver';
const COFFEE_URL = 'https://www.paypal.com/paypalme/seketefilms';

export default function MeditationAccess() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const email = (user?.email || '').toLowerCase();
  const isOwner = OWNER_EMAILS.includes(email);
  const isDonor = typeof window !== 'undefined' && localStorage.getItem(DONOR_LOCAL_KEY) === '1';
  const hasAccess = isOwner || isDonor;

  const grant = () => {
    localStorage.setItem(DONOR_LOCAL_KEY, '1');
    toast.success('Officials playlist unlocked');
    setTimeout(() => navigate('/meditation'), 400);
  };

  const revoke = () => {
    localStorage.removeItem(DONOR_LOCAL_KEY);
    toast.message('Unlock removed for this device');
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3 pt-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Playlist Access Check</h1>
            <p className="text-sm text-muted-foreground">Quick self-check for the Officials playlist</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hasAccess ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Lock className="h-5 w-5 text-amber-500" />
              )}
              Status
            </CardTitle>
            <CardDescription>{email || 'Not signed in'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Owner account</span>
              <Badge variant={isOwner ? 'default' : 'secondary'}>{isOwner ? 'Yes' : 'No'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Coffee-giver unlock (this device)</span>
              <Badge variant={isDonor ? 'default' : 'secondary'}>{isDonor ? 'Active' : 'Inactive'}</Badge>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="font-medium">Officials playlist access</span>
              <Badge variant={hasAccess ? 'default' : 'destructive'}>
                {hasAccess ? 'Granted' : 'Denied'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {!hasAccess ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Unlock access</CardTitle>
              <CardDescription>Support the project to enable the Officials playlist on this device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => window.open(COFFEE_URL, '_blank')}>
                <Coffee className="h-4 w-4 mr-2" /> Open donation page
              </Button>
              <Button variant="outline" className="w-full" onClick={grant}>
                I&apos;ve donated — grant access now
              </Button>
            </CardContent>
          </Card>
        ) : (
          !isOwner && (
            <Card>
              <CardContent className="p-4">
                <Button variant="outline" className="w-full" onClick={revoke}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset unlock on this device
                </Button>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
