-- Create progress tracking table
CREATE TABLE public.progress_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clean_since DATE NOT NULL DEFAULT CURRENT_DATE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_check_ins INTEGER NOT NULL DEFAULT 0,
  last_check_in TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL, -- 'streak_days', 'journal_entries', 'check_ins'
  requirement_value INTEGER NOT NULL,
  badge_color TEXT NOT NULL DEFAULT 'primary',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create journal entries table
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood INTEGER CHECK (mood >= 1 AND mood <= 10),
  triggers TEXT[],
  coping_strategies_used TEXT[],
  gratitude TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crisis resources table
CREATE TABLE public.crisis_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  addiction_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'breathing', 'distraction', 'emergency', 'grounding'
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for progress_tracking
CREATE POLICY "Users can view own progress"
  ON public.progress_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.progress_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.progress_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for achievements (everyone can view)
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for journal_entries
CREATE POLICY "Users can view own journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for crisis_resources (everyone can view)
CREATE POLICY "Anyone can view crisis resources"
  ON public.crisis_resources FOR SELECT
  USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_progress_tracking_updated_at
  BEFORE UPDATE ON public.progress_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, requirement_type, requirement_value, badge_color) VALUES
  ('First Step', 'Started your recovery journey', 'Footprints', 'streak_days', 1, 'primary'),
  ('One Week Strong', 'Maintained 7 days clean', 'Calendar', 'streak_days', 7, 'secondary'),
  ('Monthly Milestone', '30 days of recovery', 'Trophy', 'streak_days', 30, 'accent'),
  ('Quarter Champion', '90 days clean - incredible!', 'Award', 'streak_days', 90, 'primary'),
  ('Half Year Hero', '180 days of strength', 'Medal', 'streak_days', 180, 'secondary'),
  ('One Year Warrior', '365 days - you are amazing!', 'Crown', 'streak_days', 365, 'accent'),
  ('Journal Starter', 'Created your first journal entry', 'BookOpen', 'journal_entries', 1, 'primary'),
  ('Reflection Master', '30 journal entries completed', 'Book', 'journal_entries', 30, 'secondary'),
  ('Check-in Champion', 'Completed 50 daily check-ins', 'CheckCircle', 'check_ins', 50, 'accent');

-- Insert default crisis resources for different addiction types
INSERT INTO public.crisis_resources (addiction_type, title, description, resource_type, content) VALUES
  ('gambling', '4-7-8 Breathing', 'Calm your mind in moments of urge', 'breathing', '{"steps": ["Breathe in for 4 seconds", "Hold for 7 seconds", "Exhale for 8 seconds", "Repeat 4 times"], "duration": "2 minutes"}'),
  ('gambling', 'HALT Check', 'Are you Hungry, Angry, Lonely, or Tired?', 'grounding', '{"steps": ["Check if you''re hungry - eat something healthy", "Check if you''re angry - journal about it", "Check if you''re lonely - call a friend", "Check if you''re tired - rest or nap"], "purpose": "Address basic needs before urges"}'),
  ('gambling', 'National Gambling Helpline', '24/7 support available', 'emergency', '{"phone": "1-800-522-4700", "text": "Text GAMBLER to 53342", "available": "24/7"}'),
  ('pornography', 'Box Breathing', 'Navy SEAL technique for instant calm', 'breathing', '{"steps": ["Breathe in for 4 seconds", "Hold for 4 seconds", "Exhale for 4 seconds", "Hold for 4 seconds", "Repeat 5 times"], "duration": "2 minutes"}'),
  ('pornography', '5-4-3-2-1 Grounding', 'Connect with your present moment', 'grounding', '{"steps": ["Name 5 things you can see", "Name 4 things you can touch", "Name 3 things you can hear", "Name 2 things you can smell", "Name 1 thing you can taste"], "purpose": "Interrupt urge cycle"}'),
  ('pornography', 'SAMHSA Helpline', 'Confidential mental health support', 'emergency', '{"phone": "1-800-662-4357", "available": "24/7", "languages": "English and Spanish"}'),
  ('alcohol', 'Progressive Muscle Relaxation', 'Release tension and cravings', 'breathing', '{"steps": ["Tense your fists for 5 seconds, release", "Tense your arms for 5 seconds, release", "Tense your shoulders for 5 seconds, release", "Continue down your body"], "duration": "5 minutes"}'),
  ('alcohol', 'Urge Surfing', 'Ride the wave of your craving', 'grounding', '{"steps": ["Notice the urge without judging", "Observe where you feel it in your body", "Breathe and watch it rise and fall", "Remember: urges peak and pass in 20-30 minutes"], "purpose": "Let urges pass naturally"}'),
  ('alcohol', 'AA 24-Hour Helpline', 'Speak with someone who understands', 'emergency', '{"phone": "1-800-839-1686", "available": "24/7", "description": "Alcoholics Anonymous support"}')