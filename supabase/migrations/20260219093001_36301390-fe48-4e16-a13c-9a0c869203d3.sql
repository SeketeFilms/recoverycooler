
-- Create relapse_logs table for tracking setbacks
CREATE TABLE public.relapse_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  relapse_date DATE NOT NULL DEFAULT CURRENT_DATE,
  severity INTEGER NOT NULL DEFAULT 5,
  triggers TEXT[] DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  lessons_learned TEXT DEFAULT NULL,
  mood_before INTEGER DEFAULT NULL,
  mood_after INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.relapse_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own relapse logs"
ON public.relapse_logs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy for user_achievements (needed for reset)
CREATE POLICY "Users can delete own achievements"
ON public.user_achievements
FOR DELETE
USING (auth.uid() = user_id);
