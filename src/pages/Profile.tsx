import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { User, LogOut, Save, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { CountrySelector } from '@/components/CountrySelector';
import { useTheme } from 'next-themes';
import BottomNav from '@/components/BottomNav';

const profileSchema = z.object({
  fullName: z.string().trim().max(100, 'Name too long'),
  username: z.string().trim().max(50, 'Username too long'),
  gender: z.string().trim().max(50, 'Gender too long'),
  country: z.string().length(2, 'Invalid country code'),
});

const Profile = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('US');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setFullName(data.full_name || '');
      setUsername(data.username || '');
      setGender(data.gender || '');
      setCountry(data.country || 'US');
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);

    // Validate inputs
    const validationResult = profileSchema.safeParse({
      fullName,
      username,
      gender,
      country,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      toast.error(firstError.message);
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        username: username,
        gender: gender,
        country: country,
      })
      .eq('user_id', user.id);

    setLoading(false);

    if (error) {
      toast.error('Failed to update profile');
      return;
    }

    toast.success('Profile updated!');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="gentle-fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Profile & Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account information</p>
        </div>

        <Card className="gentle-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                placeholder="Your gender"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <CountrySelector value={country} onValueChange={setCountry} />
            </div>
            <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="gentle-fade-in">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-primary" />
                ) : (
                  <Sun className="h-5 w-5 text-primary" />
                )}
                <div>
                  <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/spending')}
            >
              Spending Tracker
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/exclusion')}
            >
              Self-Exclusion List
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/help')}
            >
              Help & FAQ
            </Button>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
