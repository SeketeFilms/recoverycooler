-- Create a function to notify users about new required updates
CREATE OR REPLACE FUNCTION public.notify_required_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for required updates
  IF NEW.is_required = true THEN
    -- Use pg_net to call the edge function
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-update-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key', true)
      ),
      body := jsonb_build_object('versionId', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to fire when a new version is inserted
CREATE TRIGGER on_new_version_notify
  AFTER INSERT ON public.app_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_required_update();