import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { addictionType = 'gambling' } = await req.json().catch(() => ({}));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: 'You are a compassionate recovery coach. Generate short, powerful motivational quotes for people recovering from addiction. Keep quotes under 100 characters. Be empowering and positive.'
          },
          {
            role: 'user',
            content: `Generate a motivational quote for someone recovering from ${addictionType} addiction.`
          }
        ],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      // Return default message if AI fails
      return new Response(
        JSON.stringify({ 
          quote: 'Remember to take a deep breath. You are stronger than you think.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const quote = data.choices[0]?.message?.content?.trim() || 'Remember to take a deep breath.';

    console.log('Generated quote:', quote);

    return new Response(
      JSON.stringify({ quote }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating quote:', error);
    
    // Return default message on error
    return new Response(
      JSON.stringify({ 
        quote: 'Remember to take a deep breath. Stay strong!' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
