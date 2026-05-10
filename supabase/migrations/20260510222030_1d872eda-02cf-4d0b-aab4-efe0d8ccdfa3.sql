
-- 1. App reviews: prevent leaking user_id publicly
ALTER TABLE public.app_reviews ALTER COLUMN is_anonymous SET DEFAULT true;

DROP POLICY IF EXISTS "Anyone can view reviews" ON public.app_reviews;

CREATE POLICY "Users can view their own reviews"
  ON public.app_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Public-safe view of reviews that hides user_id for anonymous reviews and
-- joins a display name from profiles. SECURITY INVOKER + barrier so the view
-- cannot be tricked into leaking via predicate pushdown.
CREATE OR REPLACE VIEW public.app_reviews_public
WITH (security_invoker = true, security_barrier = true) AS
SELECT
  r.id,
  r.rating,
  r.review_text,
  r.is_anonymous,
  r.created_at,
  CASE WHEN r.is_anonymous THEN NULL ELSE r.user_id END AS user_id,
  CASE WHEN r.is_anonymous THEN NULL ELSE COALESCE(p.username, p.full_name) END AS display_name
FROM public.app_reviews r
LEFT JOIN public.profiles p ON p.user_id = r.user_id;

GRANT SELECT ON public.app_reviews_public TO anon, authenticated;

-- Allow the view to read rows regardless of RLS by exposing through a
-- security definer function used inside the view source. Recreate the view
-- to use a function so it works for unauthenticated/other-user reads.
DROP VIEW IF EXISTS public.app_reviews_public;

CREATE OR REPLACE FUNCTION public.get_public_app_reviews()
RETURNS TABLE (
  id uuid,
  rating integer,
  review_text text,
  is_anonymous boolean,
  created_at timestamptz,
  user_id uuid,
  display_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id,
    r.rating,
    r.review_text,
    r.is_anonymous,
    r.created_at,
    CASE WHEN r.is_anonymous THEN NULL ELSE r.user_id END AS user_id,
    CASE WHEN r.is_anonymous THEN NULL ELSE COALESCE(p.username, p.full_name) END AS display_name
  FROM public.app_reviews r
  LEFT JOIN public.profiles p ON p.user_id = r.user_id
  ORDER BY r.created_at DESC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_app_reviews() TO anon, authenticated;

-- 2. Email rate limits: only allow users to insert rate limits for themselves
DROP POLICY IF EXISTS "Allow inserts for rate limiting" ON public.email_rate_limits;

CREATE POLICY "Users can insert own rate limits"
  ON public.email_rate_limits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
