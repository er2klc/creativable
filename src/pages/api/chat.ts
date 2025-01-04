import { supabase } from "@/integrations/supabase/client";

export async function POST(req: Request) {
  const { messages, openaiKey, sessionToken } = await req.json();

  if (!openaiKey) {
    return new Response(JSON.stringify({ error: "OpenAI API Key fehlt" }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { messages },
      headers: {
        'OpenAI-Key': openaiKey,
        'Authorization': `Bearer ${sessionToken}`
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}