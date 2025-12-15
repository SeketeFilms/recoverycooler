-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Service role can insert session logs" ON public.session_logs;

-- Create a proper INSERT policy that only allows authenticated users to insert their own logs
CREATE POLICY "Users can insert own session logs" 
ON public.session_logs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);