import { supabase } from "@/integrations/supabase/client";

export async function POST(req: Request) {
  try {
    const { messages, openaiKey } = await req.json();

    if (!openaiKey) {
      return new Response(JSON.stringify({ error: "OpenAI API Key fehlt" }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { messages },
      headers: {
        'OpenAI-Key': openaiKey
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}