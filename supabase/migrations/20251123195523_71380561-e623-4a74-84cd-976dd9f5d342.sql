-- Create table for user shortcuts preferences
CREATE TABLE public.user_shortcuts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shortcut_key TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, shortcut_key),
  UNIQUE(user_id, position)
);

-- Enable RLS
ALTER TABLE public.user_shortcuts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own shortcuts"
ON public.user_shortcuts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shortcuts"
ON public.user_shortcuts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shortcuts"
ON public.user_shortcuts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shortcuts"
ON public.user_shortcuts
FOR DELETE
USING (auth.uid() = user_id);