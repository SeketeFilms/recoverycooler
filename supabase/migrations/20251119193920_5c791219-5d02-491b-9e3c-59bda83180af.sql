-- Create session_logs table for tracking login activity
CREATE TABLE public.session_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  device_info TEXT,
  location_info TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own session logs"
ON public.session_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert session logs"
ON public.session_logs
FOR INSERT
WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX idx_session_logs_user_id ON public.session_logs(user_id);
CREATE INDEX idx_session_logs_login_time ON public.session_logs(login_time DESC);