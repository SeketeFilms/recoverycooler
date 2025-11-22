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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a compassionate 24/7 AI recovery assistant helping people overcome addiction (gambling or alcohol). Your role is to:

1. Provide emotional support and validate their feelings
2. Help them work through cravings with coping strategies
3. Offer motivational words and encouragement
4. Remind them of their progress and reasons for recovery
5. Suggest healthy alternatives and positive coping mechanisms
6. Be empathetic, non-judgmental, and understanding

Guidelines:
- Keep responses concise but caring (2-4 sentences typically)
- Focus on immediate support during cravings
- Encourage them to reach out to professional help when needed
- Remind them they're not alone
- Use a warm, supportive tone
- Avoid being preachy or overly clinical
- Acknowledge that recovery is not linear

Remember: You're a supportive companion, not a replacement for professional treatment.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || 'I apologize, but I had trouble responding. Please try again.';

    return new Response(
      JSON.stringify({ message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-recovery-chat:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: "I'm having trouble connecting right now. Please try again in a moment."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
