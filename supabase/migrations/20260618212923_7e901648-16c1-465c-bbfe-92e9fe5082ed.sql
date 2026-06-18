
ALTER TABLE public.public_journeys
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'active'
  CHECK (moderation_status IN ('active','under_review','hidden'));

DROP POLICY IF EXISTS "Anyone can view public journeys" ON public.public_journeys;

CREATE POLICY "Public can view active public journeys"
ON public.public_journeys
FOR SELECT
USING (
  (is_public = true AND moderation_status = 'active')
  OR auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Mods and admins can update any journey"
ON public.public_journeys
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
