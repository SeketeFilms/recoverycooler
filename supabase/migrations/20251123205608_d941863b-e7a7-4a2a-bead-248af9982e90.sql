-- Create success_story_comments table
CREATE TABLE public.success_story_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.success_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.success_story_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for success_story_comments
CREATE POLICY "Anyone can view comments"
  ON public.success_story_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.success_story_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.success_story_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.success_story_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments_count column to success_stories
ALTER TABLE public.success_stories
ADD COLUMN comments_count INTEGER NOT NULL DEFAULT 0;