import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Heart, Share2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { getSignedAvatarUrl } from '@/lib/avatarUrl';
import { ReportContentDialog } from '@/components/ReportContentDialog';
import { JourneyInteractions } from '@/components/JourneyInteractions';


const QUOTES = [
  'Every day clean is a victory worth celebrating.',
  'Recovery is not a race — it is a return to yourself.',
  'You are stronger than the urge.',
  'One breath, one moment, one day at a time.',
  'The journey is the destination.',
];

interface JourneyData {
  id: string;
  nickname: string | null;
  story: string | null;
  show_avatar: boolean;
  show_streak: boolean;
  show_milestones: boolean;
  show_achievements: boolean;
  user_id: string;
}

const PublicJourney = () => {
  const { slug } = useParams();
  const [journey, setJourney] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [longest, setLongest] = useState(0);
  const [cleanSince, setCleanSince] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      const { data: j } = await supabase
        .from('public_journeys')
        .select('*')
        .eq('slug', slug)
        .eq('is_public', true)
        .maybeSingle();
      if (!j) {
        setLoading(false);
        return;
      }
      setJourney(j as any);

      const [profile, progress, achieved] = await Promise.all([
        supabase.from('profiles').select('avatar_url, full_name, username').eq('user_id', j.user_id).maybeSingle(),
        supabase.from('progress_tracking').select('*').eq('user_id', j.user_id).maybeSingle(),
        supabase
          .from('user_achievements')
          .select('achievement_id, achievements(name, description, icon, badge_color)')
          .eq('user_id', j.user_id)
          .limit(20),
      ]);

      if (j.show_avatar && profile.data?.avatar_url) {
        setAvatar(await getSignedAvatarUrl(profile.data.avatar_url));
      }
      if (progress.data) {
        setStreak(progress.data.current_streak ?? 0);
        setLongest(progress.data.longest_streak ?? 0);
        setCleanSince(progress.data.clean_since);
      }
      setAchievements((achieved.data ?? []).map((a: any) => a.achievements).filter(Boolean));
      setLoading(false);
    };
    load();
  }, [slug]);

  const url = window.location.href;
  const shareText = encodeURIComponent(`Follow my recovery journey: ${url}`);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!journey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <h1 className="text-2xl font-bold">Journey not found</h1>
            <p className="text-muted-foreground">This recovery journey is private or doesn't exist.</p>
            <Link to="/"><Button>Go home</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysSober = cleanSince
    ? Math.max(0, Math.floor((Date.now() - new Date(cleanSince).getTime()) / 86400000))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-primary/40 to-accent/40" />
          <CardContent className="pt-0 -mt-12 text-center space-y-3">
            {journey.show_avatar && (
              <Avatar className="w-24 h-24 mx-auto border-4 border-background">
                <AvatarImage src={avatar ?? undefined} />
                <AvatarFallback>{(journey.nickname ?? '?').slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
            <h1 className="text-2xl font-bold">{journey.nickname ?? 'Anonymous Warrior'}</h1>
            <p className="text-sm text-muted-foreground">on the road to recovery</p>
          </CardContent>
        </Card>

        {journey.show_streak && (
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <Flame className="h-8 w-8 mx-auto text-primary" />
              <div className="text-5xl font-bold">{daysSober}</div>
              <p className="text-muted-foreground">days clean</p>
              {journey.show_milestones && (
                <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-2">
                  <span>Current streak: <b className="text-foreground">{streak}</b></span>
                  <span>Best: <b className="text-foreground">{longest}</b></span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {journey.story && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" /> My Story
              </h2>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{journey.story}</p>
            </CardContent>
          </Card>
        )}

        {journey.show_achievements && achievements.length > 0 && (
          <Card>
            <CardContent className="pt-6 space-y-3">
              <h2 className="font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" /> Achievements
              </h2>
              <div className="flex flex-wrap gap-2">
                {achievements.map((a, i) => (
                  <Badge key={i} variant="secondary" className="py-1">{a.icon} {a.name}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <p className="italic text-sm">"{quote}"</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Share2 className="h-4 w-4" /> Share this journey
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={copyLink}>
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
              <Button variant="outline" onClick={() => window.open(`https://wa.me/?text=${shareText}`)}>
                WhatsApp
              </Button>
              <Button variant="outline" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`)}>
                Facebook
              </Button>
              <Button variant="outline" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${shareText}`)}>
                X / Twitter
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-3 pt-4">
          <ReportContentDialog
            contentType="public_journey"
            contentId={journey.id}
            triggerLabel="Report this journey"
            variant="ghost"
          />
          <Link to="/" className="text-sm text-primary hover:underline">
            Start your own recovery — RecoveryCooler
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicJourney;
