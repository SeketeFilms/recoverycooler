import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SessionLog {
  user_agent?: string;
  device_info?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const { user_agent, device_info }: SessionLog = await req.json();

    // Extract IP address from request headers
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      req.headers.get('x-real-ip') || 
                      'Unknown';

    // Get location info from IP (optional - using a free service)
    let locationInfo = 'Unknown';
    try {
      if (ipAddress !== 'Unknown') {
        const geoResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          locationInfo = `${geoData.city || 'Unknown'}, ${geoData.country_name || 'Unknown'}`;
        }
      }
    } catch (error) {
      console.log('Could not fetch location info:', error);
    }

    // Generate session ID from auth header
    const sessionId = authHeader.replace('Bearer ', '').substring(0, 16);

    // Insert session log
    const { error: insertError } = await supabase
      .from('session_logs')
      .insert({
        user_id: user.id,
        ip_address: ipAddress,
        user_agent: user_agent || 'Unknown',
        device_info: device_info || 'Unknown',
        location_info: locationInfo,
        session_id: sessionId,
      });

    if (insertError) {
      console.error('Error inserting session log:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to log session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Session logged successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in log-session-activity:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});