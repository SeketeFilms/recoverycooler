
-- 1. profiles: tutorial flag
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tutorial_completed boolean NOT NULL DEFAULT false;

-- 2. meditation_sessions
CREATE TABLE IF NOT EXISTS public.meditation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  track_name text,
  duration_minutes integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meditation_sessions TO authenticated;
GRANT ALL ON public.meditation_sessions TO service_role;
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own meditation sessions"
  ON public.meditation_sessions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. self_exclusion_periods
CREATE TABLE IF NOT EXISTS public.self_exclusion_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  reason text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.self_exclusion_periods TO authenticated;
GRANT ALL ON public.self_exclusion_periods TO service_role;
ALTER TABLE public.self_exclusion_periods ENABLE ROW LEVEL SECURITY;
-- Users can create their own periods but CANNOT delete or shorten them (lockout integrity).
CREATE POLICY "Users view own exclusion periods"
  ON public.self_exclusion_periods FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users create own exclusion periods"
  ON public.self_exclusion_periods FOR INSERT
  WITH CHECK (auth.uid() = user_id);
-- Allow marking inactive only AFTER end time has passed
CREATE POLICY "Users finalize own expired exclusion periods"
  ON public.self_exclusion_periods FOR UPDATE
  USING (auth.uid() = user_id AND ends_at <= now())
  WITH CHECK (auth.uid() = user_id);

-- 4. public_journeys (public shareable profile)
CREATE TABLE IF NOT EXISTS public.public_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  nickname text,
  story text,
  is_public boolean NOT NULL DEFAULT false,
  show_avatar boolean NOT NULL DEFAULT true,
  show_streak boolean NOT NULL DEFAULT true,
  show_milestones boolean NOT NULL DEFAULT true,
  show_achievements boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS public_journeys_slug_idx ON public.public_journeys (slug);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_journeys TO authenticated;
GRANT SELECT ON public.public_journeys TO anon;
GRANT ALL ON public.public_journeys TO service_role;
ALTER TABLE public.public_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public journeys"
  ON public.public_journeys FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users manage own journey"
  ON public.public_journeys FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER public_journeys_updated_at
  BEFORE UPDATE ON public.public_journeys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. notification_preferences: spending + time reminders
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS spending_alerts boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS time_reminder_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS time_reminder_at time DEFAULT '18:00:00';
