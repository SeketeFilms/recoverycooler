import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Heart, MessageCircle, Users, Award, Plus } from 'lucide-react';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';
import { format } from 'date-fns';

interface SuccessStory {
  id: string;
  user_id: string;
  title: string;
  content: string;
  addiction_type: string;
  is_anonymous: boolean;
  likes_count: number;
  created_at: string;
}

interface ForumPost {
  id: string;
  user_id: string;
  addiction_type: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  comments_count: number;
  created_at: string;
}

const Community = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [addictionType, setAddictionType] = useState('gambling');
  
  // New story state
  const [showNewStory, setShowNewStory] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [storyAnonymous, setStoryAnonymous] = useState(true);
  
  // New forum post state
  const [showNewPost, setShowNewPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postAnonymous, setPostAnonymous] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadStories();
      loadForumPosts();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('addiction_type')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (profile) {
      setAddictionType(profile.addiction_type);
    }
  };

  const loadStories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('success_stories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load success stories');
    } else {
      setStories(data || []);
    }
    setLoading(false);
  };

  const loadForumPosts = async () => {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load forum posts');
    } else {
      setForumPosts(data || []);
    }
  };

  const handleCreateStory = async () => {
    if (!user || !storyTitle.trim() || !storyContent.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const { error } = await supabase
      .from('success_stories')
      .insert({
        user_id: user.id,
        title: storyTitle,
        content: storyContent,
        addiction_type: addictionType,
        is_anonymous: storyAnonymous,
      });

    if (error) {
      toast.error('Failed to create story');
    } else {
      toast.success('Success story shared!');
      setShowNewStory(false);
      setStoryTitle('');
      setStoryContent('');
      loadStories();
    }
  };

  const handleCreatePost = async () => {
    if (!user || !postTitle.trim() || !postContent.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const { error } = await supabase
      .from('forum_posts')
      .insert({
        user_id: user.id,
        title: postTitle,
        content: postContent,
        addiction_type: addictionType,
        is_anonymous: postAnonymous,
      });

    if (error) {
      toast.error('Failed to create post');
    } else {
      toast.success('Forum post created!');
      setShowNewPost(false);
      setPostTitle('');
      setPostContent('');
      loadForumPosts();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-32">
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Community
            </h1>
            <p className="text-muted-foreground mt-2">Connect, share, and support each other</p>
          </div>
          <Users className="h-12 w-12 text-primary" />
        </div>

        <Tabs defaultValue="stories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stories">Success Stories</TabsTrigger>
            <TabsTrigger value="forum">Forum</TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="space-y-4">
            <Dialog open={showNewStory} onOpenChange={setShowNewStory}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Share Your Success Story
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Your Success Story</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Story title..."
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Share your journey and inspire others..."
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    rows={6}
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={storyAnonymous}
                      onCheckedChange={setStoryAnonymous}
                    />
                    <Label>Post anonymously</Label>
                  </div>
                  <Button onClick={handleCreateStory} className="w-full">
                    Share Story
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {loading ? (
              <p className="text-center text-muted-foreground">Loading stories...</p>
            ) : stories.length === 0 ? (
              <Card className="p-8 text-center">
                <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No success stories yet. Be the first to share!</p>
              </Card>
            ) : (
              stories.map((story) => (
                <Card key={story.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold">{story.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {story.is_anonymous ? 'Anonymous' : 'Community Member'} • {format(new Date(story.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {story.addiction_type}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{story.content}</p>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      {story.likes_count}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="forum" className="space-y-4">
            <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Forum Post
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Forum Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Post title..."
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Share your thoughts, ask questions, or seek support..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={6}
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={postAnonymous}
                      onCheckedChange={setPostAnonymous}
                    />
                    <Label>Post anonymously</Label>
                  </div>
                  <Button onClick={handleCreatePost} className="w-full">
                    Create Post
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {forumPosts.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No forum posts yet. Start a conversation!</p>
              </Card>
            ) : (
              forumPosts.map((post) => (
                <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {post.is_anonymous ? 'Anonymous' : 'Community Member'} • {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {post.addiction_type}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-4">{post.content}</p>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments_count} comments
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default Community;
