import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Music2,
  X,
  Search,
  Lock,
  Coffee,
  ListMusic,
  SkipForward,
  SkipBack,
  Trash2,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTrackQueue } from '@/hooks/useTrackQueue';

interface Track {
  title: string;
  youtubeId: string;
  duration: string; // mm:ss
  gradient: string;
  tag: string;
}

// Playlist 2 — Recovery Cooler Official Soundtracks (Coffee Givers only)
const OFFICIAL_TRACKS: Track[] = [
  { title: 'Spirit', youtubeId: 'oVut93mr3Ls', duration: '3:42', gradient: 'from-violet-500/50 to-indigo-500/50', tag: 'Official' },
  { title: 'One More Day', youtubeId: 'la0iDPyWBI0', duration: '3:28', gradient: 'from-amber-500/50 to-orange-500/50', tag: 'Official' },
  { title: 'A New Chapter', youtubeId: 'vZtOwJ0iyFo', duration: '3:55', gradient: 'from-emerald-500/50 to-teal-500/50', tag: 'Official' },
  { title: 'Broken No More', youtubeId: 'yf8arcYQ5vA', duration: '3:36', gradient: 'from-rose-500/50 to-pink-500/50', tag: 'Official' },
  { title: 'I Choose Life', youtubeId: '3p99WKrKCzs', duration: '3:47', gradient: 'from-sky-500/50 to-cyan-500/50', tag: 'Official' },
  { title: 'Scars Into Strength', youtubeId: 'Ioky_yUQRL0', duration: '4:02', gradient: 'from-fuchsia-500/50 to-purple-500/50', tag: 'Official' },
  { title: 'Freedom From Chains', youtubeId: '54eogc2IN8k', duration: '3:51', gradient: 'from-yellow-500/50 to-amber-500/50', tag: 'Official' },
  { title: 'Rise Again', youtubeId: 'nwJoaPtQg0I', duration: '3:33', gradient: 'from-lime-500/50 to-green-500/50', tag: 'Official' },
  { title: 'Road Back Home', youtubeId: 'ImQFm_S6Fqo', duration: '3:44', gradient: 'from-blue-500/50 to-indigo-500/50', tag: 'Official' },
  { title: 'Still Standing', youtubeId: 'HXAkx3lV2hU', duration: '3:59', gradient: 'from-red-500/50 to-rose-500/50', tag: 'Official' },
];

// Playlist 1 — Original ambient tracks (free for everyone)
const AMBIENT_TRACKS: Track[] = [
  { title: 'Night Water Flow 1', youtubeId: 'I9lq8gIp5es', duration: '10:00', gradient: 'from-slate-500/40 to-blue-500/40', tag: 'Ambient' },
  { title: 'Night Water Flow 2', youtubeId: 'X3TabauC0uk', duration: '10:00', gradient: 'from-slate-500/40 to-indigo-500/40', tag: 'Ambient' },
  { title: 'Night Water Flow 3', youtubeId: 'JUDmFnqbrb8', duration: '10:00', gradient: 'from-slate-500/40 to-cyan-500/40', tag: 'Ambient' },
  { title: 'Power Water Meditation 1', youtubeId: '81O5_-sFWGw', duration: '10:00', gradient: 'from-cyan-500/40 to-teal-500/40', tag: 'Ambient' },
  { title: 'Power Water Meditation 2', youtubeId: 'QBl5rd-EJB4', duration: '10:00', gradient: 'from-cyan-500/40 to-emerald-500/40', tag: 'Ambient' },
  { title: 'Power Water Meditation 3', youtubeId: 'mzSeBjLGqu4', duration: '10:00', gradient: 'from-teal-500/40 to-green-500/40', tag: 'Ambient' },
  { title: 'Rain & Calm Energy 1', youtubeId: 'M2zYCg4ExMs', duration: '10:00', gradient: 'from-indigo-500/40 to-purple-500/40', tag: 'Ambient' },
  { title: 'Rain & Calm Energy 2', youtubeId: '8reUL35jWUU', duration: '10:00', gradient: 'from-indigo-500/40 to-violet-500/40', tag: 'Ambient' },
  { title: 'Rain & Calm Energy 3', youtubeId: 'zGjLmtH38o0', duration: '10:00', gradient: 'from-purple-500/40 to-fuchsia-500/40', tag: 'Ambient' },
];

const OWNER_EMAILS = ['seketefilmstv@gmail.com'];
const DONOR_LOCAL_KEY = 'rc_coffee_giver';
const COFFEE_URL = 'https://www.paypal.com/paypalme/seketefilms';
const DEFAULT_DURATION = '—:—';

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
const thumbFallback = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

type ViewMode = 'all' | 'official' | 'ambient';

interface TrackCardProps {
  track: Track;
  locked: boolean;
  onPlay: () => void;
  onQueue: () => void;
}

const TrackCard = ({ track, locked, onPlay, onQueue }: TrackCardProps) => (
  <Card className="min-w-[220px] sm:min-w-0 overflow-hidden hover:shadow-lg transition-all group">
    <div className={`relative h-28 bg-gradient-to-br ${track.gradient}`}>
      <img
        src={thumb(track.youtubeId)}
        alt={track.title}
        loading="lazy"
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.dataset.fallback) {
            img.dataset.fallback = '1';
            img.src = thumbFallback(track.youtubeId);
          }
        }}
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <Badge className="absolute top-2 left-2 text-[10px]" variant="secondary">
        {track.tag}
      </Badge>
      <span className="absolute bottom-2 right-2 text-[11px] font-mono text-white bg-black/60 rounded px-1.5 py-0.5">
        {track.duration || DEFAULT_DURATION}
      </span>
      <button
        onClick={locked ? undefined : onPlay}
        className="absolute inset-0 flex items-center justify-center"
        aria-label={locked ? 'Locked' : `Play ${track.title}`}
      >
        <div className="bg-background/90 rounded-full p-3 backdrop-blur shadow-lg group-hover:scale-110 transition">
          {locked ? <Lock className="h-5 w-5" /> : <Play className="h-5 w-5 text-primary" fill="currentColor" />}
        </div>
      </button>
    </div>
    <CardContent className="p-3 space-y-2">
      <p className="font-medium truncate text-sm" title={track.title}>{track.title}</p>
      <div className="flex gap-1">
        <Button size="sm" variant="default" className="flex-1 h-8" onClick={onPlay} disabled={locked}>
          <Play className="h-3 w-3 mr-1" fill="currentColor" /> Play
        </Button>
        <Button size="sm" variant="outline" className="h-8 px-2" onClick={onQueue} disabled={locked} aria-label="Add to queue">
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

interface PlaylistColumnProps {
  title: string;
  subtitle: string;
  tracks: Track[];
  locked: boolean;
  onPlay: (t: Track) => void;
  onQueue: (t: Track) => void;
  onUnlock?: () => void;
}

const PlaylistColumn = ({ title, subtitle, tracks, locked, onPlay, onQueue, onUnlock }: PlaylistColumnProps) => (
  <div className="space-y-3 flex-1 min-w-0">
    <div className="flex items-start justify-between gap-2">
      <div>
        <h3 className="text-base font-semibold flex items-center gap-2">
          {locked && <Lock className="h-4 w-4 text-amber-500" />}
          {title}
        </h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {locked && onUnlock && (
        <Button size="sm" variant="outline" onClick={onUnlock} className="shrink-0">
          <Coffee className="h-3 w-3 mr-1" /> Unlock
        </Button>
      )}
    </div>

    {tracks.length === 0 ? (
      <p className="text-sm text-muted-foreground italic py-4 text-center">No tracks match.</p>
    ) : (
      <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-1 sm:overflow-visible snap-x snap-mandatory">
        {tracks.map((t) => (
          <div key={t.youtubeId} className="snap-start shrink-0 sm:shrink w-[220px] sm:w-auto">
            <TrackCard
              track={t}
              locked={locked}
              onPlay={() => onPlay(t)}
              onQueue={() => onQueue(t)}
            />
          </div>
        ))}
      </div>
    )}
  </div>
);

export const RecoveryCoolerTracks = () => {
  const { user } = useAuth();
  const [playing, setPlaying] = useState<Track | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('all');
  const { queue, history, api } = useTrackQueue();

  const isOwner = !!user?.email && OWNER_EMAILS.includes(user.email.toLowerCase());
  const [donor, setDonor] = useState<boolean>(
    () => isOwner || (typeof window !== 'undefined' && localStorage.getItem(DONOR_LOCAL_KEY) === '1')
  );
  const officialLocked = !isOwner && !donor;

  const filter = (list: Track[]) =>
    list.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  const officialFiltered = useMemo(() => filter(OFFICIAL_TRACKS), [search]);
  const ambientFiltered = useMemo(() => filter(AMBIENT_TRACKS), [search]);

  const play = async (t: Track) => {
    if (playing) api.pushHistory(playing);
    setPlaying(t);
    if (user) {
      await supabase.from('meditation_sessions').insert({
        user_id: user.id,
        track_name: t.title,
        duration_minutes: 3,
      });
    }
  };

  const addToQueue = (t: Track) => {
    api.add(t);
    toast.success(`Added "${t.title}" to queue`);
  };

  const playNext = () => {
    const next = api.shiftNext();
    if (next) {
      if (playing) api.pushHistory(playing);
      setPlaying(next as Track);
    } else {
      setPlaying(null);
    }
  };

  const playPrev = () => {
    const prev = api.popHistory();
    if (prev) setPlaying(prev as Track);
  };

  const unlockOfficial = () => {
    const answer = window.confirm(
      'Recovery Cooler Officials are for Coffee Givers ☕\n\nClick OK to open the "Buy me a coffee" page. After you donate, come back and confirm.'
    );
    if (answer) {
      window.open(COFFEE_URL, '_blank');
      const done = window.confirm('Have you completed a coffee donation? Click OK to unlock the Officials playlist.');
      if (done) {
        localStorage.setItem(DONOR_LOCAL_KEY, '1');
        setDonor(true);
        toast.success('Thanks for the coffee! Officials unlocked ☕');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Music2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Meditation Soundtracks</h2>
        {isOwner && <Badge variant="secondary" className="text-[10px]">Owner · All Access</Badge>}
      </div>

      {/* Search + Filter tabs */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search soundtracks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 rounded-md border p-1 bg-muted/40">
          {(['all', 'official', 'ambient'] as ViewMode[]).map((v) => (
            <Button
              key={v}
              size="sm"
              variant={view === v ? 'default' : 'ghost'}
              className="h-7 capitalize text-xs"
              onClick={() => setView(v)}
            >
              {v === 'official' ? 'Officials (10)' : v}
            </Button>
          ))}
        </div>
      </div>

      {/* Two playlists side by side */}
      <div className={`flex flex-col ${view === 'all' ? 'lg:flex-row' : ''} gap-6`}>
        {(view === 'all' || view === 'ambient') && (
          <PlaylistColumn
            title="Playlist 1 · Ambient"
            subtitle="Free · Water, rain & calm energy"
            tracks={ambientFiltered}
            locked={false}
            onPlay={play}
            onQueue={addToQueue}
          />
        )}
        {(view === 'all' || view === 'official') && (
          <PlaylistColumn
            title="Playlist 2 · Recovery Cooler Officials"
            subtitle={officialLocked ? '10 official soundtracks · locked' : '10 official soundtracks'}
            tracks={officialFiltered}
            locked={officialLocked}
            onPlay={play}
            onQueue={addToQueue}
            onUnlock={officialLocked ? unlockOfficial : undefined}
          />
        )}
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <Card>
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium text-sm">
                <ListMusic className="h-4 w-4" /> Play Queue ({queue.length})
              </div>
              <Button size="sm" variant="ghost" onClick={() => api.clear()}>
                <Trash2 className="h-3 w-3 mr-1" /> Clear
              </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {queue.map((t, i) => (
                <div key={`${t.youtubeId}-${i}`} className="shrink-0 flex items-center gap-2 rounded border px-2 py-1 text-xs">
                  <img src={thumb(t.youtubeId)} alt="" className="w-8 h-8 rounded object-cover" />
                  <span className="max-w-[140px] truncate">{t.title}</span>
                  <span className="font-mono text-muted-foreground">{t.duration}</span>
                  <button
                    onClick={() => setQueue((q) => q.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove from queue"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player modal */}
      {playing && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPlaying(null)}
        >
          <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2 text-white gap-2">
              <div className="min-w-0">
                <p className="font-semibold truncate">{playing.title}</p>
                <p className="text-xs text-white/70">{playing.tag} · {playing.duration}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {queue.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={playNext} className="text-white hover:bg-white/10">
                    <SkipForward className="h-4 w-4 mr-1" /> Next ({queue.length})
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setPlaying(null)} className="text-white hover:bg-white/10">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${playing.youtubeId}?autoplay=1&rel=0`}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
