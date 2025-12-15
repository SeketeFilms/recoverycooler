import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "invite" | "accepted" | "checkin_reminder";
  recipientEmail: string;
  recipientName?: string;
  senderName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { type, recipientEmail, recipientName, senderName }: NotificationRequest = await req.json();

    console.log(`Sending partner notification: ${type} to ${recipientEmail}`);

    let subject = "";
    let html = "";
    const appName = "RecoveryCooler";

    switch (type) {
      case "invite":
        subject = `${senderName || "Someone"} wants to be your accountability partner`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed;">Accountability Partner Invitation</h1>
            <p>Hi${recipientName ? ` ${recipientName}` : ""},</p>
            <p><strong>${senderName || "A user"}</strong> has invited you to be their accountability partner on ${appName}.</p>
            <p>Accountability partners support each other through recovery, celebrating wins and providing encouragement during challenging moments.</p>
            <p style="margin-top: 20px;">Log in to your account to accept or decline this invitation.</p>
            <p style="color: #666; font-size: 12px; margin-top: 40px;">
              This email was sent from ${appName}. If you didn't expect this, you can safely ignore it.
            </p>
          </div>
        `;
        break;
      case "accepted":
        subject = `${recipientName || "Your partner"} accepted your partnership request!`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed;">🎉 Partnership Accepted!</h1>
            <p>Great news!</p>
            <p><strong>${recipientName || "Your partner"}</strong> has accepted your accountability partner request on ${appName}.</p>
            <p>You can now support each other on your recovery journeys. Check in regularly and celebrate each other's progress!</p>
            <p style="color: #666; font-size: 12px; margin-top: 40px;">
              This email was sent from ${appName}.
            </p>
          </div>
        `;
        break;
      case "checkin_reminder":
        subject = "Time to check in with your accountability partner";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed;">Partner Check-in Reminder</h1>
            <p>Hi${recipientName ? ` ${recipientName}` : ""},</p>
            <p>It's been a while since you checked in with your accountability partner. Taking a moment to connect can make a big difference in both of your recovery journeys.</p>
            <p>Consider reaching out to share your progress, celebrate wins, or simply let them know you're thinking of them.</p>
            <p style="margin-top: 20px;">Log in to ${appName} to see your partner's progress.</p>
            <p style="color: #666; font-size: 12px; margin-top: 40px;">
              This email was sent from ${appName}.
            </p>
          </div>
        `;
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid notification type" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "RecoveryCooler <info@se-mo.site>",
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    const emailResponse = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Partner notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-partner-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
