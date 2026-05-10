import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// VAPID keys are loaded from environment secrets. Push delivery is skipped
// if they are not configured.
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';

async function sendPushNotification(subscription: any, message: string, title: string) {
  try {
    const { endpoint, p256dh, auth } = subscription;
    
    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'scheduled-reminder',
    });

    // Note: In a real implementation, you would use web-push library
    // For now, this is a placeholder that logs the notification
    console.log('Sending push notification:', {
      endpoint,
      title,
      message,
    });

    // TODO: Implement actual push notification sending using web-push
    // This requires the web-push library or manual implementation of the Web Push Protocol
    
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Internal cron-only endpoint: require the service role key
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!SERVICE_ROLE_KEY || authHeader !== `Bearer ${SERVICE_ROLE_KEY}`) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized - internal service only' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      SERVICE_ROLE_KEY
    );

    // Get current hour in UTC
    const now = new Date();
    const currentHourUTC = now.getUTCHours();
    
    console.log('Running scheduled notifications check at UTC hour:', currentHourUTC);

    // Get all users with their profiles and notification preferences
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, country, addiction_type');

    if (profilesError) {
      throw profilesError;
    }

    const { data: preferences, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('user_id, meditation_reminders, recovery_checkins');

    if (prefsError) {
      throw prefsError;
    }

    // Create a map of user preferences
    const userPrefs = new Map(
      preferences?.map(p => [p.user_id, p]) || []
    );

    // Get all push subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (subsError) {
      throw subsError;
    }

    // Create a map of user subscriptions
    const userSubscriptions = new Map();
    subscriptions?.forEach(sub => {
      if (!userSubscriptions.has(sub.user_id)) {
        userSubscriptions.set(sub.user_id, []);
      }
      userSubscriptions.get(sub.user_id).push(sub);
    });

    let notificationsSent = 0;

    // Process each user
    for (const profile of profiles || []) {
      const prefs = userPrefs.get(profile.user_id);
      const subs = userSubscriptions.get(profile.user_id);

      if (!subs || subs.length === 0) {
        continue; // No subscriptions for this user
      }

      // Check if user wants notifications
      if (!prefs?.meditation_reminders && !prefs?.recovery_checkins) {
        continue;
      }

      // Simple timezone offset mapping (country to UTC offset)
      // In a real app, use a proper timezone library
      const timezoneOffsets: Record<string, number> = {
        'US': -5, // EST
        'GB': 0,  // GMT
        'DE': 1,  // CET
        'JP': 9,  // JST
        'AU': 10, // AEST
        // Add more as needed
      };

      const offset = timezoneOffsets[profile.country || 'US'] || -5;
      const localHour = (currentHourUTC + offset + 24) % 24;

      // Check if it's time to send notifications (8 AM or 6:30 PM local time)
      const shouldSendMorning = localHour === 8 && prefs?.meditation_reminders;
      const shouldSendEvening = localHour === 18 && prefs?.recovery_checkins;

      if (!shouldSendMorning && !shouldSendEvening) {
        continue;
      }

      // Generate or use default message
      let message = 'Remember to take a deep breath';
      let title = shouldSendMorning ? 'Morning Reminder' : 'Evening Check-in';

      // Try to generate AI quote (50% of the time)
      if (Math.random() > 0.5) {
        try {
          const quoteResponse = await supabase.functions.invoke('generate-motivational-quote', {
            body: { addictionType: profile.addiction_type }
          });

          if (quoteResponse.data?.quote) {
            message = quoteResponse.data.quote;
          }
        } catch (error) {
          console.error('Error generating quote:', error);
        }
      }

      // Send notification to all user's subscriptions
      for (const sub of subs) {
        await sendPushNotification(sub, message, title);
        notificationsSent++;
      }
    }

    console.log(`Sent ${notificationsSent} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent,
        timestamp: now.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-scheduled-notifications:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
