import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback version info if database is unavailable
const FALLBACK_VERSION = '1.0.0';
const FALLBACK_RELEASE_NOTES = 'Initial release with core recovery features.';

const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentVersion } = await req.json();
    
    if (!currentVersion) {
      return new Response(
        JSON.stringify({ error: 'Current version is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking version for client version:', currentVersion);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the current version from database
    const { data: currentVersionData, error: currentError } = await supabase
      .from('app_versions')
      .select('*')
      .eq('is_current', true)
      .single();

    if (currentError || !currentVersionData) {
      console.log('No current version found in database, using fallback:', currentError?.message);
      
      const hasUpdate = compareVersions(FALLBACK_VERSION, currentVersion) > 0;
      
      return new Response(
        JSON.stringify({
          version: FALLBACK_VERSION,
          releaseNotes: FALLBACK_RELEASE_NOTES,
          isRequired: false,
          minimumVersion: FALLBACK_VERSION,
          releaseDate: new Date().toISOString(),
          hasUpdate,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log('Found current version:', currentVersionData.version);

    const minimumVersion = currentVersionData.minimum_supported_version || currentVersionData.version;
    const isBelowMinimum = compareVersions(currentVersion, minimumVersion) < 0;
    const hasUpdate = compareVersions(currentVersionData.version, currentVersion) > 0;

    return new Response(
      JSON.stringify({
        version: currentVersionData.version,
        releaseNotes: currentVersionData.release_notes,
        isRequired: currentVersionData.is_required || isBelowMinimum,
        minimumVersion: minimumVersion,
        releaseDate: currentVersionData.release_date,
        hasUpdate,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error checking app version:', error);
    
    return new Response(
      JSON.stringify({
        version: FALLBACK_VERSION,
        releaseNotes: FALLBACK_RELEASE_NOTES,
        isRequired: false,
        minimumVersion: FALLBACK_VERSION,
        releaseDate: new Date().toISOString(),
        hasUpdate: false,
        error: 'Failed to check version',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
