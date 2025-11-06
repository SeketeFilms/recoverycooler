-- Add addiction_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN addiction_type text NOT NULL DEFAULT 'gambling' 
CHECK (addiction_type IN ('gambling', 'alcohol'));

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.addiction_type IS 'Type of addiction the user is addressing: gambling or alcohol';