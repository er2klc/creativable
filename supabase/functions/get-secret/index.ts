import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name } = await req.json();
    
    if (!name) {
      return new Response(
        JSON.stringify({ error: "Secret name is required" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }

    const secretValue = Deno.env.get(name);

    if (!secretValue) {
      // Statt eines Fehlers geben wir einen leeren String zurück
      return new Response(
        JSON.stringify({ [name]: "" }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }

    return new Response(
      JSON.stringify({ [name]: secretValue }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});