import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch relapse logs
    const { data: logs, error: logsError } = await supabase
      .from('relapse_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('relapse_date', { ascending: false })
      .limit(50);

    if (logsError) throw logsError;

    if (!logs || logs.length === 0) {
      return new Response(JSON.stringify({
        insights: "You haven't logged any setbacks yet. Keep tracking your journey — if a setback happens, logging it here will help me provide personalized insights and coping strategies."
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch user profile for addiction type
    const { data: profile } = await supabase
      .from('profiles')
      .select('addiction_type')
      .eq('user_id', user.id)
      .maybeSingle();

    const addictionType = profile?.addiction_type || 'gambling';

    // Build summary for AI
    const allTriggers = logs.flatMap(l => l.triggers || []);
    const triggerCounts: Record<string, number> = {};
    allTriggers.forEach(t => { triggerCounts[t] = (triggerCounts[t] || 0) + 1; });

    const avgSeverity = (logs.reduce((s, l) => s + l.severity, 0) / logs.length).toFixed(1);
    const avgMoodBefore = logs.filter(l => l.mood_before).length > 0
      ? (logs.reduce((s, l) => s + (l.mood_before || 0), 0) / logs.filter(l => l.mood_before).length).toFixed(1)
      : 'N/A';
    const avgMoodAfter = logs.filter(l => l.mood_after).length > 0
      ? (logs.reduce((s, l) => s + (l.mood_after || 0), 0) / logs.filter(l => l.mood_after).length).toFixed(1)
      : 'N/A';

    const lessonsLogged = logs.filter(l => l.lessons_learned).map(l => l.lessons_learned).slice(0, 10);

    const prompt = `Analyze this person's ${addictionType} recovery setback data and provide personalized insights and coping strategies.

DATA SUMMARY:
- Total setbacks logged: ${logs.length}
- Average severity: ${avgSeverity}/10
- Average mood before setback: ${avgMoodBefore}/10
- Average mood after setback: ${avgMoodAfter}/10
- Top triggers: ${Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t, c]) => `${t} (${c}x)`).join(', ') || 'None logged'}
- Recent lessons learned: ${lessonsLogged.join('; ') || 'None logged'}
- Most recent setback: ${logs[0].relapse_date}

Provide:
1. **Pattern Analysis**: Key patterns you see in their triggers, timing, and mood changes
2. **Top Coping Strategies**: 3-4 specific, actionable strategies tailored to their most common triggers
3. **Encouragement**: A brief motivational note acknowledging their self-awareness in tracking

Keep it concise, warm, and actionable. Use markdown formatting.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a compassionate recovery coach specializing in addiction recovery insights. Provide warm, non-judgmental, evidence-based advice.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices?.[0]?.message?.content || 'Unable to generate insights at this time.';

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in analyze-relapse-patterns:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      insights: "I'm having trouble analyzing your data right now. Please try again shortly."
    }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
