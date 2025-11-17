import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication with anon key first
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication failed:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Starting account deletion for user: ${user.id}`);

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Delete user data in order (due to foreign key constraints)
    console.log("Deleting spending logs...");
    const { error: logsError } = await supabaseAdmin
      .from('spending_logs')
      .delete()
      .eq('user_id', user.id);

    if (logsError) {
      console.error("Error deleting spending logs:", logsError);
      throw new Error("Failed to delete spending logs");
    }

    console.log("Deleting spending limits...");
    const { error: limitsError } = await supabaseAdmin
      .from('spending_limits')
      .delete()
      .eq('user_id', user.id);

    if (limitsError) {
      console.error("Error deleting spending limits:", limitsError);
      throw new Error("Failed to delete spending limits");
    }

    console.log("Deleting self-exclusion domains...");
    const { error: domainsError } = await supabaseAdmin
      .from('self_exclusion_domains')
      .delete()
      .eq('user_id', user.id);

    if (domainsError) {
      console.error("Error deleting exclusion domains:", domainsError);
      throw new Error("Failed to delete exclusion domains");
    }

    console.log("Deleting email rate limits...");
    const { error: rateLimitsError } = await supabaseAdmin
      .from('email_rate_limits')
      .delete()
      .eq('user_id', user.id);

    if (rateLimitsError) {
      console.error("Error deleting rate limits:", rateLimitsError);
      // Non-critical, continue
    }

    // Delete avatar from storage if exists
    console.log("Checking for avatar...");
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('avatar_url')
      .eq('user_id', user.id)
      .single();

    if (profile?.avatar_url) {
      console.log("Deleting avatar from storage...");
      const avatarPath = profile.avatar_url.split('/').pop();
      if (avatarPath) {
        const { error: storageError } = await supabaseAdmin
          .storage
          .from('avatars')
          .remove([`${user.id}/${avatarPath}`]);

        if (storageError) {
          console.error("Error deleting avatar:", storageError);
          // Non-critical, continue
        }
      }
    }

    console.log("Deleting profile...");
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', user.id);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
      throw new Error("Failed to delete profile");
    }

    // Finally, delete the auth user (this is the critical step that was missing)
    console.log("Deleting auth user...");
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError);
      throw new Error("Failed to delete authentication account");
    }

    console.log(`Account deletion completed successfully for user: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in delete-account function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to delete account" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
