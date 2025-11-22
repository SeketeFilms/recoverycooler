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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
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

    // Check for users who need reminders (30 minutes inactive)
    const THIRTY_MINUTES = 30 * 60 * 1000;
    
    for (const [userId, session] of activeSessions.entries()) {
      const timeSinceActivity = now - session.lastActivity;
      
      if (timeSinceActivity >= THIRTY_MINUTES && !session.reminderSent) {
        // Send reminder
        console.log(`Sending reminder to user ${userId} after ${timeSinceActivity / 1000 / 60} minutes`);
        
        try {
          // Get user's push subscriptions
          const { data: subscriptions } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', userId);

          if (subscriptions && subscriptions.length > 0) {
            // Call function to send push notification
            await supabase.functions.invoke('send-session-reminder', {
              body: { userId, subscriptions }
            });
            
            session.reminderSent = true;
          }
        } catch (error) {
          console.error('Error sending session reminder:', error);
        }
      }
    }

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
