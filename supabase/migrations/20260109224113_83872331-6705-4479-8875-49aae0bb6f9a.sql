-- Add DELETE policy for accountability_partners table
-- Allows either party (user_id or partner_user_id) to delete the partnership

CREATE POLICY "Users can delete their partnerships"
ON public.accountability_partners
FOR DELETE
USING (
  (auth.uid() = user_id) OR 
  (auth.uid() = partner_user_id)
);