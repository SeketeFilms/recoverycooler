import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  journeyId: string;
  ownerId: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export const JourneyInteractions = ({ journeyId, ownerId }: Props) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');

  const isOwner = user?.id === ownerId;

  const load = async () => {
    const [{ count: likeCount }, likeMine, followMine, cmts] = await Promise.all([
      (supabase as any).from('journey_likes').select('id', { count: 'exact', head: true }).eq('journey_id', journeyId),
      user ? (supabase as any).from('journey_likes').select('id').eq('journey_id', journeyId).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
      user ? (supabase as any).from('journey_follows').select('id').eq('journey_id', journeyId).eq('follower_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
      (supabase as any).from('journey_comments').select('id, user_id, content, created_at').eq('journey_id', journeyId).order('created_at', { ascending: false }).limit(50),
    ]);
    setLikes(likeCount ?? 0);
    setLiked(!!(likeMine as any).data);
    setFollowing(!!(followMine as any).data);
    setComments(((cmts as any).data ?? []) as Comment[]);
  };

  useEffect(() => { load(); }, [journeyId, user]);

  const notify = async (type: 'like' | 'comment' | 'follow', message: string) => {
    if (!user || isOwner) return;
    await (supabase as any).from('notifications').insert({
      recipient_id: ownerId,
      actor_id: user.id,
      type,
      target_type: 'public_journey',
      target_id: journeyId,
      data: { message },
    });
  };

  const toggleLike = async () => {
    if (!user) { toast.error('Sign in to like'); return; }
    if (liked) {
      await (supabase as any).from('journey_likes').delete().eq('journey_id', journeyId).eq('user_id', user.id);
    } else {
      await (supabase as any).from('journey_likes').insert({ journey_id: journeyId, user_id: user.id });
      notify('like', 'Someone liked your recovery journey ❤️');
    }
    load();
  };

  const toggleFollow = async () => {
    if (!user) { toast.error('Sign in to follow'); return; }
    if (following) {
      await (supabase as any).from('journey_follows').delete().eq('journey_id', journeyId).eq('follower_id', user.id);
    } else {
      await (supabase as any).from('journey_follows').insert({ journey_id: journeyId, follower_id: user.id });
      notify('follow', 'Someone started following your journey 👥');
    }
    load();
  };

  const postComment = async () => {
    if (!user) { toast.error('Sign in to comment'); return; }
    if (text.trim().length === 0) return;
    const { error } = await (supabase as any).from('journey_comments').insert({
      journey_id: journeyId, user_id: user.id, content: text.trim(),
    });
    if (error) { toast.error(error.message); return; }
    setText('');
    notify('comment', `New comment: "${text.trim().slice(0, 60)}"`);
    load();
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant={liked ? 'default' : 'outline'} size="sm" onClick={toggleLike}>
            <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} /> {likes}
          </Button>
          {!isOwner && (
            <Button variant={following ? 'secondary' : 'outline'} size="sm" onClick={toggleFollow}>
              {following ? <UserMinus className="h-4 w-4 mr-1" /> : <UserPlus className="h-4 w-4 mr-1" />}
              {following ? 'Following' : 'Follow'}
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
            <MessageCircle className="h-3 w-3" /> {comments.length}
          </span>
        </div>

        {user ? (
          <div className="space-y-2">
            <Textarea placeholder="Leave an encouraging comment..." value={text} onChange={e => setText(e.target.value)} rows={2} />
            <Button size="sm" onClick={postComment} disabled={!text.trim()}>Post</Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground"><Link to="/auth" className="text-primary underline">Sign in</Link> to like, follow, or comment.</p>
        )}

        <div className="space-y-2">
          {comments.map(c => (
            <div key={c.id} className="border rounded-md p-2 text-sm">
              <p className="whitespace-pre-wrap">{c.content}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
