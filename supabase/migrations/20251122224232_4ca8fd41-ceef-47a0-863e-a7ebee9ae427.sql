-- Drop the old check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_addiction_type_check;

-- Add new check constraint that includes pornography
ALTER TABLE profiles ADD CONSTRAINT profiles_addiction_type_check 
  CHECK (addiction_type IN ('gambling', 'alcohol', 'pornography'));