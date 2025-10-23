import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, LogOut, Save } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('US');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Profile & Settings</h1>
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
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="NZ">New Zealand</SelectItem>
                  <SelectItem value="IE">Ireland</SelectItem>
                  <SelectItem value="IN">India</SelectItem>
                  <SelectItem value="ZA">South Africa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
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
    </div>
  );
};

export default Profile;
