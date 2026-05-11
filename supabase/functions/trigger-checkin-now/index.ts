import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const ANON = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Identify caller
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Look up caller's prefs + push subs
    const [{ data: prefs }, { data: subs }, { data: profile }] = await Promise.all([
      admin.from('notification_preferences').select('*').eq('user_id', user.id).maybeSingle(),
      admin.from('push_subscriptions').select('*').eq('user_id', user.id),
      admin.from('profiles').select('addiction_type, full_name').eq('user_id', user.id).maybeSingle(),
    ]);

    // Generate a quick motivational quote (best-effort)
    let message = 'Keep going — every clean hour counts.';
    try {
      const q = await admin.functions.invoke('generate-motivational-quote', {
        body: { addictionType: profile?.addiction_type ?? 'gambling' },
        headers: { Authorization: `Bearer ${SERVICE_ROLE}` },
      });
      if (q.data?.quote) message = q.data.quote;
    } catch (_) { /* fall through */ }

    const deviceCount = subs?.length ?? 0;
    const title = 'Recovery Cooler check-in';

    return new Response(JSON.stringify({
      success: true,
      title,
      message,
      deliveredTo: deviceCount,
      preferencesEnabled: !!(prefs?.recovery_checkins || prefs?.meditation_reminders),
      note: deviceCount === 0
        ? 'No registered push devices yet. The browser will show a local notification instead.'
        : `Would dispatch to ${deviceCount} registered device(s). Native delivery activates after FCM/APNs are configured.`,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('trigger-checkin-now error', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
