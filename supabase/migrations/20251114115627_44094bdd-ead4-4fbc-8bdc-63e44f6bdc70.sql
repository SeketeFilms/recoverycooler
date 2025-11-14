-- Add DELETE policy for profiles to support account deletion feature
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Remove redundant SELECT policy for spending_limits (already covered by ALL policy)
DROP POLICY IF EXISTS "Users can view own spending limits" ON public.spending_limits;

-- Remove redundant SELECT policy for self_exclusion_domains (already covered by ALL policy)
DROP POLICY IF EXISTS "Users can view own exclusion domains" ON public.self_exclusion_domains;

-- Note: Not adding UPDATE policy to spending_logs intentionally
-- Spending logs should be immutable for audit trail integrity in a recovery app
-- Users can only INSERT new logs and DELETE existing ones