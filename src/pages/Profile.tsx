import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { User, LogOut, Save, Moon, Sun, Edit, Camera, Trash2, Shield, UserCircle, X, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { z } from 'zod';
import { CountrySelector } from '@/components/CountrySelector';
import { useTheme } from 'next-themes';


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
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      const stored = data.avatar_url || '';
      setAvatarUrl(stored);
      if (stored) {
        const signed = await getSignedAvatarUrl(stored);
        setDisplayAvatarUrl(signed || '');
      } else {
        setDisplayAvatarUrl('');
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    setUploading(true);

    try {
      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to upload profile picture');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user || !avatarUrl) return;

    setUploading(true);

    try {
      // Delete avatar from storage
      const oldPath = avatarUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('avatars').remove([oldPath]);

      // Update profile to remove avatar_url
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl('');
      toast.success('Profile picture removed!');
    } catch (error) {
      toast.error('Failed to remove profile picture');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // Get gender-based icon
  const getGenderIcon = () => {
    const lowerGender = gender.toLowerCase();
    if (lowerGender === 'male' || lowerGender === 'm') {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-blue-500">
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        </svg>
      );
    } else if (lowerGender === 'female' || lowerGender === 'f') {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-pink-500">
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        </svg>
      );
    }
    return <UserCircle className="w-16 h-16 text-muted-foreground" />;
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      { name: 'Full Name', filled: !!fullName.trim() },
      { name: 'Username', filled: !!username.trim() },
      { name: 'Gender', filled: !!gender.trim() },
      { name: 'Country', filled: !!country && country !== 'US' }, // Count as filled if changed from default
      { name: 'Profile Photo', filled: !!avatarUrl },
    ];
    
    const filledCount = fields.filter(f => f.filled).length;
    const percentage = Math.round((filledCount / fields.length) * 100);
    const missingFields = fields.filter(f => !f.filled).map(f => f.name);
    
    return { percentage, filledCount, total: fields.length, missingFields };
  };

  const profileCompletion = calculateProfileCompletion();

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

    setIsEditing(false);
    toast.success('Profile updated!');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setDeleting(true);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No active session");
      }

      // Call edge function to delete account completely (including auth.users)
      const { error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error deleting account:', error);
        throw error;
      }

      toast.success('Account deleted successfully');
      
      // Sign out and redirect
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error('Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-32">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="gentle-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Profile & Settings
          </h1>
          <p className="text-base text-muted-foreground mt-2">Manage your account information</p>
        </div>

        {/* Profile Completion Indicator */}
        <Card className={`gentle-fade-in ${profileCompletion.percentage === 100 ? 'border-green-500/50 bg-green-500/5' : 'border-amber-500/50 bg-amber-500/5'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${profileCompletion.percentage === 100 ? 'bg-green-500/20' : 'bg-amber-500/20'}`}>
                <CheckCircle2 className={`w-6 h-6 ${profileCompletion.percentage === 100 ? 'text-green-500' : 'text-amber-500'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Profile Completion</h3>
                  <span className={`text-lg font-bold ${profileCompletion.percentage === 100 ? 'text-green-500' : 'text-amber-500'}`}>
                    {profileCompletion.percentage}%
                  </span>
                </div>
                <Progress 
                  value={profileCompletion.percentage} 
                  className={`h-2 ${profileCompletion.percentage === 100 ? '[&>div]:bg-green-500' : '[&>div]:bg-amber-500'}`}
                />
                {profileCompletion.percentage < 100 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Missing: {profileCompletion.missingFields.join(', ')}
                  </p>
                )}
                {profileCompletion.percentage === 100 && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    🎉 Your profile is complete!
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gentle-fade-in shadow-xl bg-gradient-to-br from-card to-primary/5 border-primary/10">
          <CardHeader>
            <div className="flex flex-col items-center justify-center mb-6 gap-3">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <Avatar className="h-36 w-36 ring-4 ring-primary/10 transition-all hover:ring-primary/30">
                  <AvatarImage src={avatarUrl} alt={fullName || 'Profile'} />
                  <AvatarFallback className="bg-muted flex items-center justify-center">
                    {getGenderIcon()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-10 h-10 text-white" />
                </div>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                  </div>
                )}
              </div>
              {avatarUrl && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto();
                  }}
                  disabled={uploading}
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove Photo
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Your Information
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
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
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                placeholder="Your gender"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <CountrySelector value={country} onValueChange={setCountry} disabled={!isEditing} />
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} disabled={loading} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    loadProfile();
                  }}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            )}
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
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/security')}
            >
              <Shield className="mr-2 h-4 w-4" />
              Security Settings
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Button variant="destructive" className="w-full" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers, including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Your profile information</li>
                    <li>Spending logs and limits</li>
                    <li>Self-exclusion list</li>
                    <li>All other personal data</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
    </div>
  );
};

export default Profile;
