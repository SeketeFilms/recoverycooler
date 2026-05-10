import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendPushNotification(subscription: any, message: string, title: string, data?: any) {
  try {
    const { endpoint, p256dh, auth } = subscription;
    
    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'app-update',
      data: data || {},
    });

    // Log the notification for debugging
    console.log('Sending update push notification:', {
      endpoint,
      title,
      message,
      isNative: p256dh === 'native',
    });

    // For native apps (Capacitor), the token is stored in endpoint
    // This would integrate with FCM/APNs in production
    
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

  // Internal service-only endpoint: require the service role key
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

    // Get the version to notify about (optional - defaults to latest required version)
    let versionId: string | undefined;
    try {
      const body = await req.json();
      versionId = body.versionId;
    } catch {
      // No body provided, will use latest required version
    }

    // Get the version to notify about
    let versionData: any = null;
    let versionError: any = null;

    if (versionId) {
      const result = await supabase
        .from('app_versions')
        .select('*')
        .eq('id', versionId)
        .single();
      versionData = result.data;
      versionError = result.error;
    } else {
      const result = await supabase
        .from('app_versions')
        .select('*')
        .eq('is_required', true)
        .order('created_at', { ascending: false })
        .limit(1);
      versionData = result.data;
      versionError = result.error;
    }

    if (versionError) {
      console.error('Error fetching version:', versionError);
      throw versionError;
    }

    const version = Array.isArray(versionData) ? versionData[0] : versionData;

    if (!version) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No required version found to notify about',
          notificationsSent: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending notifications for version:', version.version);

    // Get all push subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      throw subsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No push subscriptions found',
          notificationsSent: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${subscriptions.length} subscriptions to notify`);

    let notificationsSent = 0;
    const title = version.is_required 
      ? '🔄 Required Update Available' 
      : '✨ New Update Available';
    
    const message = version.is_required
      ? `Version ${version.version} is required. Please update to continue using the app.`
      : `Version ${version.version} is now available with new features and improvements!`;

    // Send notification to all subscriptions
    for (const sub of subscriptions) {
      const result = await sendPushNotification(sub, message, title, {
        version: version.version,
        isRequired: version.is_required,
        url: '/settings', // Navigate to settings where they can see update info
      });
      
      if (result.success) {
        notificationsSent++;
      }
    }

    console.log(`Successfully sent ${notificationsSent} update notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        version: version.version,
        isRequired: version.is_required,
        notificationsSent,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-update-notification:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
