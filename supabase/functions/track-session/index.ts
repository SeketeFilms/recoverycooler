import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory session tracking (resets when function restarts)
const activeSessions = new Map<string, { lastActivity: number, reminderSent: boolean }>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
    if (userError || !user) {
      console.error('Error fetching user in track-session:', userError);
      throw new Error('Unauthorized');
    }

    const { activity } = await req.json();
    const now = Date.now();

    if (activity === 'active') {
      // User is active, update their session
      activeSessions.set(user.id, {
        lastActivity: now,
        reminderSent: false,
      });

      console.log(`User ${user.id} is active`);
    } else if (activity === 'inactive') {
      // User went inactive, start tracking for reminder
      const session = activeSessions.get(user.id);
      if (session) {
        session.lastActivity = now;
        session.reminderSent = false;
      } else {
        activeSessions.set(user.id, {
          lastActivity: now,
          reminderSent: false,
        });
      }

      console.log(`User ${user.id} went inactive`);
    }

    // Note: Push notifications are now handled by PushAlert
    // The session reminder logic has been removed

    return new Response(
      JSON.stringify({ success: true, timestamp: now }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-session:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
