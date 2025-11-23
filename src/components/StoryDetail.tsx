import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Heart, MessageCircle, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
}

interface Story {
  id: string;
  user_id: string;
  title: string;
  content: string;
  addiction_type: string;
  is_anonymous: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface StoryDetailProps {
  story: Story;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const StoryDetail = ({ story, open, onOpenChange, onUpdate }: StoryDetailProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [deleteStoryDialog, setDeleteStoryDialog] = useState(false);

  useEffect(() => {
    if (open && story) {
      loadComments();
    }
  }, [open, story]);

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('success_story_comments')
      .select('*')
      .eq('story_id', story.id)
      .order('created_at', { ascending: true });
    
    if (error) {
      toast.error('Failed to load comments');
    } else {
      setComments(data || []);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('success_story_comments')
      .insert({
        story_id: story.id,
        user_id: user.id,
        content: newComment,
        is_anonymous: commentAnonymous,
      });

    if (error) {
      toast.error('Failed to add comment');
    } else {
      // Update comments count
      await supabase
        .from('success_stories')
        .update({ comments_count: story.comments_count + 1 })
        .eq('id', story.id);

      toast.success('Comment added!');
      setNewComment('');
      setCommentAnonymous(false);
      loadComments();
      onUpdate();
    }
    setLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('success_story_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      toast.error('Failed to delete comment');
    } else {
      await supabase
        .from('success_stories')
        .update({ comments_count: Math.max(0, story.comments_count - 1) })
        .eq('id', story.id);

      toast.success('Comment deleted');
      setDeleteCommentId(null);
      loadComments();
      onUpdate();
    }
  };

  const handleDeleteStory = async () => {
    const { error } = await supabase
      .from('success_stories')
      .delete()
      .eq('id', story.id);

    if (error) {
      toast.error('Failed to delete story');
    } else {
      toast.success('Story deleted');
      setDeleteStoryDialog(false);
      onOpenChange(false);
      onUpdate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle>{story.title}</DialogTitle>
            {user?.id === story.user_id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteStoryDialog(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card className="p-6 bg-muted/50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {story.is_anonymous ? 'Anonymous' : 'Community Member'} • {format(new Date(story.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {story.addiction_type}
              </span>
            </div>
            <p className="text-foreground whitespace-pre-wrap">{story.content}</p>
            <div className="flex items-center gap-4 mt-4">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4 mr-1" />
                {story.likes_count}
              </Button>
              <div className="flex items-center text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4 mr-1" />
                {story.comments_count} comments
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Comments</h3>
            
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <Card key={comment.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-muted-foreground">
                        {comment.is_anonymous ? 'Anonymous' : 'Community Member'} • {format(new Date(comment.created_at), 'MMM d, yyyy')}
                      </p>
                      {user?.id === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteCommentId(comment.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-foreground">{comment.content}</p>
                  </Card>
                ))}
              </div>
            )}

            <Card className="p-4 bg-muted/50">
              <div className="space-y-3">
                <Textarea
                  placeholder="Write your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={commentAnonymous}
                      onCheckedChange={setCommentAnonymous}
                    />
                    <Label>Comment anonymously</Label>
                  </div>
                  <Button onClick={handleAddComment} disabled={loading}>
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCommentId && handleDeleteComment(deleteCommentId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteStoryDialog} onOpenChange={setDeleteStoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Success Story</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this success story? This action cannot be undone and will also delete all comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default StoryDetail;
