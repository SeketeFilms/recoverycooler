// Send a push via OneSignal REST API.
// Body: { userIds?: string[], externalIds?: string[], segments?: string[], title, message, url?, data? }
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const appId = Deno.env.get('ONESIGNAL_APP_ID');
    const restKey = Deno.env.get('ONESIGNAL_REST_API_KEY');
    if (!appId || !restKey) {
      return new Response(JSON.stringify({ error: 'OneSignal not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { userIds, externalIds, segments, title, message, url, data } = await req.json();
    if (!title || !message) {
      return new Response(JSON.stringify({ error: 'title and message required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload: Record<string, unknown> = {
      app_id: appId,
      headings: { en: title },
      contents: { en: message },
      chrome_web_icon: 'https://recoverycooler.lovable.app/icon-192.png',
      chrome_web_badge: 'https://recoverycooler.lovable.app/icon-96.png',
      ...(url ? { url } : {}),
      ...(data ? { data } : {}),
    };
    if (userIds?.length) payload.include_player_ids = userIds;
    else if (externalIds?.length) payload.include_external_user_ids = externalIds;
    else payload.included_segments = segments ?? ['Subscribed Users'];

    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${restKey}`,
      },
      body: JSON.stringify(payload),
    });
    const body = await res.text();
    if (!res.ok) {
      console.error(`OneSignal error [${res.status}]:`, body);
      return new Response(JSON.stringify({ error: 'OneSignal send failed', status: res.status, details: body }), {
        status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(body, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('send-onesignal-notification error:', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
