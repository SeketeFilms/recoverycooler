import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Music2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Track {
  title: string;
  youtubeId: string;
  gradient: string;
}

const TRACKS: Track[] = [
  { title: 'Spirit', youtubeId: 'oVut93mr3Ls', gradient: 'from-violet-500/40 to-indigo-500/40' },
  { title: 'One More Day', youtubeId: 'la0iDPyWBI0', gradient: 'from-amber-500/40 to-orange-500/40' },
  { title: 'A New Chapter', youtubeId: 'vZtOwJ0iyFo', gradient: 'from-emerald-500/40 to-teal-500/40' },
  { title: 'Broken No More', youtubeId: 'yf8arcYQ5vA', gradient: 'from-rose-500/40 to-pink-500/40' },
  { title: 'I Choose Life', youtubeId: '3p99WKrKCzs', gradient: 'from-sky-500/40 to-cyan-500/40' },
  { title: 'Scars Into Strength', youtubeId: 'Ioky_yUQRL0', gradient: 'from-fuchsia-500/40 to-purple-500/40' },
  { title: 'Freedom From Chains', youtubeId: '54eogc2IN8k', gradient: 'from-yellow-500/40 to-amber-500/40' },
  { title: 'Rise Again', youtubeId: 'nwJoaPtQg0I', gradient: 'from-lime-500/40 to-green-500/40' },
  { title: 'Road Back Home', youtubeId: 'ImQFm_S6Fqo', gradient: 'from-blue-500/40 to-indigo-500/40' },
  { title: 'Still Standing', youtubeId: 'HXAkx3lV2hU', gradient: 'from-red-500/40 to-rose-500/40' },
];

export const RecoveryCoolerTracks = () => {
  const [playing, setPlaying] = useState<Track | null>(null);
  const { user } = useAuth();

  const start = async (t: Track) => {
    setPlaying(t);
    if (user) {
      await supabase.from('meditation_sessions').insert({
        user_id: user.id,
        track_name: t.title,
        duration_minutes: 3,
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Music2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Recovery Cooler Originals</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Official soundtracks to accompany your meditation and reflection.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TRACKS.map((t) => (
          <Card
            key={t.youtubeId}
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01] overflow-hidden"
            onClick={() => start(t)}
          >
            <div className={`h-24 bg-gradient-to-br ${t.gradient} relative flex items-end p-3`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background/80 rounded-full p-3 backdrop-blur">
                  <Play className="h-6 w-6 text-primary" fill="currentColor" />
                </div>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="font-medium truncate">{t.title}</p>
              <p className="text-xs text-muted-foreground">Recovery Cooler · Official</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {playing && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPlaying(null)}
        >
          <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2 text-white">
              <p className="font-semibold">{playing.title}</p>
              <Button variant="ghost" size="icon" onClick={() => setPlaying(null)} className="text-white hover:bg-white/10">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${playing.youtubeId}?autoplay=1`}
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
