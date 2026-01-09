import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// App version configuration - update these values when releasing new versions
const LATEST_VERSION = "1.0.0";
const RELEASE_NOTES = "Initial release with recovery tracking, community support, and AI chat features.";
const IS_REQUIRED = false; // Set to true for critical security updates
const RELEASE_DATE = "2025-01-09";

// Minimum supported version - versions below this MUST update
const MINIMUM_SUPPORTED_VERSION = "1.0.0";

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
  // Handle CORS preflight
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

    // Check if current version is below minimum supported
    const isBelowMinimum = compareVersions(currentVersion, MINIMUM_SUPPORTED_VERSION) < 0;
    const hasUpdate = compareVersions(LATEST_VERSION, currentVersion) > 0;

    return new Response(
      JSON.stringify({
        version: LATEST_VERSION,
        releaseNotes: RELEASE_NOTES,
        isRequired: IS_REQUIRED || isBelowMinimum,
        releaseDate: RELEASE_DATE,
        hasUpdate,
        minimumVersion: MINIMUM_SUPPORTED_VERSION,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking app version:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check app version' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
