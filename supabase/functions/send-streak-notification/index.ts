import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StreakNotificationRequest {
  milestone: number;
  achievementName?: string;
}

const milestoneMessages: Record<number, { emoji: string; message: string }> = {
  7: { emoji: "🌟", message: "One week strong! You're building momentum." },
  14: { emoji: "💪", message: "Two weeks of dedication! Keep pushing forward." },
  30: { emoji: "🏆", message: "A full month! This is a major achievement." },
  60: { emoji: "🔥", message: "Two months! Your commitment is inspiring." },
  90: { emoji: "🎯", message: "90 days! You're in the top tier of recovery." },
  180: { emoji: "⭐", message: "Six months! Half a year of strength." },
  365: { emoji: "👑", message: "ONE YEAR! An incredible milestone!" },
};

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

    const { milestone, achievementName }: StreakNotificationRequest = await req.json();

    console.log(`Sending streak notification for milestone ${milestone} to ${user.email}`);

    // Get user profile for personalization
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single();

    const userName = profile?.full_name || "there";
    const milestoneInfo = milestoneMessages[milestone] || { 
      emoji: "🎉", 
      message: `${milestone} days of progress!` 
    };

    const subject = `${milestoneInfo.emoji} Congratulations on ${milestone} days!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 30px 0;">
          <span style="font-size: 64px;">${milestoneInfo.emoji}</span>
        </div>
        <h1 style="color: #7c3aed; text-align: center;">Milestone Achieved!</h1>
        <p style="text-align: center; font-size: 18px;">Hi ${userName},</p>
        <div style="background: linear-gradient(135deg, #7c3aed20, #ec489920); padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
          <p style="font-size: 48px; font-weight: bold; color: #7c3aed; margin: 0;">${milestone} Days</p>
          <p style="color: #666; margin-top: 10px;">${milestoneInfo.message}</p>
        </div>
        ${achievementName ? `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; color: #666;">🏆 Achievement Unlocked:</p>
            <p style="font-size: 18px; font-weight: bold; color: #7c3aed; margin: 10px 0 0 0;">${achievementName}</p>
          </div>
        ` : ''}
        <p style="text-align: center;">Every day you stay committed is a victory. Keep going – you're doing amazing!</p>
        <p style="color: #666; font-size: 12px; margin-top: 40px; text-align: center;">
          This email was sent from RecoveryCooler to celebrate your progress.
        </p>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "RecoveryCooler <info@se-mo.site>",
        to: [user.email],
        subject,
        html,
      }),
    });

    const emailResponse = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Streak notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-streak-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
