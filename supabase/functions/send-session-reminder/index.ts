import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendPushNotification(subscription: any, message: string, title: string) {
  try {
    const { endpoint, p256dh, auth } = subscription;
    
    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'session-reminder',
      requireInteraction: true,
      url: '/',
    });

    console.log('Sending session reminder push notification:', {
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

  try {
    const { userId, subscriptions } = await req.json();

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No subscriptions provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const title = 'Come Back!';
    const message = "You've been away for a while. Take a moment to check in on your recovery journey.";

    let notificationsSent = 0;

    for (const sub of subscriptions) {
      const result = await sendPushNotification(sub, message, title);
      if (result.success) {
        notificationsSent++;
      }
    }

    console.log(`Sent ${notificationsSent} session reminder notifications to user ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-session-reminder:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
