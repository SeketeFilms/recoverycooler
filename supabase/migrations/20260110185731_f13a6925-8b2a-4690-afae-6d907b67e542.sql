-- Create app_versions table for admin-managed version updates
CREATE TABLE public.app_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version VARCHAR(20) NOT NULL UNIQUE,
  release_notes TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_current BOOLEAN NOT NULL DEFAULT false,
  minimum_supported_version VARCHAR(20),
  release_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

-- Public read access for all users (everyone needs to check for updates)
CREATE POLICY "Anyone can view app versions"
ON public.app_versions
FOR SELECT
USING (true);

-- Only admins can insert/update/delete versions
CREATE POLICY "Admins can manage app versions"
ON public.app_versions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert initial version
INSERT INTO public.app_versions (version, release_notes, is_required, is_current, minimum_supported_version)
VALUES ('1.0.0', '## Initial Release

### Features
- Recovery journey tracking with streaks
- AI-powered recovery chat support
- Community forums and success stories
- Daily journal with mood tracking
- Meditation exercises
- Accountability partners
- Spending tracker
- Crisis resources and help

### Security
- Biometric authentication
- Session tracking
- Data export capabilities', false, true, '1.0.0');