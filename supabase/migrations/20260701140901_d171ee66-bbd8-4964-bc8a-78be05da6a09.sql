
-- 1. Moderation audit log
CREATE TABLE public.moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid REFERENCES public.public_journeys(id) ON DELETE CASCADE,
  report_id uuid REFERENCES public.content_reports(id) ON DELETE SET NULL,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('report','under_review','hidden','dismissed','reviewed','restored','appeal_approved','appeal_denied')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.moderation_actions TO authenticated;
GRANT ALL ON public.moderation_actions TO service_role;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mods view actions" ON public.moderation_actions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'));
CREATE POLICY "Mods insert actions" ON public.moderation_actions FOR INSERT TO authenticated
  WITH CHECK ((public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator')) AND admin_id = auth.uid());
CREATE INDEX idx_mod_actions_journey ON public.moderation_actions(journey_id, created_at DESC);

-- 2. Journey appeals
CREATE TABLE public.journey_appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.public_journeys(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied')),
  decision_notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.journey_appeals TO authenticated;
GRANT ALL ON public.journey_appeals TO service_role;
ALTER TABLE public.journey_appeals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own appeals" ON public.journey_appeals FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'));
CREATE POLICY "Users create own appeals" ON public.journey_appeals FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Mods update appeals" ON public.journey_appeals FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'));
CREATE TRIGGER trg_appeals_updated BEFORE UPDATE ON public.journey_appeals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Journey likes
CREATE TABLE public.journey_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.public_journeys(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (journey_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.journey_likes TO authenticated;
GRANT SELECT ON public.journey_likes TO anon;
GRANT ALL ON public.journey_likes TO service_role;
ALTER TABLE public.journey_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read likes" ON public.journey_likes FOR SELECT USING (true);
CREATE POLICY "Auth like" ON public.journey_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Unlike own" ON public.journey_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 4. Journey comments
CREATE TABLE public.journey_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.public_journeys(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journey_comments TO authenticated;
GRANT SELECT ON public.journey_comments TO anon;
GRANT ALL ON public.journey_comments TO service_role;
ALTER TABLE public.journey_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comments" ON public.journey_comments FOR SELECT USING (true);
CREATE POLICY "Auth comment" ON public.journey_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Edit own comment" ON public.journey_comments FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Delete own comment" ON public.journey_comments FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'));
CREATE TRIGGER trg_comments_updated BEFORE UPDATE ON public.journey_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Journey follows
CREATE TABLE public.journey_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.public_journeys(id) ON DELETE CASCADE,
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (journey_id, follower_id)
);
GRANT SELECT, INSERT, DELETE ON public.journey_follows TO authenticated;
GRANT ALL ON public.journey_follows TO service_role;
ALTER TABLE public.journey_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "See own or as owner" ON public.journey_follows FOR SELECT TO authenticated
  USING (follower_id = auth.uid() OR EXISTS (SELECT 1 FROM public.public_journeys j WHERE j.id = journey_id AND j.user_id = auth.uid()));
CREATE POLICY "Follow" ON public.journey_follows FOR INSERT TO authenticated WITH CHECK (follower_id = auth.uid());
CREATE POLICY "Unfollow" ON public.journey_follows FOR DELETE TO authenticated USING (follower_id = auth.uid());

-- 6. Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('like','comment','follow','appeal_update','moderation')),
  target_type text,
  target_id uuid,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recipient reads" ON public.notifications FOR SELECT TO authenticated USING (recipient_id = auth.uid());
CREATE POLICY "Authed insert" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);
CREATE POLICY "Recipient marks read" ON public.notifications FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id, created_at DESC);

-- 7. Admin role management: allow admins to grant/revoke roles
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
