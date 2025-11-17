-- Create table for rate limiting email sends
CREATE TABLE public.email_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own rate limit logs
CREATE POLICY "Users can view own rate limits"
ON public.email_rate_limits
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Edge function can insert rate limit logs (no user context needed)
CREATE POLICY "Allow inserts for rate limiting"
ON public.email_rate_limits
FOR INSERT
WITH CHECK (true);

-- Index for efficient rate limit queries
CREATE INDEX idx_email_rate_limits_user_created 
ON public.email_rate_limits(user_id, created_at DESC);