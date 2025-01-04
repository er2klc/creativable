import { NextRequest } from 'next/server';
import { supabase } from "@/integrations/supabase/client";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages, settings, sessionToken } = await req.json();

    if (!settings?.openai_api_key) {
      throw new Error("OpenAI API Key fehlt");
    }

    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { messages },
      headers: {
        'OpenAI-Key': settings.openai_api_key,
        'Authorization': `Bearer ${sessionToken}`
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}