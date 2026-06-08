import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const ShareSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState('');
  const [nickname, setNickname] = useState('');
  const [story, setStory] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);
  const [showStreak, setShowStreak] = useState(true);
  const [showMilestones, setShowMilestones] = useState(true);
  const [showAchievements, setShowAchievements] = useState(true);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('public_journeys').select('*').eq('user_id', user.id).maybeSingle();
    if (data) {
      setSlug(data.slug);
      setNickname(data.nickname ?? '');
      setStory(data.story ?? '');
      setIsPublic(data.is_public);
      setShowAvatar(data.show_avatar);
      setShowStreak(data.show_streak);
      setShowMilestones(data.show_milestones);
      setShowAchievements(data.show_achievements);
    } else {
      const { data: prof } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('user_id', user.id)
        .maybeSingle();
      const base = (prof?.username || prof?.full_name || 'warrior')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(`${base}-${user.id.slice(0, 6)}`);
      setNickname(prof?.full_name ?? '');
    }
    setLoading(false);
  };

  const save = async () => {
    if (!user) return;
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
    if (cleanSlug.length < 3) {
      toast.error('Slug must be at least 3 characters');
      return;
    }
    const { error } = await supabase.from('public_journeys').upsert(
      {
        user_id: user.id,
        slug: cleanSlug,
        nickname: nickname || null,
        story: story || null,
        is_public: isPublic,
        show_avatar: showAvatar,
        show_streak: showStreak,
        show_milestones: showMilestones,
        show_achievements: showAchievements,
      },
      { onConflict: 'user_id' }
    );
    if (error) {
      if (error.code === '23505') toast.error('That slug is already taken');
      else toast.error('Failed to save');
      return;
    }
    setSlug(cleanSlug);
    toast.success('Saved!');
  };

  const url = `${window.location.origin}/journey/${slug}`;

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 pb-28">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Share My Journey</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your shareable link</CardTitle>
            <CardDescription>Works on any device. Will keep working if you add a custom domain later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={url} readOnly />
              <Button variant="outline" size="icon" onClick={() => {
                navigator.clipboard.writeText(url);
                toast.success('Copied!');
              }}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => window.open(url, '_blank')}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="your-name" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Public profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row label="Make my journey public" desc="Anyone with the link can view your page.">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </Row>
            <Row label="Show avatar"><Switch checked={showAvatar} onCheckedChange={setShowAvatar} /></Row>
            <Row label="Show streak counter"><Switch checked={showStreak} onCheckedChange={setShowStreak} /></Row>
            <Row label="Show milestones"><Switch checked={showMilestones} onCheckedChange={setShowMilestones} /></Row>
            <Row label="Show achievements"><Switch checked={showAchievements} onCheckedChange={setShowAchievements} /></Row>

            <div>
              <Label htmlFor="nick">Nickname</Label>
              <Input id="nick" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={50} />
            </div>
            <div>
              <Label htmlFor="story">Your story</Label>
              <Textarea
                id="story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                maxLength={2000}
                rows={6}
                placeholder="Share what brought you here, your hopes, what keeps you going..."
              />
            </div>
            <Button className="w-full" onClick={save}>Save</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex-1">
      <p className="text-sm font-medium">{label}</p>
      {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
    </div>
    {children}
  </div>
);

export default ShareSettings;
